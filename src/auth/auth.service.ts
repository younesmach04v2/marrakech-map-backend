import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { JwtUserPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  /** Public self-service registration (CLIENT only). */
  async registerClient(
    username: string,
    password: string,
  ): Promise<{ accessToken: string; user: { id: string; username: string; role: UserRole } }> {
    const u = username.trim();
    if (u.length < 2) {
      throw new BadRequestException('Le nom d’utilisateur doit contenir au moins 2 caractères.');
    }
    if (password.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    try {
      await this.prisma.user.create({
        data: {
          username: u,
          passwordHash,
          role: UserRole.CLIENT,
          isActive: true,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Ce nom d’utilisateur est déjà pris.');
      }
      throw e;
    }
    return this.login(u, password);
  }

  async login(username: string, password: string): Promise<{ accessToken: string; user: { id: string; username: string; role: UserRole } }> {
    const user = await this.validateUser(username, password);
    const payload: JwtUserPayload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }

  async me(userId: string): Promise<{ id: string; username: string; role: UserRole }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, username: user.username, role: user.role };
  }

  async ensureAdminSeed(): Promise<void> {
    let admin = await this.prisma.user.findUnique({ where: { username: 'admin' } });
    if (!admin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      admin = await this.prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@local',
          passwordHash,
          role: UserRole.ADMIN,
          isActive: true,
        },
      });
    }

    const hasWorkspace = await this.prisma.workspace.findFirst({
      where: { ownerId: admin.id },
      select: { id: true },
    });
    if (!hasWorkspace) {
      await this.prisma.workspace.create({
        data: {
          name: 'Default map',
          ownerId: admin.id,
        },
      });
    }
  }
}
