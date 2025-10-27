import { Module, forwardRef } from '@nestjs/common';
import { FlightService } from './flight.service';
import { FlightResolver } from './flight.resolver';
import { StaffModule } from 'src/staff/staff.module';
import { AirportModule } from 'src/airport/airport.module';
import { BookingModule } from 'src/booking/booking.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Airport } from 'src/airport/entities/airport.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Flight, Airport]),
    forwardRef(() => StaffModule),
    forwardRef(() => AirportModule), // ✅ and this
    forwardRef(() => BookingModule), // ✅ and this
  ],
  providers: [FlightService, FlightResolver],
  exports: [FlightService],
})
export class FlightModule {}
