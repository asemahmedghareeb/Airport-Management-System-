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
import { EmailsService } from 'src/emails/emails.service';
import { BullModule } from '@nestjs/bull';
import { FlightNotificationProcessor } from './flight-notification.processor';
import { FlightEmailProcessor } from './flight-email.processor';
@Module({
  imports: [
    TypeOrmModule.forFeature([Flight, Airport, Booking, User]),
    forwardRef(() => StaffModule),
    forwardRef(() => AirportModule),
    forwardRef(() => BookingModule),
    BullModule.registerQueue({
      name: 'notification',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: true,
      },
      limiter: {
        max: 3,
        duration: 1000,
      },
    }),
    BullModule.registerQueue({
      name: 'email',  
      defaultJobOptions: {
        attempts: 3, 
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
  ],
  providers: [
    FlightService,
    FlightResolver,
    FlightLoader,
    OneSignalService,
    EmailsService,
    FlightNotificationProcessor,
    FlightEmailProcessor,
  ],
  exports: [FlightService, FlightLoader, FlightLoader],
})
export class FlightModule {}
