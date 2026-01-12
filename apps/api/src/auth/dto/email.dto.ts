import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: '¡Correo no ingresado!' })
  @IsEmail()
  email: string;
}
