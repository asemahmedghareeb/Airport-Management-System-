import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class AssignStaffToFlightInput {
  @Field(() => ID)
  @IsUUID()
  staffId: string;

  @Field(() => ID)
  @IsUUID()
  flightId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  assignedRoleOnFlight: string; // e.g., 'Captain', 'First Officer'
}