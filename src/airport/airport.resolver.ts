import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Context,
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
import { Loader } from 'src/dataloader/decorators/loader.decorator';
import DataLoader from 'dataloader';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Resolver(() => Airport)
export class AirportResolver {
  constructor(
    private readonly airportService: AirportService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Airport)
  createAirport(@Args('input') input: CreateAirportInput) {
    return this.airportService.create(input);
  }

  @Query(() => PaginatedAirportResponse)
  async airports(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination: PaginationInput,
  ): Promise<PaginatedAirportResponse> {
    return this.airportService.findAll(pagination);
  }


  @Query(() => Airport)
  airport(@Args('id', { type: () => ID }) id: string) {
    return this.airportService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Airport)
  updateAirport(@Args('input') input: UpdateAirportInput) {
    return this.airportService.update(input.id, input);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Boolean)
  removeAirport(@Args('id', { type: () => ID }) id: string) {
    return this.airportService.remove(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ResolveField('departingFlights', () => [Flight], { nullable: true })
  async getDepartingFlights(
    @Parent() airport: Airport,
    @Loader('flightsByDepartureAirportId')
    flightsLoader: DataLoader<string, Flight>,
  ) {
    return flightsLoader.load(airport.id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ResolveField('arrivingFlights', () => [Flight], { nullable: true })
  async getArrivingFlights(
    @Parent() airport: Airport,
    @Loader('flightsByArrivalAirportId')
    flightsLoader: DataLoader<string, Flight>,
  ) {
    return flightsLoader.load(airport.id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ResolveField('staff', () => [Staff], { nullable: true })
  async getStaff(
    @Parent() airport: Airport,
    @Loader('staffByAirportId') staffLoader: DataLoader<string, Staff>,
  ) {
    return staffLoader.load(airport.id);
  }
}
