import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Flight } from 'src/flight/entities/flight.entity';
import { Passenger } from 'src/passenger/entities/passenger.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';

@ObjectType()
@Entity('bookings')
@Unique(['flightId', 'seatNumber'])
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

  @Column({ type: 'uuid' })
  passengerId: string;

  @Column({ type: 'uuid' })
  flightId: string;

  @Field(() => Passenger)
  @ManyToOne(() => Passenger, (passenger) => passenger.bookings)
  @JoinColumn({ name: 'passengerId' })
  passenger: Passenger;

  @Field(() => Flight)
  @ManyToOne(() => Flight, (flight) => flight.bookings)
  @JoinColumn({ name: 'flightId' })
  flight: Flight;
}
