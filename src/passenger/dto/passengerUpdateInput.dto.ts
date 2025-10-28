import { InputType, Field, ID } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class UpdatePassengerInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string;
  
  // Passport number is typically unchangeable, but allowing it to be optional is safer.
  @Field({ nullable: true }) 
  @IsOptional()
  @IsString()
  passportNumber?: string;
}