import {
  Resolver,
  Mutation,
  Query,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { PaginationInput } from 'src/common/pagination.input';
import { BookFlightInput, UpdateBookingInput } from './dto/BookFlightInput.dto';
import { PaginatedBooking } from './dto/paginatedBooking.dto';
import { Flight } from 'src/flight/entities/flight.entity';
import { FlightService } from 'src/flight/flight.service';
import { Passenger } from 'src/passenger/entities/passenger.entity';
import { PassengerService } from 'src/passenger/passenger.service';

@Resolver(() => Booking)
export class BookingResolver {
  constructor(
    private readonly bookingService: BookingService, // These services are injected for use in the Field Resolvers below
    private readonly flightService: FlightService,
    private readonly passengerService: PassengerService,
  ) {} // --- MUTATIONS ---
  // (Mutations remain unchanged as they only call service methods)

  @Mutation(() => Booking, {
    name: 'bookFlight',
    description:
      'Creates a new booking, checks for seat duplication (Passenger only)',
  })
  bookFlight(@Args('input') input: BookFlightInput): Promise<Booking> {
    return this.bookingService.bookFlight(input);
  }

  @Mutation(() => Booking, {
    name: 'updateBooking',
    description:
      'Update a booking (e.g., change seat number) (Admin/Passenger self-update)',
  })
  updateBooking(@Args('input') input: UpdateBookingInput): Promise<Booking> {
    return this.bookingService.updateBooking(input);
  }

  @Mutation(() => Booking, {
    name: 'deleteBooking',
    description: 'Cancel a booking (Admin/Passenger self-delete)',
  })
  deleteBooking(@Args('id', { type: () => ID }) id: string): Promise<Booking> {
    return this.bookingService.deleteBooking(id);
  } // --- QUERIES ---
  // (Queries remain unchanged as they only call service methods)

  @Query(() => Booking, {
    name: 'booking',
    description:
      'Retrieve a single booking by ID (Admin/Passenger self-lookup)',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Booking> {
    return this.bookingService.findOne(id);
  }

  @Query(() => PaginatedBooking, {
    name: 'bookings',
    description: 'Retrieve all bookings with pagination (Admin only)',
  })
  findAll(
    @Args('pagination', { nullable: true })
    pagination: PaginationInput = { page: 1, limit: 10 },
  ): Promise<PaginatedBooking> {
    return this.bookingService.findAll(pagination);
  }

  @Query(() => [Booking], {
    name: 'myBookings',
    description:
      'Retrieve all bookings and flight details for a passenger (Passenger self-lookup)',
  })
  findBookingsByPassenger(
    @Args('passengerId', {
      type: () => ID,
      description: 'The ID of the passenger.',
    })
    passengerId: string,
  ): Promise<Booking[]> {
    return this.bookingService.findBookingsByPassenger(passengerId);
  } // --- FIELD RESOLVERS (N+1 Issue is here) ---
  // The resolver is updated to use the foreign key IDs.

  @ResolveField(() => Flight)
  flight(@Parent() booking: Booking): Promise<Flight> {
    // 💥 FIX: Use the explicit foreign key ID
    // if (!booking.flightId) return null; // Defensive check
    return this.flightService.findOne(booking.flightId);
  }

  @ResolveField(() => Passenger)
  passenger(@Parent() booking: Booking): Promise<Passenger> {
    // 💥 FIX: Use the explicit foreign key ID
    // if (!booking.passengerId) return null; // Defensive check
    return this.passengerService.findOne(booking.passengerId);
  }
}
