import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@ObjectType()
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

  @Column({ type: 'uuid' })
  userId: string; 

  @Field(() => User) 
  // @OneToOne(() => User, (user) => user.passenger, { onDelete: 'CASCADE' })
  @OneToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => [Booking], { nullable: 'itemsAndList' })
  @OneToMany(() => Booking, (booking) => booking.passenger)
  bookings: Booking[];
}
