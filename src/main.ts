import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {NestExpressApplication} from "@nestjs/platform-express";
import { join } from 'path';
import {winstonConfig} from "./config/logger.config";
import {WinstonModule} from "nest-winston";
import {LoggingInterceptor} from "./interceptors/logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig)
  });


  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
  }));
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });
  app.useStaticAssets(join(process.cwd(), 'public'));

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Kiabi Feedback API running on http://localhost:${port}`);
}

bootstrap();
