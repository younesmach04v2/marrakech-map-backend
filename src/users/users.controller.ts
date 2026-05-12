import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { JwtUserPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(): Promise<Array<{ id: string; username: string; role: UserRole; isActive: boolean }>> {
    return this.usersService.list();
  }

  @Post()
  async create(
    @Body() body: { username?: string; password?: string; role?: UserRole },
  ): Promise<{ id: string; username: string; role: UserRole; isActive: boolean }> {
    return this.usersService.create({
      username: body.username ?? '',
      password: body.password ?? 'changeme123',
      role: body.role ?? UserRole.CLIENT,
    });
  }

  @Patch(':id')
  async patch(
    @CurrentUser() admin: JwtUserPayload,
    @Param('id') id: string,
    @Body() body: { isActive?: boolean; password?: string },
  ): Promise<{ id: string; username: string; role: UserRole; isActive: boolean }> {
    return this.usersService.update(admin.sub, id, body);
  }

  @Delete(':id')
  async remove(@CurrentUser() admin: JwtUserPayload, @Param('id') id: string): Promise<{ deleted: boolean }> {
    await this.usersService.remove(admin.sub, id);
    return { deleted: true };
  }
}
