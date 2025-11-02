import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Flight } from 'src/flight/entities/flight.entity';
import { Passenger } from 'src/passenger/entities/passenger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Flight, Passenger])],
  providers: [BookingService, BookingResolver],
  exports: [BookingService],
})
export class BookingModule {}
