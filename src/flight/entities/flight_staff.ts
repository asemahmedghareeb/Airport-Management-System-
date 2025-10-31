import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Flight } from './flight.entity';
import { Staff } from 'src/staff/entities/staff.entity';

@ObjectType() 
@Entity('flight_staff')
export class FlightStaff {

  @Field(() => ID)
  @PrimaryColumn()
  flightId: string;

  @Field(() => ID)
  @PrimaryColumn()
  staffId: string;


  @Field({ nullable: true })
  @Column({ nullable: true })
  assignedRoleOnFlight?: string; 

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





