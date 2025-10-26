import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Flight } from 'src/flight/entities/flight.entity';
import { Passenger } from 'src/passenger/entities/passenger.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';

@ObjectType() // 👈 Expose this entity as a GraphQL type
@Entity('bookings')
@Unique(['flight', 'seatNumber']) // Enforce unique seat per flight
export class Booking {
  @Field(() => ID) // 👈 GraphQL ID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  seatNumber: string;

  @Field() // Expose bookingDate to GraphQL
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: Date;

  // 🧩 Relationships

  @Field(() => Passenger) // 👈 GraphQL knows Booking → Passenger relation
  @ManyToOne(() => Passenger, passenger => passenger.bookings)
  passenger: Passenger;

  @Field(() => Flight) // 👈 GraphQL knows Booking → Flight relation
  @ManyToOne(() => Flight, flight => flight.bookings)
  flight: Flight;
}









// // src/booking/booking.entity.ts
// import { Flight } from 'src/flight/entities/flight.entity';
// import { Passenger } from 'src/passenger/entities/passenger.entity';
// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';


// @Entity('bookings')
// @Unique(['flight', 'seatNumber']) // Enforces unique seat allocation per flight
// export class Booking {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   seatNumber: string;

//   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//   bookingDate: Date;

//   // Relationships
//   @ManyToOne(() => Passenger, passenger => passenger.bookings)
//   passenger: Passenger;

//   @ManyToOne(() => Flight, flight => flight.bookings)
//   flight: Flight;
// }