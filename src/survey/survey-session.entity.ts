import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';
import { SurveyAnswer } from './survey-answer.entity';

@Entity('survey_sessions')
export class SurveySession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id', unique: true })
  sessionId: string;

  // Denormalized user profile
  @Column({ name: 'user_name', length: 100 })
  userName: string;

  @Column({ name: 'user_gender', length: 30 })
  userGender: string;

  @Column({ name: 'user_age_group', length: 10 })
  userAgeGroup: string;

  @Column({ name: 'user_employment', length: 20 })
  userEmployment: string;

  @Column({ length: 150, nullable: true, unique: true })
  contact: string;

  @Column({ name: 'income_bracket', length: 20, default: 'not_answered' })
  incomeBracket: string;

  @Column({ name: 'total_answered', default: 0 })
  totalAnswered: number;

  @Column({ name: 'total_skipped', default: 0 })
  totalSkipped: number;

  @Column({ name: 'yes_count', default: 0 })
  yesCount: number;

  @Column({ name: 'nope_count', default: 0 })
  nopeCount: number;

  @Column({ name: 'skipped_card_ids', type: 'text', array: true, default: [] })
  skippedCardIds: string[];

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @OneToMany(() => SurveyAnswer, a => a.session, { cascade: true, eager: false })
  answers: SurveyAnswer[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
