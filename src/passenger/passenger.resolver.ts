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
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { UserLoader } from 'src/dataLoaders/user.loader';
import { BookingLoader } from 'src/dataLoaders/booking.loader';
import { IsOwnerGuard } from './guards/isIwner.guard';

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => Passenger)
export class PassengerResolver {
  constructor(
    private readonly passengerService: PassengerService,
    private readonly userLoader: UserLoader,
    private readonly bookingLoader: BookingLoader,
  ) {}

  @Roles(Role.SUPER_ADMIN)
  @Query(() => PaginatedPassenger, { name: 'passengers' })
  findAll(
    @Args('pagination', { nullable: true })
    pagination: PaginationInput = { page: 1, limit: 10 },
    @Args('filter', { nullable: true }) filter: PassengerFilterInput = {},
  ): Promise<PaginatedPassenger> {
    return this.passengerService.findAll(pagination, filter);
  }

  @UseGuards(IsOwnerGuard)
  @Roles(Role.SUPER_ADMIN, Role.PASSENGER)
  @Query(() => Passenger, {
    name: 'passenger',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Passenger> {
    return this.passengerService.findOne(id);
  }

  @UseGuards(IsOwnerGuard)
  @Roles(Role.SUPER_ADMIN, Role.PASSENGER)
  @Mutation(() => Passenger)
  updatePassenger(
    @Args('input') input: UpdatePassengerInput,
  ): Promise<Passenger> {
    return this.passengerService.update(input);
  }

  @UseGuards(IsOwnerGuard)
  @Roles(Role.SUPER_ADMIN, Role.PASSENGER)
  @Mutation(() => Passenger)
  deletePassenger(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Passenger> {
    return this.passengerService.delete(id);
  }

  @ResolveField(() => User, { nullable: true })
  user(@Parent() passenger: Passenger): Promise<User> | null {
    if (!passenger.userId) return null;
    return this.userLoader.userById.load(passenger.userId);
  }

  @ResolveField(() => [Booking], { nullable: true })
  bookings(@Parent() passenger: Passenger): Promise<Booking[]> {
    if (!passenger.id) return Promise.resolve([]);
    return this.bookingLoader.bookingsByPassengerId.load(passenger.id);
  }
}
