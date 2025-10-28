import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Flight } from './flight.entity';
import { Staff } from 'src/staff/entities/staff.entity';

@ObjectType() // Expose as GraphQL type
@Entity('flight_staff')
export class FlightStaff {
  // === Composite Primary Keys ===

  @Field(() => ID)
  @PrimaryColumn()
  flightId: string;

  @Field(() => ID)
  @PrimaryColumn()
  staffId: string;

  // === Extra column ===

  @Field({ nullable: true })
  @Column({ nullable: true })
  assignedRoleOnFlight?: string; // e.g., "Captain", "First Officer"

  // === Relationships ===

  @Field(() => Flight)
  @ManyToOne(() => Flight, (flight) => flight.staffAssignments, {
    onDelete: 'CASCADE',
  })
  flight: Flight;

  @Field(() => Staff)
  @ManyToOne(() => Staff, (staff) => staff.flightAssignments, {
    onDelete: 'CASCADE',
  })
  staff: Staff;
}





