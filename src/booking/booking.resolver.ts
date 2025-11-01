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
import { IsOwnerGuard } from 'src/common/guards/isIwner.guard';

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
  @UseGuards(RolesGuard, IsOwnerGuard)
  @Mutation(() => Booking, {
    name: 'updateBooking',
  })
  updateBooking(@Args('input') input: UpdateBookingInput): Promise<Booking> {
    return this.bookingService.updateBooking(input);
  }

  @Roles(Role.ADMIN, Role.PASSENGER)
  @UseGuards(RolesGuard, IsOwnerGuard)
  @Mutation(() => Booking, {
    name: 'deleteBooking',
  })
  deleteBooking(@Args('id', { type: () => ID }) id: string): Promise<Booking> {
    return this.bookingService.deleteBooking(id);
  }

  @Roles(Role.ADMIN, Role.PASSENGER)
  @UseGuards(RolesGuard, IsOwnerGuard)
  @Query(() => Booking, {
    name: 'booking',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Booking> {
    return this.bookingService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => PaginatedBooking, {
    name: 'bookings',
  })
  findAll(
    @Args('pagination', { nullable: true })
    pagination: PaginationInput = { page: 1, limit: 10 },
  ): Promise<PaginatedBooking> {
    return this.bookingService.findAll(pagination);
  }

  @Roles(Role.PASSENGER, Role.ADMIN)
  @UseGuards(RolesGuard, IsOwnerGuard)
  @Query(() => [Booking], {
    name: 'myBookings',
  })
  findBookingsByPassenger(
    @Args('passengerId', {
      type: () => ID,
    })
    passengerId: string,
  ): Promise<Booking[]> {
    return this.bookingService.findBookingsByPassenger(passengerId);
  }

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
}
