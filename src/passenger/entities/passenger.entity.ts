import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { Booking } from 'src/booking/entities/booking.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';

@ObjectType() // Expose this entity as a GraphQL type
@Entity('passengers')
export class Passenger {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  passportNumber: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nationality?: string;

  // === Relationships ===

  @Field(() => User)
  @OneToOne(() => User, (user) => user.passenger, { onDelete: 'CASCADE' })
  user: User;

  @Field(() => [Booking], { nullable: 'itemsAndList' })
  @OneToMany(() => Booking, (booking) => booking.passenger)
  bookings: Booking[];
}

// // src/passenger/passenger.entity.ts
// import { Booking } from 'src/booking/entities/booking.entity';
// import { User } from 'src/user/entities/user.entity';
// import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';

// @Entity('passengers')
// export class Passenger {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ unique: true })
//   passportNumber: string;

//   @Column()
//   name: string;

//   @Column({ nullable: true })
//   nationality: string;

//   // Relationships
//   @OneToOne(() => User, user => user.passenger, { onDelete: 'CASCADE' })
//   user: User;

//   @OneToMany(() => Booking, booking => booking.passenger)
//   bookings: Booking[];
// }
