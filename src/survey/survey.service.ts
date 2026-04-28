import {Injectable, ConflictException, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveySession } from './survey-session.entity';
import { SurveyAnswer } from './survey-answer.entity';
import { SubmitSurveyDto } from './survey.dto';

@Injectable()
export class SurveyService {

  private readonly logger = new Logger(SurveyService.name);
  constructor(
    @InjectRepository(SurveySession)
    private readonly sessionRepo: Repository<SurveySession>,
    @InjectRepository(SurveyAnswer)
    private readonly answerRepo: Repository<SurveyAnswer>,
  ) {}

  async submit(dto: SubmitSurveyDto): Promise<{ id: number; sessionId: string }> {
    this.logger.log('Creating new survey session', { payload: JSON.stringify(dto) });
    // Check duplicate sessionId (idempotency)
    const existingSession = await this.sessionRepo.findOne({
      where: { sessionId: dto.sessionId },
    });
    if (existingSession) {
      return { id: existingSession.id, sessionId: existingSession.sessionId };
    }



    const { userProfile, answers, skippedCardIds, incomeBracket, completedAt } = dto;
    const yesCount  = answers.filter(a => a.answer === 'yes').length;
    const nopeCount = answers.filter(a => a.answer === 'nope').length;

    const session = this.sessionRepo.create({
      sessionId:      dto.sessionId,
      contact:        dto.userProfile.contact,
      userName:       userProfile.name,
      userGender:     userProfile.gender,
      userAgeGroup:   userProfile.ageGroup,
      userEmployment: userProfile.employmentStatus,
      incomeBracket,
      totalAnswered:  answers.length,
      totalSkipped:   0,
      yesCount,
      nopeCount,
      skippedCardIds,
      completedAt: completedAt ? new Date(completedAt) : new Date(),
    });

    const saved = await this.sessionRepo.save(session);

    const answerEntities = answers.map(a =>
        this.answerRepo.create({
          sessionId:      saved.sessionId,
          cardId:         a.cardId,
          section:        a.section,
          statement:      a.statement,
          answer:         a.answer,
          dwellTimeMs:    a.dwellTimeMs,
          userGender:     userProfile.gender,
          userAgeGroup:   userProfile.ageGroup,
          userEmployment: userProfile.employmentStatus,
        })
    );

    await this.answerRepo.save(answerEntities);

    return { id: saved.id, sessionId: saved.sessionId };
  }

  /** Overall stats — total sessions, yes/nope rates per card */
  async getStats() {
    const totalSessions = await this.sessionRepo.count();

    const cardStats = await this.answerRepo
      .createQueryBuilder('a')
      .select('a.card_id', 'cardId')
      .addSelect('a.section', 'section')
      .addSelect('COUNT(*)', 'total')
      .addSelect(`SUM(CASE WHEN a.answer = 'yes' THEN 1 ELSE 0 END)`, 'yesCount')
      .addSelect(`ROUND(SUM(CASE WHEN a.answer = 'yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1)`, 'yesRate')
      .addSelect('ROUND(AVG(a.dwell_time_ms))', 'avgDwellMs')
      .groupBy('a.card_id')
      .addGroupBy('a.section')
      .orderBy('a.section')
      .getRawMany();

    const sectionStats = await this.answerRepo
      .createQueryBuilder('a')
      .select('a.section', 'section')
      .addSelect('COUNT(*)', 'total')
      .addSelect(`ROUND(SUM(CASE WHEN a.answer = 'yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1)`, 'yesRate')
      .groupBy('a.section')
      .getRawMany();

    const incomeDist = await this.sessionRepo
      .createQueryBuilder('s')
      .select('s.income_bracket', 'bracket')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.income_bracket')
      .getRawMany();

    const demographicStats = await this.answerRepo
      .createQueryBuilder('a')
      .select('a.user_gender', 'gender')
      .addSelect('a.user_age_group', 'ageGroup')
      .addSelect(`ROUND(SUM(CASE WHEN a.answer = 'yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1)`, 'yesRate')
      .addSelect('COUNT(*)', 'total')
      .groupBy('a.user_gender')
      .addGroupBy('a.user_age_group')
      .getRawMany();

    return { totalSessions, cardStats, sectionStats, incomeDist, demographicStats };
  }

  /** Per-card breakdown filtered by demographic */
  async getCardBreakdown(cardId: string) {
    return this.answerRepo
      .createQueryBuilder('a')
      .select('a.answer', 'answer')
      .addSelect('a.user_gender', 'gender')
      .addSelect('a.user_age_group', 'ageGroup')
      .addSelect('a.user_employment', 'employment')
      .addSelect('COUNT(*)', 'count')
      .where('a.card_id = :cardId', { cardId })
      .groupBy('a.answer')
      .addGroupBy('a.user_gender')
      .addGroupBy('a.user_age_group')
      .addGroupBy('a.user_employment')
      .getRawMany();
  }

  /** Most skipped cards — shows where branching fired most */
  async getSkipStats() {
    return this.sessionRepo.query(`
      SELECT
        unnest(skipped_card_ids) AS card_id,
        COUNT(*)                 AS skip_count
      FROM survey_sessions
      GROUP BY card_id
      ORDER BY skip_count DESC
    `);
  }
  async checkContact(contact: string): Promise<{
    completed: boolean;
    userName?: string;
    summary?: {
      totalAnswered: number;
      totalSkipped: number;
      yesCount: number;
      nopeCount: number;
    };
  }> {
    const session = await this.sessionRepo.findOne({
      where: { contact },
    });

    if (!session) return { completed: false };

    return {
      completed: true,
      userName: session.userName,
      summary: {
        totalAnswered: session.totalAnswered,
        totalSkipped:  session.totalSkipped,
        yesCount:      session.yesCount,
        nopeCount:     session.nopeCount,
      },
    };
  }
  async saveComment(
      sessionId: string,
      text: string | null,
      audioFilePath: string | null,
      audioMimeType: string | null,
  ): Promise<void> {
    await this.sessionRepo.update(
        { sessionId },
        {
          commentText:    text ?? null,
          audioFilePath:  audioFilePath ?? null,
          audioMimeType:  audioMimeType ?? null,
        },
    );
  }
}
