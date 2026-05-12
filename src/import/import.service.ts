import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUserPayload } from '../auth/auth.types';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ImportedProperty, LocalStorageImportPayload } from './import.types';

@Injectable()
export class ImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async importFromLocalStorage(
    payload: LocalStorageImportPayload,
    workspaceId: string,
    user: JwtUserPayload,
  ): Promise<{
    batchId: string;
    insertedProperties: number;
    yearsDetected: number[];
  }> {
    await this.workspacesService.assertAccess(workspaceId, user);
    const properties = this.collectProperties(payload);
    const yearsDetected = this.detectYears(payload);

    const batch = await this.prisma.importBatch.create({
      data: {
        source: payload.source ?? 'angular-localstorage',
        properties: properties.length,
        userZones: Array.isArray(payload.userZones) ? payload.userZones.length : 0,
        customPlaces: Array.isArray(payload.customPlaces) ? payload.customPlaces.length : 0,
        customDots: Array.isArray(payload.customDots) ? payload.customDots.length : 0,
        snapshot: payload as any,
        workspaceId,
      },
    });

    if (properties.length > 0) {
      for (const item of properties) {
        const scopedId = this.encodeScopedId(workspaceId, item.id);
        await this.prisma.propertyRecord.upsert({
          where: { id: scopedId },
          update: {
            title: item.title,
            type: item.type,
            lat: item.lat,
            lng: item.lng,
            price: item.price,
            initialPrice: item.initialPrice ?? item.price,
            surface: item.surface,
            rooms: item.rooms,
            desc: item.desc ?? '',
            owned: !!item.owned,
            sold: !!item.sold,
            zones: item.zones ?? [],
            timelineYear: item.timelineYear,
            sourceBatchId: batch.id,
            workspaceId,
          },
          create: {
            id: scopedId,
            title: item.title,
            type: item.type,
            lat: item.lat,
            lng: item.lng,
            price: item.price,
            initialPrice: item.initialPrice ?? item.price,
            surface: item.surface,
            rooms: item.rooms,
            desc: item.desc ?? '',
            owned: !!item.owned,
            sold: !!item.sold,
            zones: item.zones ?? [],
            timelineYear: item.timelineYear,
            sourceBatchId: batch.id,
            workspaceId,
          },
        });
      }
    }

    return {
      batchId: batch.id,
      insertedProperties: properties.length,
      yearsDetected,
    };
  }

  private encodeScopedId(workspaceId: string, rawId: string): string {
    return `${workspaceId}::${rawId}`;
  }

  private collectProperties(payload: LocalStorageImportPayload): Array<ImportedProperty & { timelineYear: number | null }> {
    const rows: Array<ImportedProperty & { timelineYear: number | null }> = [];

    if (Array.isArray(payload.properties)) {
      for (const p of payload.properties) rows.push({ ...p, timelineYear: payload.timelineYear ?? null });
    }

    if (payload.propertiesByYear && typeof payload.propertiesByYear === 'object') {
      for (const [yearKey, items] of Object.entries(payload.propertiesByYear)) {
        const year = Number(yearKey);
        const timelineYear = Number.isFinite(year) ? year : null;
        if (!Array.isArray(items)) continue;
        for (const p of items) rows.push({ ...p, timelineYear });
      }
    }

    return rows.filter((p) => !!p.id && !!p.title);
  }

  private detectYears(payload: LocalStorageImportPayload): number[] {
    if (!payload.propertiesByYear || typeof payload.propertiesByYear !== 'object') return [];
    return Object.keys(payload.propertiesByYear)
      .map((k) => Number(k))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
  }
}
