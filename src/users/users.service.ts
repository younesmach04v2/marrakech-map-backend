import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Array<{ id: string; username: string; role: UserRole; isActive: boolean }>> {
    const rows = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map((u) => ({ id: u.id, username: u.username, role: u.role, isActive: u.isActive }));
  }

  async create(input: { username: string; password: string; role?: UserRole }): Promise<{ id: string; username: string; role: UserRole; isActive: boolean }> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        passwordHash,
        role: input.role ?? UserRole.CLIENT,
        isActive: true,
      },
    });
    return { id: user.id, username: user.username, role: user.role, isActive: user.isActive };
  }

  async update(
    currentAdminId: string,
    id: string,
    body: { isActive?: boolean; password?: string },
  ): Promise<{ id: string; username: string; role: UserRole; isActive: boolean }> {
    if (typeof body.isActive === 'boolean' && body.isActive === false && id === currentAdminId) {
      throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte.');
    }
    if (body.password !== undefined) {
      if (body.password.length < 6) {
        throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères.');
      }
    }
    const data: { isActive?: boolean; passwordHash?: string } = {};
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;
    if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10);
    if (Object.keys(data).length === 0) {
      const u = await this.prisma.user.findUnique({ where: { id } });
      if (!u) throw new NotFoundException();
      return { id: u.id, username: u.username, role: u.role, isActive: u.isActive };
    }
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      return { id: user.id, username: user.username, role: user.role, isActive: user.isActive };
    } catch {
      throw new NotFoundException();
    }
  }

  async remove(currentAdminId: string, targetId: string): Promise<void> {
    if (currentAdminId === targetId) {
      throw new BadRequestException('Impossible de supprimer votre propre compte.');
    }
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException();
    if (target.role === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({ where: { role: UserRole.ADMIN } });
      if (adminCount <= 1) {
        throw new BadRequestException('Impossible de supprimer le dernier administrateur.');
      }
    }
    await this.prisma.user.delete({ where: { id: targetId } });
  }
}
