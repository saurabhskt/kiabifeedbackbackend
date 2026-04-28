import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('outfits')
export class Outfit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 80 })
  category: string;

  @Column({ length: 50 })
  tag: string;

  @Column({ length: 10 })
  emoji: string;

  @Column({ name: 'bg_color', length: 20 })
  bgColor: string;

  @Column({ length: 200 })
  description: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
