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

  // // === Relationships ===

  // // 1. Staff Relationship (Existing)
  // @Field(() => Staff, { nullable: true })
  // @OneToOne(() => Staff, (staff) => staff.user)
  // @JoinColumn()
  // staff?: Staff;

  // // 2. Passenger Relationship (Existing)
  // @Field(() => Passenger, { nullable: true })
  // @OneToOne(() => Passenger, (passenger) => passenger.user)
  // @JoinColumn()
  // passenger?: Passenger;

  // 3. PUSH DEVICE Relationship (New)
  /**
   * Links a user to multiple push notification subscriptions (Player IDs/devices).
   * Note: The foreign key (userId) will be defined on the PushDevice entity.
   */
  @Field(() => [PushDevice], { nullable: 'itemsAndList' }) // 👈 Expose list of devices in GraphQL
  @OneToMany(() => PushDevice, (pushDevice) => pushDevice.user)
  pushDevices: PushDevice[]; // Array of devices
}



// src/user/entities/user.entity.ts
// import { ObjectType, Field, ID } from '@nestjs/graphql';
// import { Staff } from 'src/staff/entities/staff.entity';
// import { Passenger } from 'src/passenger/entities/passenger.entity';
// import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

// @ObjectType() // Expose this class to the GraphQL schema
// @Entity('users')
// export class User {
//   @Field(() => ID)
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Field()
//   @Column({ unique: true })
//   email: string;

//   // Don't expose passwords in GraphQL!
//   @Column()
//   password: string;

//   @Field(() => String)
//   @Column({
//     type: 'enum',
//     enum: ['Admin', 'Staff', 'Passenger'],
//   })
//   role: 'Admin' | 'Staff' | 'Passenger';

//   // === Relationships ===

//   @Field(() => Staff, { nullable: true })
//   @OneToOne(() => Staff, (staff) => staff.user)
//   @JoinColumn()
//   staff?: Staff;

//   @Field(() => Passenger, { nullable: true })
//   @OneToOne(() => Passenger, (passenger) => passenger.user)
//   @JoinColumn()
//   passenger?: Passenger;
// }



