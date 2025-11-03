import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Flight } from 'src/flight/entities/flight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Flight])],
  providers: [BookingService, BookingResolver],
  exports: [BookingService],
})
export class BookingModule {}
