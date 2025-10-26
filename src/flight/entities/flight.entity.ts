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
} from 'typeorm';

@ObjectType() // Expose this entity as a GraphQL type
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

  // === Relationships ===

  @Field(() => Airport)
  @ManyToOne(() => Airport, (airport) => airport.departingFlights)
  departureAirport: Airport;

  @Field(() => Airport)
  @ManyToOne(() => Airport, (airport) => airport.arrivingFlights)
  destinationAirport: Airport;

  @Field(() => [Booking], { nullable: 'itemsAndList' })
  @OneToMany(() => Booking, (booking) => booking.flight)
  bookings: Booking[];

  @Field(() => [FlightStaff], { nullable: 'itemsAndList' })
  @OneToMany(() => FlightStaff, (flightStaff) => flightStaff.flight)
  staffAssignments: FlightStaff[];
}





















// // src/flight/flight.entity.ts
// import { Airport } from 'src/airport/entities/airport.entity';
// import { Booking } from 'src/booking/entities/booking.entity';
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   OneToMany,
// } from 'typeorm';
// import { FlightStaff } from './flight_staff';

// @Entity('flights')
// export class Flight {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ unique: true })
//   flightNumber: string;

//   @Column()
//   airline: string;

//   @Column({ type: 'timestamp' })
//   departureTime: Date;

//   @Column({ type: 'timestamp' })
//   arrivalTime: Date;

//   @Column('int')
//   availableSeats: number;

//   @Column({
//     type: 'enum',
//     enum: ['ON_TIME', 'DELAYED', 'CANCELED'],
//   })
//   status: string;
//   // N:1 relationship with Airport (Departure)

//   @ManyToOne(() => Airport, (airport) => airport.departingFlights)
//   departureAirport: Airport;
//   // N:1 relationship with Airport (Destination)

//   @ManyToOne(() => Airport, (airport) => airport.arrivingFlights)
//   destinationAirport: Airport;
//   // 1:N relationship with Bookings

//   @OneToMany(() => Booking, (booking) => booking.flight)
//   bookings: Booking[];
//   //relationship is now 1:N to the join table

//   @OneToMany(() => FlightStaff, (flightStaff) => flightStaff.flight)
//   staffAssignments: FlightStaff[];
// }
