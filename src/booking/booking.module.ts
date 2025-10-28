import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Flight } from 'src/flight/entities/flight.entity';
import { Passenger } from 'src/passenger/entities/passenger.entity';
import { FlightModule } from 'src/flight/flight.module';
import { PassengerModule } from 'src/passenger/passenger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Flight, Passenger]),
    forwardRef(() => FlightModule),
    forwardRef(() => PassengerModule),
  ],
  providers: [BookingService, BookingResolver],
  exports: [BookingService], // ✅ must export
})
export class BookingModule {}
