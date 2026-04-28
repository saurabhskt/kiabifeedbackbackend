import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { SurveySession } from './survey-session.entity';

@Entity('survey_answers')
export class SurveyAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SurveySession, s => s.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id', referencedColumnName: 'sessionId' })
  session: SurveySession;

  @Column({ name: 'session_id' })
  sessionId: string;

  @Column({ name: 'card_id', length: 10 })
  cardId: string;

  @Column({ length: 60 })
  section: string;

  @Column({ type: 'text' })
  statement: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ name: 'dwell_time_ms', default: 0 })
  dwellTimeMs: number;

  // Denormalized for easy filtering in analytics queries
  @Column({ name: 'user_gender', length: 30, nullable: true })
  userGender: string;

  @Column({ name: 'user_age_group', length: 10, nullable: true })
  userAgeGroup: string;

  @Column({ name: 'user_employment', length: 20, nullable: true })
  userEmployment: string;

  @CreateDateColumn({ name: 'answered_at' })
  answeredAt: Date;
}
