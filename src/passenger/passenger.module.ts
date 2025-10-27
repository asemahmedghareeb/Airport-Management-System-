import { Module } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { PassengerResolver } from './passenger.resolver';

@Module({
  providers: [PassengerResolver, PassengerService],
})
export class PassengerModule {}
 