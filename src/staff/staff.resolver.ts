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
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';

@UseGuards(AuthGuard)
@Resolver(() => Staff)
export class StaffResolver {
  constructor(private readonly staffService: StaffService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
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

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => Staff, {
    name: 'staffMember',
    description: 'Retrieve a single staff member by ID',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Staff> {
    return this.staffService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
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

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
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

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Staff, { description: 'Update a staff member (Admin only)' })
  updateStaff(@Args('input') input: UpdateStaffInput): Promise<Staff> {
    return this.staffService.update(input);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Staff, {
    description:
      'Delete a staff member and their associated user account (Admin only)',
  })
  deleteStaff(@Args('id', { type: () => ID }) id: string): Promise<Staff> {
    return this.staffService.delete(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
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
    @Loader('userById') userLoader: DataLoader<string, User>,
  ): Promise<User> | null {
    if (!staff.userId) return null;
    return userLoader.load(staff.userId);
  }

  @ResolveField(() => Airport)
  airport(
    @Parent() staff: Staff,
    @Loader('airportById') airportLoader: DataLoader<string, Airport>,
  ): Promise<Airport> | null {
    if (!staff.airportId) return null;
    return airportLoader.load(staff.airportId);
  }

  @ResolveField(() => [FlightStaff], { nullable: true })
  flightAssignments(
    @Parent() staff: Staff,
    @Loader('flightAssignmentsByStaffId')
    flightAssignmentsLoader: DataLoader<string, FlightStaff[]>,
  ): Promise<FlightStaff[]> {
    return flightAssignmentsLoader.load(staff.id);
  }
}
