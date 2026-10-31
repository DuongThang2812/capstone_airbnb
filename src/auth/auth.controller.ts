import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { success } from '../common/api-response';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @HttpCode(200)
  async signup(@Body() dto: SignUpDto) {
    return success(await this.auth.signup(dto));
  }

  @Post('signin')
  @HttpCode(200)
  async signin(@Body() dto: SignInDto) {
    return success(await this.auth.signin(dto));
  }
}
