import { Module } from '@nestjs/common';
import { FlightService } from './flight.service';
import { FlightResolver } from './flight.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Airport } from 'src/airport/entities/airport.entity';
import { OneSignalService } from 'src/push-notifications/onesignal.service';
import { Booking } from 'src/booking/entities/booking.entity';
import { User } from 'src/auth/entities/user.entity';
import { EmailsService } from 'src/emails/emails.service';
import { BullModule } from '@nestjs/bull';
import { FlightNotificationProcessor } from './flight-notification.processor';
import { FlightEmailProcessor } from './flight-email.processor';
import { FlightStaff } from './entities/flight_staff';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { FlightSubscriptionResolver } from './flight.subscription.resolver';

@Module({
  imports: [
    PubSubModule,
    TypeOrmModule.forFeature([Flight, Airport, Booking, User, FlightStaff]),
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
    PubSubModule,
  ],
  providers: [
    FlightService,
    FlightResolver,
    OneSignalService,
    EmailsService,
    FlightNotificationProcessor,
    FlightEmailProcessor,
    FlightSubscriptionResolver,
  ],
  exports: [FlightService],
})
export class FlightModule {}
