import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Flight } from '../entities/flight.entity';

@ObjectType()
export class PaginatedFlightResponse {
  @Field(() => [Flight])
  items: Flight[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Boolean)
  hasNextPage: boolean;
}
