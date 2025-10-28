import { Resolver, Mutation, Query, Args, ID } from '@nestjs/graphql';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { PaginationInput } from 'src/common/pagination.input';
import { BookFlightInput, UpdateBookingInput } from './dto/BookFlightInput.dto';
import { PaginatedBooking } from './dto/paginatedBooking.dto';

// NOTE: Apply Authorization Guards (e.g., @Roles(Role.Passenger)) to these methods

@Resolver(() => Booking)
export class BookingResolver {
  constructor(private readonly bookingService: BookingService) {}

  // --- MUTATIONS ---
  
  // NOTE => // In a real app, this should fetch the passengerId from the JWT context
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
  }

  // --- QUERIES ---

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


  // NOTE => // In a real app, this should fetch the passengerId from the JWT context
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
    // In a real app, this should fetch the passengerId from the JWT context
    return this.bookingService.findBookingsByPassenger(passengerId);
  }
}
