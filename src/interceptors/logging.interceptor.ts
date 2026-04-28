// src/interceptors/logging.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, query, body, ip } = req;
        const startTime = Date.now();

        this.logger.log(`IN  → ${method} ${url}`, {
            method, url, query, body: this.sanitizePayload(body), ip,
        });

        return next.handle().pipe(
            tap((data) => {
                const res = context.switchToHttp().getResponse();
                const duration = Date.now() - startTime;
                this.logger.log(`OUT ← ${method} ${url} [${res.statusCode}] (${duration}ms)`, {
                    method, url, statusCode: res.statusCode, duration, responseData: this.sanitizePayload(data),
                });
            }),
            catchError((err) => {
                const duration = Date.now() - startTime;
                this.logger.error(`ERR → ${method} ${url} (${duration}ms)`, {
                    method, url, statusCode: err.status || 500, duration, error: err.message, stack: err.stack,
                });
                return throwError(() => err);
            }),
        );
    }

    // 🔒 Remove sensitive/large fields before logging
    private sanitizePayload(payload: any): any {
        if (!payload || typeof payload !== 'object') return payload;
        const clean = { ...payload };
        delete clean.password;
        delete clean.token;
        delete clean.authorization;
        // Truncate large arrays/objects to prevent log bloat
        return JSON.stringify(clean).length > 2000 ? '[TRUNCATED: Large Payload]' : clean;
    }
}
