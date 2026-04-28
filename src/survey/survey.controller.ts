import {
    Controller, Post, Get, Body, Param, Query,
    UseInterceptors, BadRequestException, UploadedFile, Logger,
} from '@nestjs/common';
import {SurveyService} from './survey.service';
import {SubmitSurveyDto} from './survey.dto';
import {FileInterceptor} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {extname, join} from 'path';
import {existsSync, mkdirSync} from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'audio');
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, {recursive: true});

@Controller('api/survey')
export class SurveyController {
    private readonly logger = new Logger(SurveyController.name);

    constructor(private readonly service: SurveyService) {
    }

    @Post()
    submit(@Body() dto: SubmitSurveyDto) {
        this.logger.log('Received POST /survey', {dto});
        return this.service.submit(dto);
    }

    @Get('stats')
    getStats() {
        return this.service.getStats();
    }

    @Get('stats/skips')
    getSkipStats() {
        return this.service.getSkipStats();
    }

    @Get('stats/card/:cardId')
    getCardBreakdown(@Param('cardId') cardId: string) {
        return this.service.getCardBreakdown(cardId);
    }

    @Get('check')
    checkContact(@Query('contact') contact: string) {
        return this.service.checkContact(contact);
    }

    /** Admin — all survey_sessions rows */
    @Get('admin/sessions')
    getAllSessions() {
        return this.service.getAllSessions();
    }

    /** Admin — all survey_answers rows */
    @Get('admin/answers')
    getAllAnswers() {
        return this.service.getAllAnswers();
    }

    @Post(':sessionId/comment')
    @UseInterceptors(FileInterceptor('audio', {
        storage: diskStorage({
            destination: UPLOAD_DIR,
            filename: (_req, file, cb) => {
                const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                cb(null, `${unique}${extname(file.originalname)}`);
            },
        }),
        limits: {fileSize: 10 * 1024 * 1024},
        fileFilter: (_req, file, cb) => {
            const allowed = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg'];
            if (allowed.includes(file.mimetype)) cb(null, true);
            else cb(new BadRequestException('Invalid audio format'), false);
        },
    }))
    async saveComment(
        @Param('sessionId') sessionId: string,
        @Body('text') text: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const audioPath = file ? join('uploads', 'audio', file.filename) : null;
        await this.service.saveComment(sessionId, text ?? null, audioPath, file?.mimetype ?? null);
        return {saved: true};
    }
}
