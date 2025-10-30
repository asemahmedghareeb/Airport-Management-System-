import { Module, forwardRef } from '@nestjs/common';
import { FlightService } from './flight.service';
import { FlightResolver } from './flight.resolver';
import { StaffModule } from 'src/staff/staff.module';
import { AirportModule } from 'src/airport/airport.module';
import { BookingModule } from 'src/booking/booking.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Airport } from 'src/airport/entities/airport.entity';
import { FlightLoader } from './flight.loader';
import { OneSignalService } from 'src/push-notifications/onesignal.service';
import { Booking } from 'src/booking/entities/booking.entity';
import { User } from 'src/auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Flight, Airport, Booking, User]),
    forwardRef(() => StaffModule),
    forwardRef(() => AirportModule),
    forwardRef(() => BookingModule),
  ],
  providers: [FlightService, FlightResolver, FlightLoader, OneSignalService],
  exports: [FlightService, FlightLoader, FlightLoader],
})
export class FlightModule {}
