// src/user/entities/user.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'; // 👈 ADD OneToMany
import { PushDevice } from 'src/push-notifications/entities/PushDevice.entity';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

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
