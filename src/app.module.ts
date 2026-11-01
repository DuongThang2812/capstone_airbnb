import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PhongThueModule } from './phong-thue/phong-thue.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ViTriModule } from './vi-tri/vi-tri.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UsersModule, AuthModule, ViTriModule, PhongThueModule],
})
export class AppModule {}
