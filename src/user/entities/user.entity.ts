// src/user/user.entity.ts
import { Staff } from 'src/staff/entities/staff.entity';
import { Passenger } from 'src/passenger/entities/passenger.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed password

  @Column({
    type: 'enum',
    enum: ['Admin', 'Staff', 'Passenger'],
  })
  role: 'Admin' | 'Staff' | 'Passenger';

  // 1:1 relationship with Staff (if role is Staff or Admin)
  @OneToOne(() => Staff, staff => staff.user)
  @JoinColumn()
  staff: Staff;

  // 1:1 relationship with Passenger (if role is Passenger)
  @OneToOne(() => Passenger, passenger => passenger.user)
  @JoinColumn()
  passenger: Passenger;
}