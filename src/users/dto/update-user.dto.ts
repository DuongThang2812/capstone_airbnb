import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  name?: string;

  @ApiPropertyOptional({ example: 'a@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '123456' })
  password?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  phone?: string;

  @ApiPropertyOptional({ example: '1995-01-15' })
  birthday?: string;

  @ApiPropertyOptional({ example: true })
  gender?: boolean;

  @ApiPropertyOptional({ example: 'USER' })
  role?: string;
}
