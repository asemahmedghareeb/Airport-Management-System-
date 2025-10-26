import { Module } from '@nestjs/common';
import { FlightService } from './flight.service';
import { FlightResolver } from './flight.resolver';

@Module({
  providers: [FlightResolver, FlightService],
})
export class FlightModule {}
