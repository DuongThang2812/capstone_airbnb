import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'an@example.com' })
  email!: string;

  @ApiProperty({ example: 'Password@123' })
  password!: string;
}
