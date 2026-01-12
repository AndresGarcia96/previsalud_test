import { IsNotEmpty } from 'class-validator';

export class IdUserDto {
  @IsNotEmpty()
  id_type: number;

  @IsNotEmpty()
  id_number: number;
}
