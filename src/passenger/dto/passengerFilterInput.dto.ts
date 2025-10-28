import { IsOptional, IsString } from "class-validator";
import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class PassengerFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  passportNumber?: string;
  
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string; 
}