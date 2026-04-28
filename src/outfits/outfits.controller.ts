import { Controller, Get, Param } from '@nestjs/common';
import { OutfitsService } from './outfits.service';

@Controller('api/outfits')
export class OutfitsController {
  constructor(private readonly service: OutfitsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }
}
