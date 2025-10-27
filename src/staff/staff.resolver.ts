import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { StaffService } from './staff.service';
import { Staff } from './entities/staff.entity';
import { FlightStaff } from '../flight/entities/flight_staff';
import { PaginatedStaff } from './dto/paginatedStaff.dto';
import { PaginationInput } from 'src/common/pagination.input';
import { StaffFilterInput } from './dto/staffFilterInput.dto';
import { UpdateStaffInput } from './dto/UpdateStaffInput.dto';
import { AssignStaffToFlightInput } from './dto/assignStaffToFlightInput';

// IMPORTANT: Apply Authorization Guards here (e.g., @Roles(Role.Admin)) to restrict access
@Resolver(() => Staff)
export class StaffResolver {
  constructor(private readonly staffService: StaffService) {}

  // --- QUERIES (READ) ---

  @Query(() => PaginatedStaff, {
    name: 'staffMembers',
    description:
      'Retrieve all staff with pagination and filters (Admin/Staff only)',
  })
  findAll(
    @Args('pagination', { nullable: true })
    pagination: PaginationInput = { page: 1, limit: 10 },
    @Args('filter', { nullable: true }) filter: StaffFilterInput = {},
  ): Promise<PaginatedStaff> {
    return this.staffService.findAll(pagination, filter);
  }

  @Query(() => Staff, {
    name: 'staffMember',
    description: 'Retrieve a single staff member by ID',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Staff> {
    return this.staffService.findOne(id);
  }


  @Query(() => [Staff], { name: 'staffByAirport', description: 'Find all staff assigned to a specific airport (Admin/Staff only)' })
  staffByAirport(@Args('airportId', { type: () => ID }) airportId: string): Promise<Staff[]> {
    return this.staffService.findByAirport(airportId);
  }

  @Query(() => [Staff], { name: 'staffByFlight', description: 'Find all staff assigned to a specific flight (Admin/Staff only)' })
  staffByFlight(@Args('flightId', { type: () => ID }) flightId: string): Promise<Staff[]> {
    return this.staffService.findByFlight(flightId);
  }

  // --- MUTATIONS ---

  @Mutation(() => Staff, { description: 'Update a staff member (Admin only)' })
  updateStaff(@Args('input') input: UpdateStaffInput): Promise<Staff> {
    return this.staffService.update(input);
  }

  @Mutation(() => Staff, {
    description:
      'Delete a staff member and their associated user account (Admin only)',
  })
  deleteStaff(@Args('id', { type: () => ID }) id: string): Promise<Staff> {
    return this.staffService.delete(id);
  }

  @Mutation(() => FlightStaff, {
    description: 'Assign a staff member to a flight (Admin/Staff only)',
  })
  assignStaffToFlight(
    @Args('input') input: AssignStaffToFlightInput,
  ): Promise<FlightStaff> {
    return this.staffService.assignToFlight(input);
  }
}
