import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Outfit } from './outfits/outfit.entity';
import { Feedback } from './feedback/feedback.entity';
import { SurveySession } from './survey/survey-session.entity';
import { SurveyAnswer } from './survey/survey-answer.entity';
import { FeedbackModule } from './feedback/feedback.module';
import { OutfitsModule } from './outfits/outfits.module';
import { SurveyModule } from './survey/survey.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host:     cfg.get('DB_HOST', 'localhost'),
        port:     cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USERNAME', 'postgres'),
        password: cfg.get('DB_PASSWORD', 'Kiabiggn@2026'),
        database: cfg.get('DB_NAME', 'kiabi_feedback'),
        entities: [User, Outfit, Feedback, SurveySession, SurveyAnswer],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        logging: false,
      }),
    }),

    FeedbackModule,
    OutfitsModule,
    SurveyModule,
  ],
})
export class AppModule {}
