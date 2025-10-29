import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { StaffService } from './staff.service';
import { Staff } from './entities/staff.entity';
import { FlightStaff } from '../flight/entities/flight_staff';
import { PaginatedStaff } from './dto/paginatedStaff.dto';
import { PaginationInput } from 'src/common/pagination.input';
import { StaffFilterInput } from './dto/staffFilterInput.dto';
import { UpdateStaffInput } from './dto/UpdateStaffInput.dto';
import { AssignStaffToFlightInput } from './dto/assignStaffToFlightInput';
import { User } from 'src/auth/entities/user.entity'; 
import { Airport } from 'src/airport/entities/airport.entity'; 
import DataLoader from 'dataloader';
import { Loader } from 'src/dataloader/decorators/loader.decorator';

@Resolver(() => Staff)
export class StaffResolver {
  constructor(private readonly staffService: StaffService) {}
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

  @Query(() => [Staff], {
    name: 'staffByAirport',
    description:
      'Find all staff assigned to a specific airport (Admin/Staff only)',
  })
  staffByAirport(
    @Args('airportId', { type: () => ID }) airportId: string,
  ): Promise<Staff[]> {
    return this.staffService.findByAirport(airportId);
  }

  @Query(() => [Staff], {
    name: 'staffByFlight',
    description:
      'Find all staff assigned to a specific flight (Admin/Staff only)',
  })
  staffByFlight(
    @Args('flightId', { type: () => ID }) flightId: string,
  ): Promise<Staff[]> {
    return this.staffService.findByFlight(flightId);
  }

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

  // --- FIELD RESOLVERS ---
  @ResolveField(() => User)
  user(
    @Parent() staff: Staff,
    // One-to-one: from AuthLoader
    @Loader('userById') userLoader: DataLoader<string, User>,
  ): Promise<User> | null {
    if (!staff.userId) return null;
    return userLoader.load(staff.userId);
  }

  @ResolveField(() => Airport)
  airport(
    @Parent() staff: Staff,
    // One-to-one/Many-to-One: from AirportLoader
    @Loader('airportById') airportLoader: DataLoader<string, Airport>,
  ): Promise<Airport> | null {
    if (!staff.airportId) return null;
    return airportLoader.load(staff.airportId);
  }

  @ResolveField(() => [FlightStaff], { nullable: true })
  flightAssignments(
    @Parent() staff: Staff,
    // One-to-many: New loader created below
    @Loader('flightAssignmentsByStaffId')
    flightAssignmentsLoader: DataLoader<string, FlightStaff[]>,
  ): Promise<FlightStaff[]> {
    return flightAssignmentsLoader.load(staff.id);
  }

  // @ResolveField(() => User)
  // user(@Parent() staff: Staff): Promise<User | null> {
  //   // Uses the explicit foreign key to fetch the User
  //   return this.staffService.findUserByStaffId(staff.userId);
  // }

  // @ResolveField(() => Airport)
  // airport(@Parent() staff: Staff): Promise<Airport | null> {
  //   // Uses the explicit foreign key to fetch the Airport

  //   return this.staffService.findAirportByStaffId(staff.airportId);
  // }

  // @ResolveField(() => [FlightStaff], { nullable: true })
  // flightAssignments(@Parent() staff: Staff): Promise<FlightStaff[]> {
  //   // Uses the primary key to fetch assignments
  //   return this.staffService.findFlightAssignmentsByStaffId(staff.id);
  // }
}
