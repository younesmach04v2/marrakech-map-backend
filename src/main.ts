import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = (process.env.FRONTEND_URL ?? 'http://localhost:4200,http://127.0.0.1:4200')
    .split(/[\n,]/)
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) {
        callback(null, true);
        return;
      }
      if (origins.includes(requestOrigin)) {
        callback(null, requestOrigin);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);
  if (process.env.SEED_ADMIN_ON_BOOT !== 'false') {
    const auth = app.get(AuthService);
    await auth.ensureAdminSeed();
  }
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
