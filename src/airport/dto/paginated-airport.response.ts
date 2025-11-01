import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Airport } from '../entities/airport.entity';

@ObjectType()
export class PaginatedAirportResponse {
  @Field(() => [Airport])
  items: Airport[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}
