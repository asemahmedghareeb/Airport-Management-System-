import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AirportService } from './airport.service';
import { Airport } from './entities/airport.entity';

@Resolver(() => Airport)
export class AirportResolver {
  constructor(private readonly airportService: AirportService) {}

}
