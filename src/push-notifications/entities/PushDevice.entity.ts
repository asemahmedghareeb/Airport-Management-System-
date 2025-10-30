// src/subscriptions/entities/push_device.entity.ts

import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/auth/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
 // Adjust path to your User entity

// Enum for device types (optional, but good practice)
export enum DeviceType {
  WEB = 'WEB',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}
registerEnumType(DeviceType, {
  name: 'DeviceType', // The name of the GraphQL Enum type
  description: 'The type of device/platform used for push notifications',
});


@ObjectType()
@Entity('push_devices')
@Index(['userId', 'playerId'], { unique: true }) // Ensures one user doesn't register the same player ID twice
export class PushDevice {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // === Foreign Key (The User) ===
  // 1. The ID of the user who owns this device/subscription
  @Field(() => String)
  @Column({ type: 'uuid' })
  userId: string;

  // 2. The relationship with the User entity
  @ManyToOne(() => User, (user) => user.pushDevices, { onDelete: 'CASCADE' })
  user: User;
  // ===============================

  @Field()
  @Column({ unique: true }) // The OneSignal Player ID is unique across devices/apps
  playerId: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.WEB,
  })
  deviceType: DeviceType;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}