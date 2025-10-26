// src/passenger/passenger.entity.ts
import { Booking } from 'src/booking/entities/booking.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';


@Entity('passengers')
export class Passenger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  passportNumber: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  nationality: string;

  // Relationships
  @OneToOne(() => User, user => user.passenger, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Booking, booking => booking.passenger)
  bookings: Booking[];
}