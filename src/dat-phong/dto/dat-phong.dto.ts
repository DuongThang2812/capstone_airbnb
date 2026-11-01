import { ApiProperty, PartialType } from '@nestjs/swagger';

export class DatPhongDto {
  @ApiProperty({ example: 1 })
  maPhong!: number;

  @ApiProperty({ example: '2026-11-10T14:00:00.000Z', format: 'date-time' })
  ngayDen!: string;

  @ApiProperty({ example: '2026-11-12T12:00:00.000Z', format: 'date-time' })
  ngayDi!: string;

  @ApiProperty({ example: 2 })
  soLuongKhach!: number;

  @ApiProperty({ example: 1 })
  maNguoiDat!: number;
}

export class UpdateDatPhongDto extends PartialType(DatPhongDto) {}
