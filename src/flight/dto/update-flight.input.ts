import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateFlightInput } from './create-flight.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateFlightInput extends PartialType(CreateFlightInput) {
  @Field(() => ID)
  @IsUUID('4', { message: 'id must be a valid UUID' })
  id: string;
}
