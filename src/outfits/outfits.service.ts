import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outfit } from './outfit.entity';

const SEED_OUTFITS = [
  { name: 'Floral midi dress',     category: 'Dresses',  tag: 'NEW DROP',    emoji: '👗', bgColor: '#993556', description: 'Spring collection · XS–XL' },
  { name: 'Oversized trench coat', category: 'Jackets',  tag: 'BEST SELLER', emoji: '🧥', bgColor: '#633806', description: 'Autumn essentials · Camel / Navy' },
  { name: 'Wide-leg cargo pants',  category: 'Bottoms',  tag: 'TRENDING',    emoji: '👖', bgColor: '#085041', description: 'Street style · 6 colours' },
  { name: 'Washed linen shirt',    category: 'Tops',     tag: 'SUMMER EDIT', emoji: '👕', bgColor: '#0C447C', description: 'Summer basics · Unisex fit' },
  { name: 'Chunky knit co-ord',    category: 'Sets',     tag: 'COMING SOON', emoji: '🧣', bgColor: '#3C3489', description: 'Winter edit · Oat / Sage' },
  { name: 'Satin slip skirt',      category: 'Bottoms',  tag: 'NEW',         emoji: '👘', bgColor: '#712B13', description: 'Evening ready · 4 colours' },
  { name: 'Denim overshirt',       category: 'Tops',     tag: 'BACK AGAIN',  emoji: '🥻', bgColor: '#0F6E56', description: 'All-day layering piece' },
];

@Injectable()
export class OutfitsService implements OnModuleInit {
  constructor(
    @InjectRepository(Outfit)
    private readonly repo: Repository<Outfit>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.save(SEED_OUTFITS.map(o => this.repo.create(o)));
      console.log('Seeded outfits table with', SEED_OUTFITS.length, 'outfits');
    }
  }

  findAll(): Promise<Outfit[]> {
    return this.repo.find({ where: { isActive: true }, order: { id: 'ASC' } });
  }

  findOne(id: number): Promise<Outfit> {
    return this.repo.findOneBy({ id });
  }
}
