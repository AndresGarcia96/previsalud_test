import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendEmailDto {
  @IsOptional()
  @IsEmail()
  from?: string;

  @IsNotEmpty()
  recipients: string[];

  @IsOptional()
  @IsString()
  subject?: string;

  @IsNotEmpty()
  @IsString()
  emailTemplate: string;

  @IsNotEmpty()
  @IsString()
  userNameToEmail: string;

  @IsOptional()
  @IsNumber()
  userIdNumberToEmail: number;

  @IsOptional()
  @IsString()
  fenixUrl: string;

  @IsOptional()
  @IsString()
  supportContactEmail: string;

  @IsOptional()
  @IsNumber()
  verificationCode: number;

  @IsOptional()
  @IsString()
  resetPasswordUrl: string;
}
