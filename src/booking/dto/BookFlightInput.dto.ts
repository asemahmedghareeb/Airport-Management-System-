import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class BookFlightInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  passengerId?: string;

  @Field(() => ID)
  @IsUUID()
  flightId: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Seat number is required.' })
  seatNumber: string;
}

@InputType()
export class UpdateBookingInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  seatNumber?: string;
}
