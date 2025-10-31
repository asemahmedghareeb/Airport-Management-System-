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

import { Passenger } from 'src/passenger/entities/passenger.entity';

import { Loader } from 'src/dataloader/decorators/loader.decorator';
import DataLoader from 'dataloader';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@UseGuards(AuthGuard)
@Resolver(() => Booking)
export class BookingResolver {
  constructor(private readonly bookingService: BookingService) {}

  @Roles(Role.ADMIN, Role.PASSENGER)
  @UseGuards(RolesGuard)
  @Mutation(() => Booking, {
    name: 'bookFlight',
    description:
      'Creates a new booking, checks for seat duplication (Passenger only)',
  })
  bookFlight(@Args('input') input: BookFlightInput): Promise<Booking> {
    return this.bookingService.bookFlight(input);
  }

  @Roles(Role.ADMIN, Role.PASSENGER)
  @UseGuards(RolesGuard)
  @Mutation(() => Booking, {
    name: 'updateBooking',
    description:
      'Update a booking (e.g., change seat number) (Admin/Passenger self-update)',
  })
  updateBooking(
    @Args('input') input: UpdateBookingInput,
    @CurrentUser() user: { userId: string; role: string; passengerId: string },
  ): Promise<Booking> {
    if (user.role === Role.PASSENGER) {
      input.id = user.passengerId;
    }
    return this.bookingService.updateBooking(input);
  }

  @Roles(Role.ADMIN, Role.PASSENGER)
  @UseGuards(RolesGuard)
  @Mutation(() => Booking, {
    name: 'deleteBooking',
    description: 'Cancel a booking (Admin/Passenger self-delete)',
  })
  deleteBooking(
    @CurrentUser() user: { userId: string; role: string; passengerId: string },
    @Args('id', { type: () => ID, nullable: true }) id?: string,
  ): Promise<Booking> {
    if (user.role === Role.PASSENGER) {
      id = user.passengerId;
    }
    if (!id) {
      throw new Error('Booking ID is required');
    }
    return this.bookingService.deleteBooking(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Booking, {
    name: 'booking',
    description:
      'Retrieve a single booking by ID (Admin/Passenger self-lookup)',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Booking> {
    return this.bookingService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
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

  @Roles(Role.PASSENGER, Role.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => [Booking], {
    name: 'myBookings',
    description:
      'Retrieve all bookings and flight details for a passenger (Passenger self-lookup)',
  })
  findBookingsByPassenger(
    @CurrentUser() user: { userId: string; role: string; passengerId: string },
    @Args('passengerId', {
      type: () => ID,
      description: 'The ID of the passenger.',
      nullable: true,
    })
    passengerId?: string,
  ): Promise<Booking[]> {
    if (user.role === Role.PASSENGER) {
      return this.bookingService.findBookingsByPassenger(user.passengerId);
    }
    if (!passengerId) {
      throw new Error('Passenger ID is required');
    }
    return this.bookingService.findBookingsByPassenger(passengerId);
  }

  // --- FIELD RESOLVERS (N+1 Issue is here) ---

  @ResolveField(() => Flight)
  async flight(
    @Parent() booking: Booking,
    @Loader('flightById') flightLoader: DataLoader<string, Flight>,
  ): Promise<Flight> {
    return flightLoader.load(booking.flightId);
  }

  @ResolveField(() => Passenger)
  async passenger(
    @Parent() booking: Booking,
    @Loader('passengerById') passengerLoader: DataLoader<string, Passenger>,
  ): Promise<Passenger> {
    return passengerLoader.load(booking.passengerId);
  }

  // @ResolveField(() => Flight)
  // flight(@Parent() booking: Booking): Promise<Flight> {
  //   // 💥 FIX: Use the explicit foreign key ID
  //   // if (!booking.flightId) return null; // Defensive check
  //   return this.flightService.findOne(booking.flightId);
  // }

  // @ResolveField(() => Passenger)
  // passenger(@Parent() booking: Booking): Promise<Passenger> {
  //   // 💥 FIX: Use the explicit foreign key ID
  //   // if (!booking.passengerId) return null; // Defensive check
  //   return this.passengerService.findOne(booking.passengerId);
  // }
}
