import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outfit } from './outfit.entity';
import { OutfitsService } from './outfits.service';
import { OutfitsController } from './outfits.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Outfit])],
  providers: [OutfitsService],
  controllers: [OutfitsController],
  exports: [OutfitsService],
})
export class OutfitsModule {}
