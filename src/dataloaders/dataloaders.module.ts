import { Global, Module, Scope, } from '@nestjs/common';
import { FlightLoader } from './flight.loader';
import { AirportLoader } from './airport.loader';
import { BookingLoader } from './booking.loader';
import { PassengerLoader } from './passenger.loader';
import { StaffLoader } from './staff.loader';
import { UserLoader } from './user.loader';
import { AirportModule } from 'src/airport/airport.module';
import { BookingModule } from 'src/booking/booking.module';
import { PassengerModule } from 'src/passenger/passenger.module';
import { StaffModule } from 'src/staff/staff.module';
import { AuthModule } from 'src/auth/auth.module';
import { FlightModule } from 'src/flight/flight.module';

@Global()
@Module({
  imports: [
    FlightModule,
    AirportModule,
    BookingModule,
    PassengerModule,
    StaffModule,
    AuthModule,
  ],
  providers: [
    { provide: FlightLoader, useClass: FlightLoader, scope: Scope.REQUEST },
    { provide: AirportLoader, useClass: AirportLoader, scope: Scope.REQUEST },
    { provide: BookingLoader, useClass: BookingLoader, scope: Scope.REQUEST },
    {
      provide: PassengerLoader,
      useClass: PassengerLoader,
      scope: Scope.REQUEST,
    },
    { provide: StaffLoader, useClass: StaffLoader, scope: Scope.REQUEST },
    { provide: UserLoader, useClass: UserLoader, scope: Scope.REQUEST },
  ],
  exports: [
    FlightLoader,
    AirportLoader,
    BookingLoader,
    PassengerLoader,
    StaffLoader,
    UserLoader,
  ],
})
export class DataloadersModule {}
