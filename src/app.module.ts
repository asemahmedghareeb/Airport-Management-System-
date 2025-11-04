import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AirportModule } from './airport/airport.module';
import { FlightModule } from './flight/flight.module';
import { StaffModule } from './staff/staff.module';
import { PassengerModule } from './passenger/passenger.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';
import { Airport } from './airport/entities/airport.entity';
import { Flight } from './flight/entities/flight.entity';
import { Staff } from './staff/entities/staff.entity';
import { Passenger } from './passenger/entities/passenger.entity';
import { Booking } from './booking/entities/booking.entity';
import { FlightStaff } from './flight/entities/flight_staff';
import { User } from './auth/entities/user.entity';
import { PushNotificationsModule } from './push-notifications/push-notifications.module';
import { PushDevice } from './push-notifications/entities/PushDevice.entity';
import { EmailsModule } from './emails/emails.module';
import { BullModule } from '@nestjs/bull';
import { DataLoadersModule } from './dataLoaders/dataLoaders.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'notification',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.POSTGRES_PORT!, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: true,
      autoLoadEntities: true,
      // logging: true,
      entities: [
        User,
        Airport,
        Flight,
        Staff,
        Passenger,
        Booking,
        FlightStaff,
        PushDevice,
      ],
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res }) => ({ req, res }),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      subscriptions: {
        'graphql-ws': true,
      },
    }),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, // change in production
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    AirportModule,
    FlightModule,
    StaffModule,
    PassengerModule,
    BookingModule,
    PushNotificationsModule,
    EmailsModule,
    DataLoadersModule,
    PubSubModule,
  ],
})
export class AppModule {}
