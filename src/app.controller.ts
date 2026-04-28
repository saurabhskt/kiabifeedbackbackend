import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {
    @Get('*')
    serveApp(@Req() req: Request, @Res() res: Response) {
        if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
            res.status(404).json({ message: 'Not found' });
            return;
        }

        const indexPath = join(process.cwd(), 'public', 'index.html');

        // debug — log the path so you can confirm it exists
        console.log('Serving index from:', indexPath, '| exists:', existsSync(indexPath));

        res.sendFile(indexPath);
    }
}
