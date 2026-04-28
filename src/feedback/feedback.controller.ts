import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, BulkFeedbackDto } from './feedback.dto';

@Controller('api/feedback')
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Post()
  create(@Body() dto: CreateFeedbackDto) {
    return this.service.create(dto);
  }

  @Post('bulk')
  createBulk(@Body() dto: BulkFeedbackDto) {
    return this.service.createBulk(dto);
  }

  @Get('stats')
  getStats(@Query('outfitId') outfitId?: string) {
    return this.service.getStats(outfitId ? Number(outfitId) : undefined);
  }

  @Get('stats/:outfitId/demographics')
  getDemographics(@Param('outfitId') outfitId: string) {
    return this.service.getDemographicBreakdown(Number(outfitId));
  }
}
