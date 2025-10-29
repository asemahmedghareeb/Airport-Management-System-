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
import DataLoader from 'dataloader';
import { Loader } from 'src/dataloader/decorators/loader.decorator';

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
  departureAirport(
    @Parent() flight: Flight,
    // Use the one-to-one loader for Airport
    @Loader('airportById') airportLoader: DataLoader<string, Airport>,
  ): Promise<Airport> | null {
    if (!flight.departureAirportId) return null;
    return airportLoader.load(flight.departureAirportId);
  } 

  @ResolveField(() => Airport)
  destinationAirport(
    @Parent() flight: Flight,
    // Use the one-to-one loader for Airport
    @Loader('airportById') airportLoader: DataLoader<string, Airport>,
  ): Promise<Airport> | null {
    if (!flight.destinationAirportId) return null;
    return airportLoader.load(flight.destinationAirportId);
  }

  @ResolveField(() => [Booking], { nullable: true })
  bookings(
    @Parent() flight: Flight,
    // Use the one-to-many loader for Bookings by Flight ID
    @Loader('bookingsByFlightId') bookingsLoader: DataLoader<string, Booking[]>,
  ): Promise<Booking[]> {
    return bookingsLoader.load(flight.id);
  }

  @ResolveField(() => [Staff], { nullable: true })  
  staffAssignments(
    @Parent() flight: Flight,
    // Use the one-to-many loader for Staff by Flight ID
    @Loader('staffByFlightId') staffLoader: DataLoader<string, Staff[]>,
  ): Promise<Staff[]> {
    return staffLoader.load(flight.id);
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
}
