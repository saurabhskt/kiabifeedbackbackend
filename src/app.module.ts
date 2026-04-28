import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SurveySession } from './survey/survey-session.entity';
import { SurveyAnswer } from './survey/survey-answer.entity';

import { SurveyModule } from './survey/survey.module';
import {validate} from "./env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true,validate}),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host:     cfg.get('DB_HOST'),
        port:     cfg.get<number>('DB_PORT'),
        username: cfg.get('DB_USERNAME', ),
        password: cfg.get('DB_PASSWORD', ),
        database: cfg.get('DB_NAME', ),
        entities: [ SurveySession, SurveyAnswer],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        logging: false,
      }),
    }),


    SurveyModule,
  ],
})
export class AppModule {}
