import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsDateString } from 'class-validator';

@InputType()
export class FlightFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Airline filter must be a string' })
  airline?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Destination filter must be a string' })
  destination?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'departureAfter must be a valid date string' })
  departureAfter?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'departureBefore must be a valid date string' })
  departureBefore?: Date;
}
