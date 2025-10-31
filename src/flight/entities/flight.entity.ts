import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Airport } from 'src/airport/entities/airport.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { FlightStaff } from './flight_staff';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';

@ObjectType() 
@Entity('flights')
export class Flight {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  flightNumber: string;

  @Field()
  @Column()
  airline: string;

  @Field()
  @Column({ type: 'timestamp' })
  departureTime: Date;

  @Field()
  @Column({ type: 'timestamp' })
  arrivalTime: Date;

  @Field()
  @Column('int')
  availableSeats: number;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: ['ON_TIME', 'DELAYED', 'CANCELED'],
  })
  status: string; 


  @Column({ type: 'uuid' })
  departureAirportId: string;

  @Column({ type: 'uuid' })
  destinationAirportId: string;

  @Field(() => Airport)
  @ManyToOne(() => Airport, (airport) => airport.departingFlights)
  @JoinColumn({ name: 'departureAirportId' })
  departureAirport: Airport;

  @Field(() => Airport)
  @ManyToOne(() => Airport, (airport) => airport.arrivingFlights)
  @JoinColumn({ name: 'destinationAirportId' })
  destinationAirport: Airport;

  @Field(() => [Booking], { nullable: 'itemsAndList' })
  @OneToMany(() => Booking, (booking) => booking.flight)
  bookings: Booking[];

  @Field(() => [FlightStaff], { nullable: 'itemsAndList' })
  @OneToMany(() => FlightStaff, (flightStaff) => flightStaff.flight)
  staffAssignments: FlightStaff[];
}
