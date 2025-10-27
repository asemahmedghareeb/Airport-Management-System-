import { InputType, Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString, IsInt, Min, IsNotEmpty } from 'class-validator';


// --- Pagination & Filtering DTOs (for Query) ---

@InputType()
export class StaffFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employeeId?: string;
  
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  role?: string; 
}