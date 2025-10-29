import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

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

import { DataLoaderService } from './dataloader/dataloader.service';
import { AirportLoader } from './airport/airport.loader';
import { DataLoaderInterceptor } from './dataloader/dataloader.interceptor';

import { ThrottlerModule } from '@nestjs/throttler';
import { GqlThrottlerGuard } from './common/throttler.Guard';

@Module({
  imports: [
    // ✅ Correct Throttler v6 configuration
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'global',
    //     ttl: 60,
    //     limit: 10,
    //   },
    // ]),

    // ✅ Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ✅ TypeORM configuration
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
      entities: [User, Airport, Flight, Staff, Passenger, Booking, FlightStaff],
    }),

    // ✅ GraphQL setup
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res }) => ({ req, res }),
    }),

    // ✅ JWT setup
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, // change in production
      }),
      inject: [ConfigService],
    }),

    // ✅ Application modules
    AuthModule,
    AirportModule,
    FlightModule,
    StaffModule,
    PassengerModule,
    BookingModule,
  ],

  providers: [
    DataLoaderService,
    AirportLoader,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: GqlThrottlerGuard,
    // },
  ],
})
export class AppModule {}
