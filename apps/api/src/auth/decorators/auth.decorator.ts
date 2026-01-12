import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from './roles.decorator';
import { RolesEnum } from 'utils/enums/roles/roles.enum';

export function Auth(...roles: RolesEnum[]) {
  return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));
}
