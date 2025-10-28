import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PassengerService } from './passenger.service';
import { Passenger } from './entities/passenger.entity';
import { PaginatedPassenger } from './dto/paginatedPassenger.dto';
import { PaginationInput } from 'src/common/pagination.input';

import { UpdatePassengerInput } from './dto/passengerUpdateInput.dto';
import { PassengerFilterInput } from './dto/passengerFilterInput.dto';


// NOTE: You must apply Authorization Guards (e.g., @Roles(Role.Admin)) to these mutations later

@Resolver(() => Passenger)
export class PassengerResolver {
  constructor(private readonly passengerService: PassengerService) {}

  // --- QUERIES (READ) ---
  
  @Query(() => PaginatedPassenger, { name: 'passengers', description: 'Retrieve all passengers with pagination and filters (Admin/Staff only)' })
  findAll(
    @Args('pagination', { nullable: true }) pagination: PaginationInput = { page: 1, limit: 10 },
    @Args('filter', { nullable: true }) filter: PassengerFilterInput = {},
  ): Promise<PaginatedPassenger> {
    return this.passengerService.findAll(pagination, filter);
  }

  @Query(() => Passenger, { name: 'passenger', description: 'Retrieve a single passenger by ID (Admin/Passenger self-lookup)' })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Passenger> {
    return this.passengerService.findOne(id);
  }

  // --- MUTATIONS ---
  
  @Mutation(() => Passenger, { description: 'Update a passenger record (Admin/Passenger self-update)' })
  updatePassenger(
    @Args('input') input: UpdatePassengerInput,
  ): Promise<Passenger> {
    return this.passengerService.update(input);
  }

  @Mutation(() => Passenger, { description: 'Delete a passenger and their associated user account (Admin only)' })
  deletePassenger(@Args('id', { type: () => ID }) id: string): Promise<Passenger> {
    return this.passengerService.delete(id);
  }
}