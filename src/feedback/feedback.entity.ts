import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Outfit } from '../outfits/outfit.entity';

export type VoteType = 'love' | 'nope';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => Outfit, { eager: false })
  @JoinColumn({ name: 'outfit_id' })
  outfit: Outfit;

  @Column({ name: 'outfit_id' })
  outfitId: number;

  @Column({ type: 'varchar', length: 10 })
  vote: VoteType;

  @Column({ name: 'dwell_time_ms', default: 0 })
  dwellTimeMs: number;

  // Denormalized user profile for fast analytics queries
  @Column({ name: 'user_name', length: 100, nullable: true })
  userName: string;

  @Column({ name: 'user_gender', length: 30, nullable: true })
  userGender: string;

  @Column({ name: 'user_age_group', length: 10, nullable: true })
  userAgeGroup: string;

  @Column({ name: 'user_employment', length: 20, nullable: true })
  userEmployment: string;

  @CreateDateColumn({ name: 'voted_at' })
  votedAt: Date;
}
