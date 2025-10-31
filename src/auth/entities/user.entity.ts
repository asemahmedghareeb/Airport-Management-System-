// src/user/entities/user.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Staff } from 'src/staff/entities/staff.entity';
import { Passenger } from 'src/passenger/entities/passenger.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm'; // 👈 ADD OneToMany
import { PushDevice } from 'src/push-notifications/entities/PushDevice.entity';
// 👈 IMPORT PushDevice entity

@ObjectType() // Expose this class to the GraphQL schema
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  // Don't expose passwords in GraphQL!
  @Column()
  password: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: ['Admin', 'Staff', 'Passenger'],
  })
  role: 'Admin' | 'Staff' | 'Passenger';


  @Field(() => [PushDevice], { nullable: 'itemsAndList' }) 
  @OneToMany(() => PushDevice, (pushDevice) => pushDevice.user)
  pushDevices: PushDevice[]; 
}


