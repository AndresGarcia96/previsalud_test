import { IsEnum, IsNotEmpty } from 'class-validator';
import { RolesEnum } from 'utils/enums/roles/roles.enum';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsEnum(RolesEnum)
  name: RolesEnum;
}
