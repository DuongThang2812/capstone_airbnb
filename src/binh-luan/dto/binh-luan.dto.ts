import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BinhLuanDto {
  @ApiProperty({ example: 1 })
  maPhong!: number;

  @ApiProperty({ example: 1 })
  maNguoiBinhLuan!: number;

  @ApiPropertyOptional({ example: '2026-11-01T10:00:00.000Z', format: 'date-time' })
  ngayBinhLuan?: string;

  @ApiProperty({ example: 'Phong sạch sẽ và tiện nghi' })
  noiDung!: string;

  @ApiProperty({ example: 5 })
  saoBinhLuan!: number;
}

export class UpdateBinhLuanDto {
  @ApiPropertyOptional({ example: 'Phòng rất đẹp' })
  noiDung?: string;

  @ApiPropertyOptional({ example: 5 })
  saoBinhLuan?: number;
}
