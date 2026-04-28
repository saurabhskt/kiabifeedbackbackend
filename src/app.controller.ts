import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {

    @Get('*splat')
    serveApp(@Req() req: Request, @Res() res: Response) {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            res.status(404).json({
                message: `Cannot GET ${req.path}`,
                error: 'Not Found',
                statusCode: 404,
            });
            return;
        }

        const indexPath = join(process.cwd(), 'public', 'index.html');
        console.log(`[SPA] serving ${req.path} → ${indexPath} (exists: ${existsSync(indexPath)})`);

        if (!existsSync(indexPath)) {
            res.status(500).send('Frontend not built. Run npm run build in the frontend folder.');
            return;
        }

        res.sendFile(indexPath);
    }
}
