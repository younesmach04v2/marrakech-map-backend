import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';

@Module({
  imports: [WorkspacesModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, PrismaService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
