import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FlightService } from './flight.service';
import { Flight } from './entities/flight.entity';

@Resolver(() => Flight)
export class FlightResolver {
  constructor(private readonly flightService: FlightService) {}

 
}
