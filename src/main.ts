import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import {join} from 'path';
import {winstonConfig} from './config/logger.config';
import {WinstonModule} from 'nest-winston';
import {LoggingInterceptor} from './interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: WinstonModule.createLogger(winstonConfig),
    });

    // Allow all origins in production (tighten later if needed)
    app.enableCors({origin: true, credentials: true});

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));

    app.useGlobalInterceptors(new LoggingInterceptor());

    // Serve uploaded audio files at /uploads/*
    app.useStaticAssets(join(process.cwd(), 'uploads'), {prefix: '/uploads'});

    // Serve the built Vite frontend from /public
    // Must come BEFORE the catch-all controller route
    app.useStaticAssets(join(process.cwd(), 'public'));

    const port = process.env.PORT ?? 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`Kiabi Feedback API running on http://0.0.0.0:${port}`);
}

bootstrap();
