import { IsEmail, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  cellphone: number;

  @IsOptional()
  @IsArray()
  roleIdsToAdd: number[];

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
