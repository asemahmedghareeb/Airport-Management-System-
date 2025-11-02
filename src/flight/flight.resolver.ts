import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { FlightService } from './flight.service';
import { Flight } from './entities/flight.entity';
import { CreateFlightInput } from './dto/create-flight.input';
import { UpdateFlightInput } from './dto/update-flight.input';
import { PaginationInput } from 'src/common/pagination.input';
import { PaginatedFlightResponse } from './dto/paginated-flight.response';
import { FlightFilterInput } from './dto/flight-filter.input';
import { Airport } from 'src/airport/entities/airport.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { Staff } from 'src/staff/entities/staff.entity';
import { FlightOwnershipGuard } from './guards/flightOwnerShip.guard';
import { AirportLoader } from 'src/dataloaders/airport.loader';
import { BookingLoader } from 'src/dataloaders/booking.loader';
import { StaffLoader } from 'src/dataloaders/staff.loader';

@UseGuards(AuthGuard)
@Resolver(() => Flight)
export class FlightResolver {
  constructor(
    private readonly flightService: FlightService,
    private readonly airportLoader:   AirportLoader,
    private readonly bookingLoader: BookingLoader,
    private readonly staffLoader: StaffLoader,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Flight)
  createFlight(@Args('input') input: CreateFlightInput) {
    return this.flightService.create(input);
  }

  @UseGuards(RolesGuard, FlightOwnershipGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Mutation(() => Flight)
  updateFlight(@Args('input') input: UpdateFlightInput) {
    return this.flightService.update(input);
  }

  @UseGuards(RolesGuard, FlightOwnershipGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Mutation(() => Boolean)
  removeFlight(@Args('id', { type: () => ID, nullable: true }) id: string) {
    return this.flightService.remove(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => PaginatedFlightResponse)
  async flights(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination: PaginationInput,
    @Args('filter', { type: () => FlightFilterInput, nullable: true })
    filter?: FlightFilterInput,
  ) {
    return this.flightService.findAll(pagination, filter);
  }

  @UseGuards(RolesGuard, FlightOwnershipGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Query(() => Flight)
  flight(@Args('id', { type: () => ID }) id: string) {
    return this.flightService.findOne(id);
  }

  @ResolveField(() => Airport)
  departureAirport(
    @Parent() flight: Flight,
  ): Promise<Airport> | null {
    if (!flight.departureAirportId) return null;
    return this.airportLoader.airportById.load(flight.departureAirportId);
  }

  @ResolveField(() => Airport)
  destinationAirport(
    @Parent() flight: Flight,
  ): Promise<Airport> | null {
    if (!flight.destinationAirportId) return null;
    return this.airportLoader.airportById.load(flight.destinationAirportId);
  }

  @ResolveField(() => [Booking], { nullable: true })
  bookings(
    @Parent() flight: Flight,
  ): Promise<Booking[]> {
    return this.bookingLoader.bookingsByFlightId.load(flight.id);
  }

  @ResolveField(() => [Staff], { nullable: true })
  staffAssignments(
    @Parent() flight: Flight,
  ): Promise<Staff[]> {
    return this.staffLoader.staffByFlightId.load(flight.id);
  }
}
