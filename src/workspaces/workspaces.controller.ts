import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUserPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspacesService } from './workspaces.service';

@UseGuards(JwtAuthGuard)
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  async list(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<Array<{ id: string; name: string; ownerId: string; createdAt: string }>> {
    return this.workspacesService.list(user);
  }

  @Post()
  async create(
    @CurrentUser() user: JwtUserPayload,
    @Body() body: { name?: string; ownerId?: string },
  ): Promise<{ id: string; name: string; ownerId: string; createdAt: string }> {
    return this.workspacesService.create(user, body.name ?? 'Default map', body.ownerId);
  }

  @Delete(':workspaceId')
  async remove(
    @CurrentUser() user: JwtUserPayload,
    @Param('workspaceId') workspaceId: string,
  ): Promise<{ deleted: boolean }> {
    await this.workspacesService.remove(user, workspaceId);
    return { deleted: true };
  }
}
