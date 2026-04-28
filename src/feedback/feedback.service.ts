import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto, BulkFeedbackDto } from './feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly repo: Repository<Feedback>,
  ) {}

  async create(dto: CreateFeedbackDto): Promise<Feedback> {
    const { userProfile, outfitId, vote, dwellTimeMs } = dto;
    const fb = this.repo.create({
      outfitId,
      vote: vote as 'love' | 'nope',
      dwellTimeMs: dwellTimeMs ?? 0,
      userName: userProfile.name,
      userGender: userProfile.gender,
      userAgeGroup: userProfile.ageGroup,
      userEmployment: userProfile.employmentStatus,
    });
    return this.repo.save(fb);
  }

  async createBulk(dto: BulkFeedbackDto): Promise<{ saved: number }> {
    const entities = dto.feedbacks.map(d => {
      const { userProfile, outfitId, vote, dwellTimeMs } = d;
      return this.repo.create({
        outfitId,
        vote: vote as 'love' | 'nope',
        dwellTimeMs: dwellTimeMs ?? 0,
        userName: userProfile.name,
        userGender: userProfile.gender,
        userAgeGroup: userProfile.ageGroup,
        userEmployment: userProfile.employmentStatus,
      });
    });
    await this.repo.save(entities);
    return { saved: entities.length };
  }

  async getStats(outfitId?: number) {
    const qb = this.repo.createQueryBuilder('f')
      .select('f.outfit_id', 'outfitId')
      .addSelect('f.vote', 'vote')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(f.dwell_time_ms)', 'avgDwell')
      .groupBy('f.outfit_id')
      .addGroupBy('f.vote');

    if (outfitId) qb.where('f.outfit_id = :outfitId', { outfitId });

    return qb.getRawMany();
  }

  async getDemographicBreakdown(outfitId: number) {
    return this.repo.createQueryBuilder('f')
      .select('f.user_gender', 'gender')
      .addSelect('f.user_age_group', 'ageGroup')
      .addSelect('f.user_employment', 'employment')
      .addSelect('f.vote', 'vote')
      .addSelect('COUNT(*)', 'count')
      .where('f.outfit_id = :outfitId', { outfitId })
      .groupBy('f.user_gender')
      .addGroupBy('f.user_age_group')
      .addGroupBy('f.user_employment')
      .addGroupBy('f.vote')
      .getRawMany();
  }
}
