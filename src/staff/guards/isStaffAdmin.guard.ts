import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Role } from '../../auth/role.enum';
import { StaffService } from '../staff.service';


@Injectable()
export class IsStaffAdmin implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly staffService: StaffService,
  ) {}
  

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user = req?.user;
    const args = ctx.getArgs();

    if (!user) {
      throw new UnauthorizedException('No user found in request');
    }

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can access this');
    }

    const staffId =
      args?.id || args?.input?.id || args?.input?.staffId || null;

    if (!staffId) {
      throw new ForbiddenException('No staff ID provided');
    }
    const staff = await this.staffService.findOne(staffId);

    if (!staff) {
      throw new ForbiddenException('Staff not found');
    }

    if (user.airportId !== staff.airportId) {
      throw new ForbiddenException(
        "You are not assigned to this staff's airport",
      );
    }

    ctx.getContext().staff = staff;

    return true;
  }
}
