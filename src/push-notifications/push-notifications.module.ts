import { Module } from '@nestjs/common';
import { PushDeviceService } from './push-notifications.service';
import { PushDeviceResolver } from './push-notifications.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushDevice } from './entities/PushDevice.entity';
import { OneSignalService } from './onesignal.service';

@Module({
  imports: [TypeOrmModule.forFeature([PushDevice])],
  providers: [PushDeviceService, PushDeviceResolver,OneSignalService],
})
export class PushNotificationsModule {}
