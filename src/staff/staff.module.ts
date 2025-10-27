import { Module, forwardRef } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffResolver } from './staff.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { FlightStaff } from 'src/flight/entities/flight_staff';
import { FlightModule } from 'src/flight/flight.module';
import { AirportModule } from 'src/airport/airport.module';

@Module({
  imports: [
    forwardRef(() => FlightModule),
    forwardRef(() => AirportModule),
    TypeOrmModule.forFeature([Staff, FlightStaff]),
  ],
  exports: [StaffService],
  providers: [StaffResolver, StaffService],
})
export class StaffModule {}
