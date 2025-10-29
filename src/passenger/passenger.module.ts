import { forwardRef, Module } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import { PassengerResolver } from './passenger.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Passenger } from './entities/passenger.entity';
import { User } from 'src/auth/entities/user.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BookingModule } from 'src/booking/booking.module';
import { PassengerLoader } from './passenger.loader';
@Module({
  imports: [
    TypeOrmModule.forFeature([Passenger, User, Booking]),
    AuthModule,
    forwardRef(() => BookingModule),
  ],
  providers: [PassengerResolver, PassengerService, PassengerLoader],
  exports: [PassengerService, PassengerLoader],
})
export class PassengerModule {}
