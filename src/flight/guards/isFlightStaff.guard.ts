import { BadRequestException, Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from 'src/auth/role.enum';
import { StaffPayload } from 'src/staff/interfaces/staff.payload';
import { FlightStaff } from '../entities/flight_staff';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IsFlightSTaff implements CanActivate {
  constructor(
    @InjectRepository(FlightStaff)
    private readonly flightStaffRepo: Repository<FlightStaff>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { input } = ctx.getArgs();
    const { id } = ctx.getArgs();
    const staff: StaffPayload = ctx.getContext().req.user;
    if (staff.role === Role.ADMIN) return true;

   
    const flightStaff = await this.flightStaffRepo.find({
      where: { staffId: staff?.staffId },
    });

    const flightIds = flightStaff.map((flightStaff) => flightStaff.flightId);
    if (flightIds?.includes(id) && staff.staffRole === Role.GROUND_STAFF)
      return true;

    if (
      input.id &&
      flightIds?.includes(input.id) &&
      staff.staffRole === Role.GROUND_STAFF
    )
      return true;

    throw new BadRequestException(
      'You are not authorized to update this flight',
    );
  }
}
