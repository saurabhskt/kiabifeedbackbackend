import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveySession } from './survey-session.entity';
import { SurveyAnswer } from './survey-answer.entity';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SurveySession, SurveyAnswer])],
  providers: [SurveyService],
  controllers: [SurveyController],
})
export class SurveyModule {}
