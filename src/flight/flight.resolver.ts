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
import { AirportService } from 'src/airport/airport.service';
import { BookingService } from 'src/booking/booking.service';
import { StaffService } from 'src/staff/staff.service';
import { Staff } from 'src/staff/entities/staff.entity';

@Resolver(() => Flight)
export class FlightResolver {
  constructor(
    private readonly flightService: FlightService,
    private readonly airportService: AirportService,
    private readonly bookingService: BookingService,
    private readonly staffService: StaffService,
  ) {}

  // ✅ CREATE flight
  @Mutation(() => Flight)
  createFlight(@Args('input') input: CreateFlightInput) {
    return this.flightService.create(input);
  }

  // ✅ UPDATE flight
  @Mutation(() => Flight)
  updateFlight(@Args('input') input: UpdateFlightInput) {
    return this.flightService.update(input.id, input);
  }

  // ✅ DELETE flight
  @Mutation(() => Boolean)
  removeFlight(@Args('id', { type: () => ID }) id: string) {
    return this.flightService.remove(id);
  }

  // ✅ GET all flights (with pagination & filter)
  @Query(() => PaginatedFlightResponse)
  async flights(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination: PaginationInput,
    @Args('filter', { type: () => FlightFilterInput, nullable: true })
    filter?: FlightFilterInput,
  ) {
    return this.flightService.findAll(pagination, filter);
  }

  // ✅ GET one flight by ID
  @Query(() => Flight)
  flight(@Args('id', { type: () => ID }) id: string) {
    return this.flightService.findOne(id);
  }

  // ==============
  // 🧩 RESOLVE FIELDS
  // ==============



  @ResolveField(() => Airport)
  destinationAirport(@Parent() flight: Flight): Promise<Airport> {
    return this.airportService.findOne(flight.destinationAirport?.id);
  }

  @ResolveField(() => [Booking], { nullable: true })
  bookings(@Parent() flight: Flight): Promise<Booking[]> {
    return this.bookingService.findByFlight(flight.id);
  }

  @ResolveField(() => [Staff], { nullable: true })
  staffAssignments(@Parent() flight: Flight): Promise<Staff[]> {
    return this.staffService.findByFlight(flight.id);
  }
}
