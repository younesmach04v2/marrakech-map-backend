import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUserPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { TimelineService } from './timeline.service';

@UseGuards(JwtAuthGuard)
@Controller('api/workspaces/:workspaceId/timeline')
export class TimelineController {
  constructor(
    private readonly timelineService: TimelineService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Get()
  async list(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<Array<{ id: string; year: number; title: string; payload: unknown }>> {
    await this.workspacesService.assertAccess(workspaceId, user);
    return this.timelineService.list(workspaceId);
  }

  @Post()
  async create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: JwtUserPayload,
    @Body() body: { year?: number; title?: string; payload?: unknown },
  ): Promise<{ id: string; year: number; title: string; payload: unknown }> {
    await this.workspacesService.assertAccess(workspaceId, user);
    return this.timelineService.create(workspaceId, {
      year: body.year ?? new Date().getFullYear(),
      title: body.title ?? 'Event',
      payload: body.payload,
    });
  }
}
