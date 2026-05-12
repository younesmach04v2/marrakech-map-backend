import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtUserPayload } from '../auth/auth.types';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: JwtUserPayload): Promise<Array<{ id: string; name: string; ownerId: string; createdAt: string }>> {
    const rows = await this.prisma.workspace.findMany({
      where: user.role === 'ADMIN' ? {} : { ownerId: user.sub },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((w) => ({
      id: w.id,
      name: w.name,
      ownerId: w.ownerId,
      createdAt: w.createdAt.toISOString(),
    }));
  }

  async create(
    user: JwtUserPayload,
    name: string,
    targetOwnerId?: string,
  ): Promise<{ id: string; name: string; ownerId: string; createdAt: string }> {
    const trimmed = (name || '').trim() || 'Nouvelle map';

    if (user.role === 'ADMIN' && targetOwnerId && targetOwnerId !== user.sub) {
      const owner = await this.prisma.user.findUnique({ where: { id: targetOwnerId } });
      if (!owner) throw new NotFoundException('Propriétaire introuvable.');
      if (owner.role === 'ADMIN') {
        throw new ForbiddenException('Impossible de créer une map pour un autre administrateur.');
      }
      const ws = await this.prisma.workspace.create({
        data: { name: trimmed, ownerId: targetOwnerId },
      });
      return { id: ws.id, name: ws.name, ownerId: ws.ownerId, createdAt: ws.createdAt.toISOString() };
    }

    const ownerId = user.sub;
    if (user.role === 'ADMIN') {
      const existing = await this.prisma.workspace.findFirst({
        where: { ownerId },
        orderBy: { createdAt: 'asc' },
      });
      if (existing) {
        return {
          id: existing.id,
          name: existing.name,
          ownerId: existing.ownerId,
          createdAt: existing.createdAt.toISOString(),
        };
      }
      const ws = await this.prisma.workspace.create({
        data: { name: 'Default map', ownerId },
      });
      return { id: ws.id, name: ws.name, ownerId: ws.ownerId, createdAt: ws.createdAt.toISOString() };
    }

    const ws = await this.prisma.workspace.create({
      data: { name: trimmed, ownerId },
    });
    return { id: ws.id, name: ws.name, ownerId: ws.ownerId, createdAt: ws.createdAt.toISOString() };
  }

  async assertAccess(workspaceId: string, user: JwtUserPayload): Promise<void> {
    const ws = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');
    if (user.role !== 'ADMIN' && ws.ownerId !== user.sub) {
      throw new ForbiddenException('Workspace access denied');
    }
  }

  async remove(user: JwtUserPayload, workspaceId: string): Promise<void> {
    await this.assertAccess(workspaceId, user);
    await this.prisma.$transaction(async (tx) => {
      await tx.propertyRecord.deleteMany({ where: { workspaceId } });
      await tx.timelineEvent.deleteMany({ where: { workspaceId } });
      await tx.importBatch.deleteMany({ where: { workspaceId } });
      await tx.workspace.delete({ where: { id: workspaceId } });
    });
  }
}
