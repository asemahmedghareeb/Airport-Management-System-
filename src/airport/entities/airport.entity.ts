// src/airport/airport.entity.ts
import { Flight } from 'src/flight/entities/flight.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('airports')
export class Airport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // IATA Code (e.g., JFK)

  @Column()
  name: string;

  @Column({ nullable: true })
  city: string;

  // 1:N relationship with Flights (Departure)
  @OneToMany(() => Flight, flight => flight.departureAirport)
  departingFlights: Flight[];

  // 1:N relationship with Flights (Destination)
  @OneToMany(() => Flight, flight => flight.destinationAirport)
  arrivingFlights: Flight[];

  // 1:N relationship with Staff
  @OneToMany(() => Staff, staff => staff.airport)
  staff: Staff[];
}