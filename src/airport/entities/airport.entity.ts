import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Flight } from 'src/flight/entities/flight.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@ObjectType()
@Entity('airports')
export class Airport {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  code: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  city: string;

  @Field(() => [Flight], { nullable: true })
  @OneToMany(() => Flight, (flight) => flight.departureAirport)
  departingFlights: Flight[];

  @Field(() => [Flight], { nullable: true })
  @OneToMany(() => Flight, (flight) => flight.destinationAirport)
  arrivingFlights: Flight[];

  @Field(() => [Staff], { nullable: true })
  @OneToMany(() => Staff, (staff) => staff.airport)
  staff: Staff[];
}
