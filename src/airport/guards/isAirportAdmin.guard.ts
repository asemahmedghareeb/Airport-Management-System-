import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Role } from '../../auth/role.enum';

@Injectable()
export class IsAirportAdmin implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req?.user;
    const args = ctx.getArgs();

    if (!user) {
      throw new ForbiddenException('No user found in request');
    }

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can access this');
    }

    const airportId =
      args?.id ||
      args?.input?.id ||
      args?.input?.airportId ||
      args?.airportId ||
      null;

    if (!airportId) {
      return true;
    }

    if (user.airportId !== airportId) {
      throw new ForbiddenException('You are not assigned to this airport');
    }

    return true;
  }
}
