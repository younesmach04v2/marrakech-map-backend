import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUserPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImportService } from './import.service';

@UseGuards(JwtAuthGuard)
@Controller('api/import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Get('health')
  health(): { ok: true } {
    return { ok: true };
  }

  @Post('localstorage')
  async importLocalStorage(
    @CurrentUser() user: JwtUserPayload,
    @Query('workspaceId') workspaceId: string,
    @Body() payload: Record<string, unknown>,
  ): Promise<{ batchId: string; insertedProperties: number; yearsDetected: number[] }> {
    if (!workspaceId) throw new BadRequestException('workspaceId is required');
    return this.importService.importFromLocalStorage(payload as any, workspaceId, user);
  }
}
