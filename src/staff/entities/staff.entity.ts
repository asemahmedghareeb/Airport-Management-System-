import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Airport } from 'src/airport/entities/airport.entity';
import { User } from 'src/auth/entities/user.entity';
import { FlightStaff } from 'src/flight/entities/flight_staff';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@ObjectType()
@Entity('staff')
export class Staff {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  employeeId: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  role: string;

  @Column({ type: 'uuid' })
  airportId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Airport)
  @ManyToOne(() => Airport, (airport) => airport.staff)
  @JoinColumn({ name: 'airportId' })
  airport: Airport;

  @Field(() => [FlightStaff], { nullable: 'itemsAndList' })
  @OneToMany(() => FlightStaff, (flightStaff) => flightStaff.staff)
  flightAssignments: FlightStaff[];
}
