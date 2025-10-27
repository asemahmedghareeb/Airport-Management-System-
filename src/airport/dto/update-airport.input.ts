import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateAirportInput } from './create-airport.input';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateAirportInput extends PartialType(CreateAirportInput) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Airport ID is required' })
  @IsUUID('4', { message: 'Airport ID must be a valid UUID v4' })
  id: string;
}
