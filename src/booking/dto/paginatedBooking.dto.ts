import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Booking } from "../entities/booking.entity";

@ObjectType()
export class PaginatedBooking {
  @Field(() => [Booking])
  items: Booking[];

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalPages: number;
}   