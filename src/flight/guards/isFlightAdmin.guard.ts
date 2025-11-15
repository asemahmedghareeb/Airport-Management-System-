import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Role } from '../../auth/role.enum';
import { FlightService } from '../flight.service';

@Injectable()
export class IsFlightAdmin implements CanActivate {
  constructor(
    private readonly flightService: FlightService,
  ) {}
  
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

    const flightId =
      args?.id ||
      args?.input?.id ||
      args?.input?.flightId ||
      args?.flightId ||
      null;

    if (!flightId) {
      throw new ForbiddenException('No flight ID provided');
    }
    const flight = await this.flightService.findOne(flightId);

    if (!flight) {
      throw new ForbiddenException('Flight not found');
    }

    if (user.airportId !== flight.departureAirportId) {
      throw new ForbiddenException(
        "You are not assigned to this flight's departure airport",
      );
    }

    ctx.getContext().flight = flight;
    return true;
  }
}
