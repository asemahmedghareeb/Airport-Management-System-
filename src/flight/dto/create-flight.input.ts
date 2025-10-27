import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';

@InputType()
export class CreateFlightInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Flight number is required' })
  flightNumber: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Airline is required' })
  airline: string;

  @Field()
  @IsDateString({}, { message: 'Departure time must be a valid ISO date string' })
  departureTime: Date;

  @Field()
  @IsDateString({}, { message: 'Arrival time must be a valid ISO date string' })
  arrivalTime: Date;

  @Field()
  @IsInt()
  @Min(1, { message: 'Available seats must be at least 1' })
  availableSeats: number;

  @Field()
  @IsIn(['ON_TIME', 'DELAYED', 'CANCELED'], {
    message: 'Status must be ON_TIME, DELAYED, or CANCELED',
  })
  status: string;

  @Field(() => ID)
  @IsUUID('4', { message: 'departureAirportId must be a valid UUID' })
  @IsNotEmpty()
  departureAirportId: string;

  @Field(() => ID)
  @IsUUID('4', { message: 'destinationAirportId must be a valid UUID' })
  @IsNotEmpty()
  destinationAirportId: string;
}
