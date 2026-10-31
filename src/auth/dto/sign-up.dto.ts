import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  name!: string;

  @ApiProperty({ example: 'a@example.com' })
  email!: string;

  @ApiProperty({ example: 'Password@123' })
  password!: string;

  @ApiPropertyOptional({ example: '0901234567' })
  phone?: string;

  @ApiPropertyOptional({ example: '1995-01-15' })
  birthday?: string;

  @ApiPropertyOptional({ example: true })
  gender?: boolean;

  @ApiPropertyOptional({ example: 'USER', default: 'USER' })
  role?: string;
}
