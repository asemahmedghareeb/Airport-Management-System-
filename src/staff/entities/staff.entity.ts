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
  JoinColumn, // 👈 Import JoinColumn
} from 'typeorm';

@ObjectType() // Expose this entity as a GraphQL type
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
  role: string; // === EXPLICIT FOREIGN KEY COLUMNS ===

  @Column({ type: 'uuid' }) // Assuming mandatory OneToOne
  userId: string;

  @Column({ type: 'uuid' }) // Assuming mandatory ManyToOne
  airportId: string; // ====================================
  // === Relationships ===
  @Field(() => User)
  @OneToOne(() => User, (user) => user.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // 👈 Link to the new column
  user: User;

  @Field(() => Airport)
  @ManyToOne(() => Airport, (airport) => airport.staff)
  @JoinColumn({ name: 'airportId' }) // 👈 Link to the new column
  airport: Airport;

  @Field(() => [FlightStaff], { nullable: 'itemsAndList' })
  @OneToMany(() => FlightStaff, (flightStaff) => flightStaff.staff)
  flightAssignments: FlightStaff[];
}
