import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateFlightInput } from './create-flight.input';
import { IsUUID, IsOptional } from 'class-validator';

@InputType()
export class UpdateFlightInput extends PartialType(CreateFlightInput) {
  @IsOptional()
  @Field(() => ID)
  @IsUUID('4', { message: 'id must be a valid UUID' })
  id: string;
}
