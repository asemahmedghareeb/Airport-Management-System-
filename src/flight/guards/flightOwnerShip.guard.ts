import { BadRequestException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from 'src/auth/role.enum';
import { IStaff } from '../flight.resolver';


@Injectable()
export class FlightOwnershipGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { input } = ctx.getArgs();
    const staff: IStaff = ctx.getContext().req.user;
    if (staff.role === Role.ADMIN) return true;

    const flightIds = staff.flights;
    if (flightIds?.includes(input.id)) return true;

    throw new BadRequestException(
      'You are not authorized to update this flight',
    );
  }
}
