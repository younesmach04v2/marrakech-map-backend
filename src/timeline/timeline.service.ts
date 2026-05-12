import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string): Promise<Array<{ id: string; year: number; title: string; payload: unknown }>> {
    const rows = await this.prisma.timelineEvent.findMany({
      where: { workspaceId },
      orderBy: [{ year: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((r) => ({ id: r.id, year: r.year, title: r.title, payload: r.payload as unknown }));
  }

  async create(workspaceId: string, body: { year: number; title: string; payload?: unknown }): Promise<{ id: string; year: number; title: string; payload: unknown }> {
    const row = await this.prisma.timelineEvent.create({
      data: {
        workspaceId,
        year: Number(body.year),
        title: body.title ?? 'Event',
        payload: (body.payload ?? null) as any,
      },
    });
    return { id: row.id, year: row.year, title: row.title, payload: row.payload as unknown };
  }
}
