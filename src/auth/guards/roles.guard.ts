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
    console.log(user.role);
    const userRoles: string[] = user.role || [];
    const has = requiredRoles.some((role) => userRoles.includes(role));
    if (!has)
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(', ')}`,
      );

    return true;
  }
}
