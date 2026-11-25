import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { AppConfig } from './app.config.provider';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/afisha');
  app.enableCors();

  const { port } = app.get<AppConfig>('CONFIG');
  await app.listen(port);
}

void bootstrap();
