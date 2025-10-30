// src/subscriptions/push-device.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushDevice } from './entities/PushDevice.entity';
import { RegisterPushDeviceInput } from './dto/register-push-device.input';

@Injectable()
export class PushDeviceService {
  constructor(
    @InjectRepository(PushDevice)
    private readonly pushDeviceRepo: Repository<PushDevice>,
  ) {}

  
  async registerDevice(
    userId: string, // Obtained securely from the request context (Auth Guard)
    input: RegisterPushDeviceInput,
  ): Promise<PushDevice> {
    
    // 1. Check if this Player ID already exists for this user (e.g., if the user refreshes the page)
    let device = await this.pushDeviceRepo.findOne({
      where: { playerId: input.playerId },
    });

    if (device) {
      // If the device already exists, update its link to the current user (handles multi-user sign-in on one device)
      if (device.userId !== userId) {
         device.userId = userId;
         return this.pushDeviceRepo.save(device);
      }
      // If it's the same user, just return the existing record
      return device;
    }

    // 2. If it's a new Player ID, create a new record
    const newDevice = this.pushDeviceRepo.create({
      userId,
      playerId: input.playerId,
      deviceType: input.deviceType,
    });

    return this.pushDeviceRepo.save(newDevice);
  }

  // NOTE: You will also implement the findPlayerIdsByUserIds method here (or a separate SubscriptionService)
}


//  https://onesignal.com/api/v1/players/2b050466-9316-4a5a-af3b-0932e8da56bc?app_id=1cefead9-1742-46e2-8e0b-73187bfef877