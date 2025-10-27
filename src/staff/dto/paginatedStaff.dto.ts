import { Field, ObjectType, Int } from "@nestjs/graphql";
import { Staff } from "../entities/staff.entity";

@ObjectType()
export class PaginatedStaff {
  @Field(() => [Staff])
  items: Staff[];

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalPages: number;
}   