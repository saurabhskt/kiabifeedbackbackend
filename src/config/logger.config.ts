
import { WinstonModuleOptions, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file'; // ⚠️ Required to register the transport
import { join } from 'path';

export const winstonConfig: WinstonModuleOptions = {
    levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
    level: 'debug',
    transports: [
        // 🖥️ Console output (dev friendly)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                nestWinstonModuleUtilities.format.nestLike('KiabiFeedback', { prettyPrint: true }),
            ),
        }),
        // 📁 Daily rotation: All logs
        new winston.transports.DailyRotateFile({
            filename: join(process.cwd(), 'logs', 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d', // Keep logs for 14 days
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        // 📁 Daily rotation: Errors only
        new winston.transports.DailyRotateFile({
            filename: join(process.cwd(), 'logs', 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
    ],
};
