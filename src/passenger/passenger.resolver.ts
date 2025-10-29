import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PassengerService } from './passenger.service';
import { Passenger } from './entities/passenger.entity';
import { PaginatedPassenger } from './dto/paginatedPassenger.dto';
import { PaginationInput } from 'src/common/pagination.input';

import { UpdatePassengerInput } from './dto/passengerUpdateInput.dto';
import { PassengerFilterInput } from './dto/passengerFilterInput.dto';
import { User } from 'src/auth/entities/user.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { AuthService } from 'src/auth/auth.service';
import { BookingService } from 'src/booking/booking.service';
import { Loader } from 'src/dataloader/decorators/loader.decorator';
import DataLoader from 'dataloader';

@Resolver(() => Passenger)
export class PassengerResolver {
  constructor(
    private readonly passengerService: PassengerService,
    private readonly authService: AuthService,
    private readonly bookingService: BookingService,
  ) {} // --- QUERIES and MUTATIONS (Methods remain unchanged) ---

  @Query(() => PaginatedPassenger, {
    name: 'passengers',
    description:
      'Retrieve all passengers with pagination and filters (Admin/Staff only)',
  })
  findAll(
    @Args('pagination', { nullable: true })
    pagination: PaginationInput = { page: 1, limit: 10 },
    @Args('filter', { nullable: true }) filter: PassengerFilterInput = {},
  ): Promise<PaginatedPassenger> {
    return this.passengerService.findAll(pagination, filter);
  }

  @Query(() => Passenger, {
    name: 'passenger',
    description:
      'Retrieve a single passenger by ID (Admin/Passenger self-lookup)',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Passenger> {
    return this.passengerService.findOne(id);
  }

  @Mutation(() => Passenger, {
    description: 'Update a passenger record (Admin/Passenger self-update)',
  })
  updatePassenger(
    @Args('input') input: UpdatePassengerInput,
  ): Promise<Passenger> {
    return this.passengerService.update(input);
  }

  @Mutation(() => Passenger, {
    description:
      'Delete a passenger and their associated user account (Admin only)',
  })
  deletePassenger(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Passenger> {
    return this.passengerService.delete(id);
  } // --- FIELD RESOLVERS ---



  @ResolveField(() => User, { nullable: true })
  user(
    @Parent() passenger: Passenger,
    // Use the one-to-one loader for User by ID (from AuthLoader)
    @Loader('userById') userLoader: DataLoader<string, User>,
  ): Promise<User> | null {
    if (!passenger.userId) return null;
    return userLoader.load(passenger.userId);
  }

  @ResolveField(() => [Booking], { nullable: true })
  bookings(
    @Parent() passenger: Passenger,
    // Use the one-to-many loader for Bookings by Passenger ID (from BookingLoader)
    @Loader('bookingsByPassengerId') bookingsLoader: DataLoader<string, Booking[]>,
  ): Promise<Booking[]> {
    if (!passenger.id) return Promise.resolve([]);
    return bookingsLoader.load(passenger.id);
  }
  // @ResolveField(() => User, { nullable: true }) // 💡 Match the Entity's nullable: true
  // user(@Parent() passenger: Passenger): Promise<User> | null {
  //   // If the foreign key is null, return null immediately (no DB query needed)
  //   if (!passenger.userId) return null; // Assuming authService.findOne takes a User ID and returns User | null
  //   return this.authService.findOne(passenger.userId);
  // }

  // @ResolveField(() => [Booking], { nullable: true })
  // bookings(@Parent() passenger: Passenger): Promise<Booking[]> {
  //   if (!passenger.id) return Promise.resolve([]); // Assuming bookingService.findBookingsByPassenger is implemented
  //   return this.bookingService.findBookingsByPassenger(passenger.id);
  // }
}
