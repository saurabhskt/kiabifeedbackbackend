import {Controller, Post, Get, Body, Param, Query} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { SubmitSurveyDto } from './survey.dto';

@Controller('api/survey')
export class SurveyController {
  constructor(private readonly service: SurveyService) {}

  @Post()
  submit(@Body() dto: SubmitSurveyDto) {
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
}
