import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class PhongThueDto {
  @ApiProperty({ example: 'Can ho trung tam' })
  tenPhong!: string;

  @ApiProperty({ example: 2 })
  khach!: number;

  @ApiProperty({ example: 1 })
  phongNgu!: number;

  @ApiProperty({ example: 1 })
  giuong!: number;

  @ApiProperty({ example: 1 })
  phongTam!: number;

  @ApiProperty({ example: 'Can ho gan trung tam' })
  moTa!: string;

  @ApiProperty({ example: 850000 })
  giaTien!: number;

  @ApiProperty({ example: true })
  mayGiat!: boolean;

  @ApiProperty({ example: true })
  banLa!: boolean;

  @ApiProperty({ example: true })
  tivi!: boolean;

  @ApiProperty({ example: true })
  dieuHoa!: boolean;

  @ApiProperty({ example: true })
  wifi!: boolean;

  @ApiProperty({ example: true })
  bep!: boolean;

  @ApiProperty({ example: false })
  doXe!: boolean;

  @ApiProperty({ example: false })
  hoBoi!: boolean;

  @ApiProperty({ example: false })
  banUi!: boolean;

  @ApiProperty({ example: 1 })
  maViTri!: number;

  @ApiPropertyOptional({ example: '/public/img/phong.jpg' })
  hinhAnh?: string;
}

export class UpdatePhongThueDto extends PartialType(PhongThueDto) {}
