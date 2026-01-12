import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesEnum } from 'utils/enums/roles/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      return false;
    }

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    if (userRoles.some((role) => role.name === RolesEnum.SUPER_ADMIN)) {
      return true;
    }

    return userRoles.some((userRole) => requiredRoles.includes(userRole.name));
  }
}
