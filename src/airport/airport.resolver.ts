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
import { FlightService } from 'src/flight/flight.service';
import { StaffService } from 'src/staff/staff.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { PaginationInput } from '../common/pagination.input';
import { PaginatedAirportResponse } from './dto/paginated-airport.response';
import * as graphqlContextInterface from 'src/dataloader/interfaces/graphql-context.interface';
import { Loader } from 'src/dataloader/decorators/loader.decorator';
import DataLoader from 'dataloader';

@Resolver(() => Airport)
export class AirportResolver {
  constructor(
    private readonly airportService: AirportService,
    private readonly flightService: FlightService,
    private readonly staffService: StaffService,
  ) {}

  // ✅ CREATE Airport (Admin only)
  @Mutation(() => Airport)
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN)
  createAirport(@Args('input') input: CreateAirportInput) {
    return this.airportService.create(input);
  }

  // ✅ GET all airports
  @Query(() => PaginatedAirportResponse)
  async airports(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination: PaginationInput,
  ): Promise<PaginatedAirportResponse> {
    return this.airportService.findAll(pagination);
  }

  // ✅ GET single airport by ID
  @Query(() => Airport)
  airport(@Args('id', { type: () => ID }) id: string) {
    return this.airportService.findOne(id);
  }

  // ✅ UPDATE Airport (Admin only)
  @Mutation(() => Airport)
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN)
  updateAirport(@Args('input') input: UpdateAirportInput) {
    return this.airportService.update(input.id, input);
  }

  // ✅ DELETE Airport (Admin only)
  @Mutation(() => Boolean)
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN)
  removeAirport(@Args('id', { type: () => ID }) id: string) {
    return this.airportService.remove(id);
  }

  @ResolveField('departingFlights', () => [Flight], { nullable: true })
  async getDepartingFlights(
    @Parent() airport: Airport,
    @Loader('flightsByDepartureAirportId') flightsLoader: DataLoader<string, Flight>, 
    // @Context() { loaders }: graphqlContextInterface.IGraphQLContext,
  ) {
    return flightsLoader.load(airport.id);
  }

  @ResolveField('arrivingFlights', () => [Flight], { nullable: true })
  async getArrivingFlights(
    @Parent() airport: Airport,
    @Loader('flightsByArrivalAirportId') flightsLoader: DataLoader<string, Flight>, 
    // @Context() { loaders }: graphqlContextInterface.IGraphQLContext,
  ) {
    return flightsLoader.load(airport.id);
  }

  @ResolveField('staff', () => [Staff], { nullable: true })
  async getStaff(
    @Parent() airport: Airport,
    @Loader('staffByAirportId') staffLoader: DataLoader<string, Staff>, 
    // @Context() { loaders }: graphqlContextInterface.IGraphQLContext,
  ) {
    return staffLoader.load(airport.id);
  }

}




// // ✅ Related Fields (optional DataLoader optimization later)
// @ResolveField(() => [Flight], { nullable: true })
// departingFlights(@Parent() airport: Airport) {
//   return this.flightService.findDepartingFlights(airport.id);
// }

// @ResolveField(() => [Flight], { nullable: true })
// arrivingFlights(@Parent() airport: Airport) {
//   return this.flightService.findArrivingFlights(airport.id);
// }

// @ResolveField(() => [Staff], { nullable: true })
// staff(@Parent() airport: Airport) {
//   return this.staffService.findByAirport(airport.id);
// }

