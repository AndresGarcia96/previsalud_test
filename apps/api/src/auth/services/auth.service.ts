import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'user/entities/user.entity';
import { Role } from 'role/entities/role.entity';

import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { UsersService } from 'user/services/users.service';
import { NodemailerService } from 'nodemailer/services/nodemailer.service';

import { CreateUserDto } from 'user/dto/create_user.dto';
import { LoginDto } from '../dto/login.dto';
import { SendEmailDto } from 'nodemailer/dto/send_email.dto';
import { EmailDto } from '../dto/email.dto';

import { RolesEnum } from 'utils/enums/roles/roles.enum';
import { Payload } from '../interfaces/payload.interface';
import { Tokens } from '../interfaces/tokens.interface';
import { IUserSession } from 'utils/interfaces/user_session.interface';

import {
  EMAIL_VERIFICATION_CODE,
  SUBJECT_EMAIL_VERIFICATION_CODE,
} from 'nodemailer/constants/email_config.constant';

const schedule = require('node-schedule');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  // REGISTER FUNCTION

  async registerUserWithRole(
    userRole: RolesEnum,
    createUserDto: CreateUserDto,
  ): Promise<User> {
    const {
      name,
      last_name,
      id_type,
      id_number,
      email,
      cellphone,
      password,
      birthdate,
      residence_department,
      residence_city,
      residence_address,
      residence_neighborhood,
    } = createUserDto;

    await this.userService.getUserByIdNumberAndRole(id_number, [userRole]);

    return await this.userService.createUserWithRole(
      {
        name,
        last_name,
        id_type,
        id_number,
        email,
        cellphone,
        password: await bcryptjs.hash(password, 10),
        birthdate,
        residence_department,
        residence_city,
        residence_address,
        residence_neighborhood,
      },
      userRole,
    );
  }

  // LOGIN FUNCTION

  async loginUserWithRole(userRoles: RolesEnum[], loginDto: LoginDto) {
    const { email, password } = loginDto;

    const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

    const rolesFound = await this.roleRepository.find({
      where: { name: In(rolesArray) },
    });

    if (!rolesFound.length) {
      throw new UnauthorizedException(
        `¡Roles ${rolesArray.join(', ')} no encontrados!`,
      );
    }

    const bannedUserFound = await this.userRepository.findOne({
      where: { email, is_active: false },
    });

    if (bannedUserFound) {
      throw new UnauthorizedException(
        `¡Usuario bloqueado, comuníquese con el equipo de soporte!`,
      );
    }

    const userFound =
      await this.userService.getUserFoundByEmailWithPassword(email);

    if (!userFound) {
      throw new UnauthorizedException(`¡Datos ingresados incorrectos!`);
    }

    const verifiedRole = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .select(['user.email', 'user.id_number'])
      .where('user.email = :email', { email })
      .andWhere('role.id IN (:...roleIds)', {
        roleIds: rolesFound.map((r) => r.id),
      })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .getRawOne();

    if (!verifiedRole) {
      throw new UnauthorizedException(`¡Usuario no autorizado!`);
    }

    const isCorrectPassword = await bcryptjs.compare(
      password,
      userFound.password,
    );

    if (!isCorrectPassword) {
      throw new UnauthorizedException(`¡Datos ingresados incorrectos!`);
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9999);

    await this.userRepository.update(
      { id: userFound.id },
      { verification_code: verificationCode },
    );

    const emailDetailsToSend = new SendEmailDto();
    emailDetailsToSend.recipients = [userFound.email];
    emailDetailsToSend.userNameToEmail = userFound.name;
    emailDetailsToSend.subject = SUBJECT_EMAIL_VERIFICATION_CODE;
    emailDetailsToSend.emailTemplate = EMAIL_VERIFICATION_CODE;
    emailDetailsToSend.verificationCode = verificationCode;

    await this.nodemailerService.sendEmail(emailDetailsToSend);

    schedule.scheduleJob(new Date(Date.now() + 5 * 60 * 1000), async () => {
      await this.userRepository.update(
        { id: userFound.id },
        { verification_code: null },
      );
    });

    return { email };
  }

  private getExpirationInSeconds(expiresIn: string): number {
    return parseInt(expiresIn, 10) * 60;
  }

  private async generateTokens(user: Partial<IUserSession>): Promise<Tokens> {
    const jwtUserPayload = {
      sub: user.id,
      name: user.name,
      last_name: user.last_name,
      id_number: user.id_number,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken, accessTokenExpiresIn] = await Promise.all(
      [
        await this.jwtService.signAsync(jwtUserPayload, {
          secret: process.env.JWT_CONSTANTS_SECRET,
          expiresIn: process.env
            .ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        }),

        await this.jwtService.signAsync(jwtUserPayload, {
          secret: process.env.JWT_CONSTANTS_SECRET,
          expiresIn: process.env
            .REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        }),

        this.getExpirationInSeconds(process.env.ACCESS_TOKEN_EXPIRES_IN),
      ],
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      access_token_expires_in: accessTokenExpiresIn,
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const user: IUserSession = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_CONSTANTS_SECRET,
      });

      const payload: Payload = {
        sub: user.id,
        name: user.name,
        last_name: user.last_name,
        id_number: user.id_number,
        email: user.email,
        role: user.role,
      };

      const { access_token, refresh_token, access_token_expires_in } =
        await this.generateTokens(payload);

      return {
        access_token,
        refresh_token,
        access_token_expires_in,
        status: HttpStatus.CREATED,
        message: '¡Refresh Token Successfully!',
      };
    } catch (error) {
      throw new UnauthorizedException(`¡Refresh Token Failed!`);
    }
  }

  private async verifyCodeAndLoginForRoles(
    email: string,
    verification_code: number,
    rolesAllowed: RolesEnum[],
  ) {
    const rolesFound = await this.roleRepository.find({
      where: { name: In(rolesAllowed) },
    });

    if (!rolesFound.length) {
      throw new UnauthorizedException(`¡Roles no encontrados!`);
    }

    const verifiedUser = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .select(['user.id', 'user.email', 'user.id_number'])
      .where('user.email = :email', { email })
      .andWhere('role.id IN (:...roleIds)', {
        roleIds: rolesFound.map((role) => role.id),
      })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .getRawOne();

    if (!verifiedUser) {
      throw new UnauthorizedException(`¡Usuario no autorizado!`);
    }

    const collaboratorFound =
      await this.userService.getUserActiveByEmailAndCode(
        email,
        verification_code,
      );

    if (!collaboratorFound) {
      throw new UnauthorizedException(`¡Código de verificación incorrecto!`);
    }

    await this.userRepository.update(
      { id: collaboratorFound.id },
      { verification_code: null },
    );

    const payload: Payload = {
      sub: collaboratorFound.id,
      name: `${collaboratorFound.name} ${collaboratorFound.last_name}`,
      last_name: collaboratorFound.last_name,
      id_number: collaboratorFound.id_number,
      email: collaboratorFound.email,
      role: collaboratorFound.role.map((role) => ({
        id: role.id,
        name: role.name,
      })),
    };

    const { access_token, refresh_token, access_token_expires_in } =
      await this.generateTokens(payload);

    return {
      access_token,
      refresh_token,
      access_token_expires_in,
      name: payload.name,
      last_name: payload.last_name,
      id_number: payload.id_number,
      email: payload.email,
      role: payload.role,
    };
  }

  async verifyCodeAndLoginAdmin(email: string, verification_code: number) {
    return this.verifyCodeAndLoginForRoles(email, verification_code, [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.AUDITOR,
    ]);
  }

  async verifyCodeAndLoginUser(email: string, verification_code: number) {
    return this.verifyCodeAndLoginForRoles(email, verification_code, [
      RolesEnum.USER,
    ]);
  }

  async resendVerificationUserCode({ email }: EmailDto) {
    const collaboratorFound =
      await this.userService.getUserActiveByEmail(email);

    if (!collaboratorFound) {
      throw new UnauthorizedException(`¡Usuario no encontrado!`);
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9999);

    await this.userRepository.update(
      {
        id: collaboratorFound.id,
      },
      { verification_code: verificationCode },
    );

    const userCollaboratorWithCode = await this.userRepository.findOne({
      where: {
        id: collaboratorFound.id,
      },
    });

    const emailDetailsToSend = new SendEmailDto();

    emailDetailsToSend.recipients = [collaboratorFound.email];
    emailDetailsToSend.userNameToEmail = collaboratorFound.name;
    emailDetailsToSend.subject = SUBJECT_EMAIL_VERIFICATION_CODE;
    emailDetailsToSend.emailTemplate = EMAIL_VERIFICATION_CODE;
    emailDetailsToSend.verificationCode =
      userCollaboratorWithCode.verification_code;

    await this.nodemailerService.sendEmail(emailDetailsToSend);

    schedule.scheduleJob(new Date(Date.now() + 5 * 60 * 1000), async () => {
      await this.userRepository.update(
        { id: collaboratorFound.id },
        { verification_code: null },
      );
    });

    return { email: userCollaboratorWithCode.email };
  }
}
