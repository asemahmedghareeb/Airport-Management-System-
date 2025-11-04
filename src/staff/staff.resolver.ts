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
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { AirportLoader } from 'src/dataLoaders/airport.loader';
import { StaffLoader } from 'src/dataLoaders/staff.loader';
import { UserLoader } from 'src/dataLoaders/user.loader';
import { IsStaffAdmin } from './guards/isStaffAdmin.guard';
import { IsAirportAdmin } from 'src/airport/guards/isAirportAdmin.guard';
import { IsFlightAdmin } from 'src/flight/guards/isFlightAdmin.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Resolver(() => Staff)
export class StaffResolver {
  constructor(
    private readonly staffService: StaffService,
    private readonly airportLoader: AirportLoader,
    private readonly staffLoader: StaffLoader,
    private readonly userLoader: UserLoader,
  ) {}

  @Roles(Role.SUPER_ADMIN)
  @Query(() => PaginatedStaff, {
    name: 'staffMembers',
  })
  findAll(
    @Args('pagination', { nullable: true })
    pagination: PaginationInput = { page: 1, limit: 10 },
    @Args('filter', { nullable: true }) filter: StaffFilterInput = {},
  ): Promise<PaginatedStaff> {
    return this.staffService.findAll(pagination, filter);
  }

  @UseGuards(IsStaffAdmin)
  @Roles(Role.ADMIN)
  @Query(() => Staff, {
    name: 'staffMember',
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Staff> {
    return this.staffService.findOne(id);
  }

  @UseGuards(IsAirportAdmin)
  @Roles(Role.ADMIN)
  @Query(() => [Staff], {
    name: 'staffByAirport',
  })
  staffByAirport(
    @Args('airportId', { type: () => ID }) airportId: string,
  ): Promise<Staff[]> {
    return this.staffService.findByAirport(airportId);
  }

  @UseGuards(IsFlightAdmin)
  @Roles(Role.ADMIN)
  @Query(() => [Staff], {
    name: 'staffByFlight',
  })
  staffByFlight(
    @Args('flightId', { type: () => ID }) flightId: string,
  ): Promise<Staff[]> {
    return this.staffService.findByFlight(flightId);
  }

  @UseGuards(IsStaffAdmin)
  @Roles(Role.ADMIN)
  @Mutation(() => Staff)
  updateStaff(@Args('input') input: UpdateStaffInput): Promise<Staff> {
    return this.staffService.update(input);
  }

  @UseGuards(IsStaffAdmin)
  @Roles(Role.ADMIN)
  @Mutation(() => Staff)
  deleteStaff(@Args('id', { type: () => ID }) id: string): Promise<Staff> {
    return this.staffService.delete(id);
  }

  @UseGuards(IsFlightAdmin, IsStaffAdmin)
  @Roles(Role.ADMIN)
  @Mutation(() => FlightStaff)
  assignStaffToFlight(
    @Args('input') input: AssignStaffToFlightInput,
  ): Promise<FlightStaff> {
    return this.staffService.assignToFlight(input);
  }

  @ResolveField(() => User)
  user(@Parent() staff: Staff): Promise<User> | null {
    if (!staff.userId) return null;
    return this.userLoader.userById.load(staff.userId);
  }

  @ResolveField(() => Airport)
  airport(@Parent() staff: Staff): Promise<Airport> | null {
    if (!staff.airportId) return null;
    return this.airportLoader.airportById.load(staff.airportId);
  }

  @ResolveField(() => [FlightStaff], { nullable: true })
  flightAssignments(@Parent() staff: Staff): Promise<FlightStaff[]> {
    return this.staffLoader.flightAssignmentsByStaffId.load(staff.id);
  }
}
