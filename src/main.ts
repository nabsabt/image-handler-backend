import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Load .env before doing anything else
  dotenv.config({ path: join(__dirname, '../.env') });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors({ origin: '*', methods: ['GET', 'POST', 'PUT'] });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  Logger.log(`Environment variable file: ${process.env.NAME_OF_FILE}`);

  Logger.log(
    `Application is running on: http://${process.env.SERVER_URL}:${process.env.PORT ?? 3000}/${globalPrefix}. Status: ${process.env.NODE_ENV}`,
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
