import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ImportModule } from './import/import.module';
import { PropertiesModule } from './properties/properties.module';
import { TimelineModule } from './timeline/timeline.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [AuthModule, UsersModule, WorkspacesModule, TimelineModule, ImportModule, PropertiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
