import { BadRequestException, Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUserPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { PropertiesService } from './properties.service';

@UseGuards(JwtAuthGuard)
@Controller('api/properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: JwtUserPayload,
    @Query('workspaceId') workspaceId: string,
    @Query('year') year?: string,
  ): Promise<any[]> {
    if (!workspaceId) throw new BadRequestException('workspaceId is required');
    await this.workspacesService.assertAccess(workspaceId, user);
    const parsed = typeof year === 'string' ? Number(year) : undefined;
    return this.propertiesService.list(workspaceId, Number.isFinite(parsed as number) ? parsed : undefined);
  }

  @Put()
  async replace(
    @CurrentUser() user: JwtUserPayload,
    @Query('workspaceId') workspaceId: string,
    @Query('year') year: string,
    @Body() body: { properties?: any[] },
  ): Promise<{ saved: number }> {
    if (!workspaceId) throw new BadRequestException('workspaceId is required');
    await this.workspacesService.assertAccess(workspaceId, user);
    const parsedYear = Number(year);
    if (!Number.isFinite(parsedYear)) {
      return { saved: 0 };
    }
    return this.propertiesService.replace(workspaceId, parsedYear, Array.isArray(body?.properties) ? body.properties : []);
  }
}
