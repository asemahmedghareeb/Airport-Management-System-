// src/staff/entities/staff.entity.ts
import { Airport } from 'src/airport/entities/airport.entity';
import { FlightStaff } from 'src/flight/entities/flight_staff';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  OneToMany,
} from 'typeorm'; // Removed ManyToMany


@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  employeeId: string;

  @Column()
  name: string;

  @Column()
  role: string; // pilot, crew, security, etc.
  // Relationships

  @OneToOne(() => User, (user) => user.staff, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Airport, (airport) => airport.staff)
  airport: Airport; // CORRECTED: N:M relationship is now 1:N to the join table

  @OneToMany(() => FlightStaff, (flightStaff) => flightStaff.staff)
  flightAssignments: FlightStaff[]; // <-- This is the property that was missing!
}
