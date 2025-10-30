// src/subscriptions/dto/register-push-device.input.ts

import { InputType, Field } from '@nestjs/graphql';
import { DeviceType } from '../entities/PushDevice.entity';

@InputType()
export class RegisterPushDeviceInput {
  @Field()
  playerId: string; // The unique ID from the OneSignal SDK

  @Field(() => DeviceType, { defaultValue: DeviceType.WEB })
  deviceType: DeviceType; // e.g., WEB, IOS, ANDROID
}