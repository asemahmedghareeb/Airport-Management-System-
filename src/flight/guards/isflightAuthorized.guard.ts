import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/auth/role.enum';
import { StaffPayload } from 'src/staff/interfaces/staff.payload';
import { FlightStaff } from '../entities/flight_staff';
import { FlightService } from '../flight.service';

@Injectable()
export class IsFlightAuthorized implements CanActivate {
  constructor(
    @InjectRepository(FlightStaff)
    private readonly flightStaffRepo: Repository<FlightStaff>,
    private readonly flightService: FlightService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const user: StaffPayload = req?.user;
    const args = ctx.getArgs();

    if (!user) throw new ForbiddenException('No user found in request');

    const flightId =
      args?.id ||
      args?.input?.id ||
      args?.input?.flightId ||
      args?.flightId ||
      null;

    if (!flightId)
      throw new BadRequestException('No flight ID provided for authorization');

    const flight = await this.flightService.findOne(flightId);
    if (!flight) throw new ForbiddenException('Flight not found');
    ctx.getContext().flight = flight;

    if (user.role === Role.ADMIN) {
      if (user.airportId === flight.departureAirportId) return true;
      throw new ForbiddenException(
        "You are not assigned to this flight's departure airport",
      );
    }

    if (user.role === Role.STAFF) {
      const assignments = await this.flightStaffRepo.find({
        where: { staffId: user.staffId },
      });

      const assignedFlightIds = assignments.map((a) => a.flightId);

      if (
        assignedFlightIds.includes(flightId) &&
        user.staffRole === Role.GROUND_STAFF
      )
        return true;

      throw new ForbiddenException('You are not authorized for this flight');
    }

    throw new ForbiddenException('Unauthorized role');
  }
}
