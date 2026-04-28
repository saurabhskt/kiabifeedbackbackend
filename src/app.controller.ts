import { Controller, Get, All, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {

    /**
     * Catch-all: serve index.html for every non-API GET request.
     * NestJS v10 requires the wildcard pattern '*' written as '(.*)' or
     * a named wildcard '*splat' — using the path parameter form is safest.
     */
    @Get('*splat')
    serveApp(@Req() req: Request, @Res() res: Response) {
        // Let the API and upload routes fall through normally
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            res.status(404).json({ message: `Cannot GET ${req.path}`, error: 'Not Found', statusCode: 404 });
            return;
        }

        const indexPath = join(process.cwd(), 'public', 'index.html');
        console.log(`[AppController] ${req.path} → ${indexPath} (exists: ${existsSync(indexPath)})`);

        if (!existsSync(indexPath)) {
            res.status(500).send('Frontend not built. Run "npm run build" in the frontend directory.');
            return;
        }

        res.sendFile(indexPath);
    }
}
