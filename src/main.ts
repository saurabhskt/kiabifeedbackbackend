import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { winstonConfig } from './config/logger.config';
import { WinstonModule } from 'nest-winston';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: WinstonModule.createLogger(winstonConfig),
    });

    app.enableCors({ origin: true, credentials: true });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));

    app.useGlobalInterceptors(new LoggingInterceptor());

    // Serve uploaded audio files at /uploads/*
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

    // Serve built Vite frontend static files (JS/CSS/assets)
    app.useStaticAssets(join(process.cwd(), 'public'));

    // SPA fallback — register directly on Express BEFORE app.listen()
    // This is the most reliable method: bypasses NestJS routing completely.
    const indexPath = join(process.cwd(), 'public', 'index.html');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expressInstance = app.getHttpAdapter().getInstance() as any;

    expressInstance.use((req: any, res: any, next: any) => {
        // Pass API and upload routes to NestJS
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        // All other paths (/, /admin, /survey, etc.) → serve index.html
        if (existsSync(indexPath)) {
            console.log(`[SPA] ${req.method} ${req.path} → index.html`);
            return res.sendFile(indexPath);
        }
        res.status(503).send(
            'Frontend not built. Run: npm run build inside the frontend directory, then restart.',
        );
    });

    const port = process.env.PORT ?? 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`Kiabi Feedback API running on http://0.0.0.0:${port}`);
}

bootstrap();
