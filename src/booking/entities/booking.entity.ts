// src/booking/booking.entity.ts
import { Flight } from 'src/flight/entities/flight.entity';
import { Passenger } from 'src/passenger/entities/passenger.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';


@Entity('bookings')
@Unique(['flight', 'seatNumber']) // Enforces unique seat allocation per flight
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seatNumber: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: Date;

  // Relationships
  @ManyToOne(() => Passenger, passenger => passenger.bookings)
  passenger: Passenger;

  @ManyToOne(() => Flight, flight => flight.bookings)
  flight: Flight;
}