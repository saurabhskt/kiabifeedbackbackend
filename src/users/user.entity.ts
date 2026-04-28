import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type AgeGroup = '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
export type EmploymentStatus = 'working' | 'non_working' | 'student' | 'retired';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 30 })
  gender: Gender;

  @Column({ name: 'age_group', type: 'varchar', length: 10 })
  ageGroup: AgeGroup;

  @Column({ name: 'employment_status', type: 'varchar', length: 20 })
  employmentStatus: EmploymentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
