import { Module } from '@nestjs/common';
import { PhongThueController } from './phong-thue.controller';
import { PhongThueService } from './phong-thue.service';

@Module({
  controllers: [PhongThueController],
  providers: [PhongThueService],
})
export class PhongThueModule {}
