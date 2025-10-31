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
import { Staff } from 'src/staff/entities/staff.entity';
import DataLoader from 'dataloader';
import { Loader } from 'src/dataloader/decorators/loader.decorator';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@UseGuards(AuthGuard)
@Resolver(() => Flight)
export class FlightResolver {
  constructor(private readonly flightService: FlightService) {}


  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Flight)
  createFlight(@Args('input') input: CreateFlightInput) {
    return this.flightService.create(input);
  }


  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Mutation(() => Flight)
  updateFlight(
    @Args('input') input: UpdateFlightInput,
    @CurrentUser()
    staff: { userId: string; role: string; staffId: string; airportId: string, flights: string[] },
  ) {
   
    if(staff.role === Role.STAFF){
      console.log(staff.flights);
      if(staff.flights?.includes(input.id)){
        return this.flightService.update(input);
      }
      throw new BadRequestException('You are not authorized to update this flight');
    }
    return this.flightService.update(input);
  }


  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
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

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Query(() => Flight)
  flight(@Args('id', { type: () => ID }) id: string, @CurrentUser() staff: { userId: string; role: string; staffId: string; airportId: string, flights: string[] }) {
    if(staff.role === Role.STAFF){
      console.log(staff.flights);
      if(staff.flights?.includes(id)){
        return this.flightService.findOne(id);
      }
      throw new BadRequestException('You are not authorized to view this flight');
    }
    return this.flightService.findOne(id);
  }

  // ==============
  // 🧩 RESOLVE FIELDS
  // ==============

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ResolveField(() => Airport)
  departureAirport(
    @Parent() flight: Flight,
    // Use the one-to-one loader for Airport
    @Loader('airportById') airportLoader: DataLoader<string, Airport>,
  ): Promise<Airport> | null {
    if (!flight.departureAirportId) return null;
    return airportLoader.load(flight.departureAirportId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ResolveField(() => Airport)
  destinationAirport(
    @Parent() flight: Flight,
    // Use the one-to-one loader for Airport
    @Loader('airportById') airportLoader: DataLoader<string, Airport>,
  ): Promise<Airport> | null {
    if (!flight.destinationAirportId) return null;
    return airportLoader.load(flight.destinationAirportId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ResolveField(() => [Booking], { nullable: true })
  bookings(
    @Parent() flight: Flight,
    // Use the one-to-many loader for Bookings by Flight ID
    @Loader('bookingsByFlightId') bookingsLoader: DataLoader<string, Booking[]>,
  ): Promise<Booking[]> {
    return bookingsLoader.load(flight.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ResolveField(() => [Staff], { nullable: true })
  staffAssignments(
    @Parent() flight: Flight,
    // Use the one-to-many loader for Staff by Flight ID
    @Loader('staffByFlightId') staffLoader: DataLoader<string, Staff[]>,
  ): Promise<Staff[]> {
    return staffLoader.load(flight.id);
  }
}

// @ResolveField(() => Airport)
// departureAirport(@Parent() flight: Flight): Promise<Airport> | null {
//   // 💡 FIX: Use the explicit foreign key property
//   if (!flight.departureAirportId) return null;
//   return this.airportService.findOne(flight.departureAirportId);
// } // ✅ Resolve Destination Airport

// @ResolveField(() => Airport)
// destinationAirport(@Parent() flight: Flight): Promise<Airport> | null {
//   // 💡 FIX: Use the explicit foreign key property
//   if (!flight.destinationAirportId) return null;
//   return this.airportService.findOne(flight.destinationAirportId);
// }

// @ResolveField(() => [Booking], { nullable: true })
// bookings(@Parent() flight: Flight): Promise<Booking[]> {
//   return this.bookingService.findByFlight(flight.id);
// }

// @ResolveField(() => [Staff], { nullable: true })
// staffAssignments(@Parent() flight: Flight): Promise<Staff[]> {
//   return this.staffService.findByFlight(flight.id);
// }
