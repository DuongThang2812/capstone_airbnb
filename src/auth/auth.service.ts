import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { publicUser } from '../users/public-user';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  signup(dto: SignUpDto) {
    return this.users.create(dto);
  }

  async signin(dto: SignInDto) {
    if (!dto || typeof dto.email !== 'string' || typeof dto.password !== 'string') {
      throw new BadRequestException('Email và mật khẩu là bắt buộc');
    }
    const user = await this.prisma.nguoiDung.findUnique({ where: { email: dto.email.trim() } });
    if (!user || !(await bcrypt.compare(dto.password, user.pass_word))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const token = this.jwt.sign({ userId: user.id, email: user.email, role: user.role });
    return { user: publicUser(user), token };
  }
}
