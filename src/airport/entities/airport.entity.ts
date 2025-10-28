import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Flight } from 'src/flight/entities/flight.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@ObjectType() // 👈 Marks this class as a GraphQL object type
@Entity('airports')
export class Airport {
  @Field(() => ID) // 👈 GraphQL ID type
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field() // 👈 Expose this field in the GraphQL schema
  @Column({ unique: true })
  code: string; // IATA Code (e.g., JFK)

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  city: string;

  // 1:N relationship with Flights (Departure)
  @Field(() => [Flight], { nullable: true }) // 👈 Expose list of related flights
  @OneToMany(() => Flight, flight => flight.departureAirport)
  departingFlights: Flight[];

  // 1:N relationship with Flights (Destination)
  @Field(() => [Flight], { nullable: true })
  @OneToMany(() => Flight, flight => flight.destinationAirport)
  arrivingFlights: Flight[];

  // 1:N relationship with Staff
  @Field(() => [Staff], { nullable: true })
  @OneToMany(() => Staff, staff => staff.airport)
  staff: Staff[];
}


