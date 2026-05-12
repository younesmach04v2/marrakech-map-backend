import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [TimelineController],
  providers: [TimelineService, PrismaService],
})
export class TimelineModule {}
