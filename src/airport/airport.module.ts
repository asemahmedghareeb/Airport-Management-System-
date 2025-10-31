import { forwardRef, Module } from '@nestjs/common';
import { AirportService } from './airport.service';
import { AirportResolver } from './airport.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightModule } from 'src/flight/flight.module';
import { StaffModule } from 'src/staff/staff.module';
import { Airport } from './entities/airport.entity';
import { AirportLoader } from './airport.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([Airport]),
    // forwardRef(() => FlightModule),
    // forwardRef(() => StaffModule),
  ],
  providers: [AirportResolver, AirportService, AirportLoader],
  exports: [AirportService, AirportLoader],
})
export class AirportModule {}
