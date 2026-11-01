import { Module } from '@nestjs/common';
import { ViTriController } from './vi-tri.controller';
import { ViTriService } from './vi-tri.service';

@Module({
  controllers: [ViTriController],
  providers: [ViTriService],
})
export class ViTriModule {}
