import { Module } from '@nestjs/common';
import { BinhLuanController } from './binh-luan.controller';
import { BinhLuanService } from './binh-luan.service';

@Module({
  controllers: [BinhLuanController],
  providers: [BinhLuanService],
})
export class BinhLuanModule {}
