import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Passenger } from "../entities/passenger.entity";

@ObjectType()
export class PaginatedPassenger {
  @Field(() => [Passenger])
  items: Passenger[];

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalPages: number;
}