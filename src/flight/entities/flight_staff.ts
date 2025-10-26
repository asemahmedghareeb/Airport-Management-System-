// src/flight-staff/flight-staff.entity.ts
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Flight } from './flight.entity';
import { Staff } from 'src/staff/entities/staff.entity';

@Entity('flight_staff')
export class FlightStaff {
  // Compound Primary Key - FK to Flight
  @PrimaryColumn()
  flightId: string; // Compound Primary Key - FK to Staff

  @PrimaryColumn()
  staffId: string;

  @Column({ nullable: true })
  assignedRoleOnFlight: string; // e.g., "Captain", "First Officer"
  // N:1 Relationship to Flight

  @ManyToOne(() => Flight, (flight) => flight.staffAssignments, {
    onDelete: 'CASCADE',
  })
  flight: Flight; // N:1 Relationship to Staff

  @ManyToOne(() => Staff, (staff) => staff.flightAssignments, {
    onDelete: 'CASCADE',
  })
  staff: Staff;
}
