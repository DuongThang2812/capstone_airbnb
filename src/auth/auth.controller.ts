import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { success } from '../common/api-response';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: "Đăng ký tài khoản người dùng",
    description: "Công khai, không yêu cầu JWT Bearer Token. Body: name là họ tên, email là địa chỉ đăng nhập, password là mật khẩu; phone, birthday (YYYY-MM-DD) và gender (boolean) là thông tin tùy chọn. role gửi lên không được dùng; tài khoản mới có vai trò USER.",
  })
  @HttpCode(200)
  async signup(@Body() dto: SignUpDto) {
    return success(await this.auth.signup(dto));
  }

  @Post('signin')
  @ApiOperation({
    summary: "Đăng nhập và nhận JWT",
    description: "Công khai, không yêu cầu JWT Bearer Token. Body: email là địa chỉ đã đăng ký, password là mật khẩu. Phản hồi trả về thông tin người dùng và token để dùng trong các API có bảo vệ.",
  })
  @HttpCode(200)
  async signin(@Body() dto: SignInDto) {
    return success(await this.auth.signin(dto));
  }
}
