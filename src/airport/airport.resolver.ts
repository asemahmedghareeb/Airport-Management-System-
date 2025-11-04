import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { AirportService } from './airport.service';
import { Airport } from './entities/airport.entity';
import { CreateAirportInput } from './dto/create-airport.input';
import { UpdateAirportInput } from './dto/update-airport.input';
import { Flight } from 'src/flight/entities/flight.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { PaginationInput } from '../common/pagination.input';
import { PaginatedAirportResponse } from './dto/paginated-airport.response';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { StaffLoader } from 'src/dataLoaders/staff.loader';
import { FlightLoader } from 'src/dataLoaders/flight.loader';
import { IsAirportAdmin } from 'src/airport/guards/isAirportAdmin.guard';

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => Airport)
export class AirportResolver {
  constructor(
    private readonly airportService: AirportService,
    private readonly staffLoader: StaffLoader,
    private readonly flightLoader: FlightLoader,
  ) {}

  @Roles(Role.SUPER_ADMIN)
  @Mutation(() => Airport)
  createAirport(@Args('input') input: CreateAirportInput) {
    return this.airportService.create(input);
  }

  @Roles(Role.SUPER_ADMIN)
  @Query(() => PaginatedAirportResponse)
  async airports(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination: PaginationInput,
  ): Promise<PaginatedAirportResponse> {
    return this.airportService.findAll(pagination);
  }

  @UseGuards(IsAirportAdmin)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Query(() => Airport)
  airport(@Args('id', { type: () => ID }) id: string) {
    return this.airportService.findOne(id);
  }

  @UseGuards(IsAirportAdmin)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Mutation(() => Airport)
  updateAirport(@Args('input') input: UpdateAirportInput) {
    return this.airportService.update(input.id, input);
  }

  @Roles(Role.SUPER_ADMIN)
  @Mutation(() => Boolean)
  removeAirport(@Args('id', { type: () => ID }) id: string) {
    return this.airportService.remove(id);
  }

  @ResolveField('departingFlights', () => [Flight], { nullable: true })
  async getDepartingFlights(@Parent() airport: Airport) {
    return this.flightLoader.flightsByDepartureAirportId.load(airport.id);
  }

  @ResolveField('arrivingFlights', () => [Flight], { nullable: true })
  async getArrivingFlights(@Parent() airport: Airport) {
    return this.flightLoader.flightsByArrivalAirportId.load(airport.id);
  }

  @ResolveField('staff', () => [Staff], { nullable: true })
  async getStaff(@Parent() airport: Airport) {
    return this.staffLoader.staffByAirportId.load(airport.id);
  }
}
