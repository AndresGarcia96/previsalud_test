import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsString,
  IsDateString,
  MinLength,
  MaxLength,
  IsEnum,
  isString,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { IdentificationTypeEnum } from 'utils/enums/id_type/identification_type.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  last_name: string;

  @IsOptional()
  @IsString()
  birthdate: string;

  @IsNotEmpty()
  @IsEnum(IdentificationTypeEnum)
  id_type: IdentificationTypeEnum;

  @IsNotEmpty()
  @IsString()
  id_number: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  cellphone: number;

  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(31)
  password: string;

  @IsOptional()
  @IsString()
  residence_department: string;

  @IsOptional()
  @IsString()
  residence_city: string;

  @IsOptional()
  @IsString()
  residence_address: string;

  @IsOptional()
  @IsString()
  residence_neighborhood: string;
}
