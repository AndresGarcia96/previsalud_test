import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'user/entities/user.entity';
import { Role } from 'role/entities/role.entity';
import { UserModule } from 'user/user.module';
import { NodemailerModule } from 'nodemailer/nodemailer.module';
import * as jwt from 'jsonwebtoken';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    UserModule,
    NodemailerModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANTS_SECRET,
      signOptions: {
        expiresIn: process.env.EXPIRES_IN as jwt.SignOptions['expiresIn'],
      },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
