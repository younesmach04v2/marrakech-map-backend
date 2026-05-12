import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PropertyDto } from './properties.types';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string, year?: number): Promise<PropertyDto[]> {
    const rows = await this.prisma.propertyRecord.findMany({
      where: {
        workspaceId,
        ...(typeof year === 'number' ? { timelineYear: year } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => ({
      id: this.decodeScopedId(workspaceId, r.id),
      type: r.type,
      title: r.title,
      lat: r.lat,
      lng: r.lng,
      price: r.price,
      initialPrice: r.initialPrice,
      owned: r.owned,
      sold: r.sold,
      surface: r.surface,
      rooms: r.rooms,
      desc: r.desc,
      zones: r.zones,
    }));
  }

  async replace(workspaceId: string, year: number, properties: PropertyDto[]): Promise<{ saved: number }> {
    await this.prisma.$transaction(async (tx) => {
      await tx.propertyRecord.deleteMany({ where: { timelineYear: year, workspaceId } });
      if (properties.length > 0) {
        await tx.propertyRecord.createMany({
          data: properties.map((p) => ({
            id: this.encodeScopedId(workspaceId, p.id),
            type: p.type,
            title: p.title,
            lat: p.lat,
            lng: p.lng,
            price: p.price,
            initialPrice: p.initialPrice,
            owned: !!p.owned,
            sold: !!p.sold,
            surface: p.surface,
            rooms: p.rooms === null ? null : Number(p.rooms),
            desc: p.desc ?? '',
            zones: Array.isArray(p.zones) ? p.zones : [],
            timelineYear: year,
            workspaceId,
          })),
        });
      }
    });
    return { saved: properties.length };
  }

  private encodeScopedId(workspaceId: string, rawId: string): string {
    return `${workspaceId}::${rawId}`;
  }

  private decodeScopedId(workspaceId: string, dbId: string): string {
    const prefix = `${workspaceId}::`;
    return dbId.startsWith(prefix) ? dbId.slice(prefix.length) : dbId;
  }
}
