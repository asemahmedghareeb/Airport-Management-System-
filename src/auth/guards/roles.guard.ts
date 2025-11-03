import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const user = req?.user;
    if (!user) {
      throw new ForbiddenException(
        'No user found in request - authenticate first',
      );
    }
    const userRoles: string[] = user.role || [];
    const staffRole = user?.staffRole;
    console.log(requiredRoles);
    const has = requiredRoles.some((role) => userRoles.includes(role));
    const hasStaff = requiredRoles.some((role) => staffRole.includes(role));
    if (!has && !hasStaff)
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(', ')}`,
      );

    return true;
  }
}
