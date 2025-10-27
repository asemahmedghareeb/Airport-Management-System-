import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

@InputType()
export class CreateAirportInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Airport code must be exactly 3 characters (IATA format)' })
  code: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Airport name is required' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;
}
