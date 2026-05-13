import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = (process.env.FRONTEND_URL ?? 'http://localhost:4200,http://127.0.0.1:4200')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);
  if (process.env.SEED_ADMIN_ON_BOOT === 'true') {
    const auth = app.get(AuthService);
    await auth.ensureAdminSeed();
  }
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
