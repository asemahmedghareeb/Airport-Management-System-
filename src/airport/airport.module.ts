import { Module } from '@nestjs/common';
import { AirportService } from './airport.service';
import { AirportResolver } from './airport.resolver';

@Module({
  providers: [AirportResolver, AirportService],
})
export class AirportModule {}
