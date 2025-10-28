
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Flight } from 'src/flight/entities/flight.entity';
import { Passenger } from 'src/passenger/entities/passenger.entity';
// Import JoinColumn decorator
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn } from 'typeorm';

@ObjectType()
@Entity('bookings')
@Unique(['flightId', 'seatNumber']) // 👈 Changed to use the column name
export class Booking {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  seatNumber: string;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: Date;

  // --- EXPLICIT FOREIGN KEY COLUMNS ---

  // NOTE: We don't necessarily expose these to GraphQL, so no @Field() needed
  @Column({ type: 'uuid' }) 
  passengerId: string; 

  @Column({ type: 'uuid' }) 
  flightId: string;

  // 🧩 Relationships

  @Field(() => Passenger)
  @ManyToOne(() => Passenger, passenger => passenger.bookings)
  // Optional: Use JoinColumn to map the relation to the explicit column
  @JoinColumn({ name: 'passengerId' }) 
  passenger: Passenger;

  @Field(() => Flight)
  @ManyToOne(() => Flight, flight => flight.bookings)
  @JoinColumn({ name: 'flightId' })
  flight: Flight;
}








