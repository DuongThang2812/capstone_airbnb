import { Module } from '@nestjs/common';
import { DatPhongController } from './dat-phong.controller';
import { DatPhongService } from './dat-phong.service';

@Module({
  controllers: [DatPhongController],
  providers: [DatPhongService],
})
export class DatPhongModule {}
