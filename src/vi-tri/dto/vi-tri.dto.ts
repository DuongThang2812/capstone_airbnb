import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class ViTriDto {
  @ApiProperty({ example: 'Quan 1' })
  tenViTri!: string;

  @ApiProperty({ example: 'TP Ho Chi Minh' })
  tinhThanh!: string;

  @ApiProperty({ example: 'Viet Nam' })
  quocGia!: string;

  @ApiPropertyOptional({ example: '/public/img/vi-tri.jpg' })
  hinhAnh?: string;
}

export class UpdateViTriDto extends PartialType(ViTriDto) {}
