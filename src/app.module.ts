import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AirportModule } from './airport/airport.module';
import { FlightModule } from './flight/flight.module';
import { StaffModule } from './staff/staff.module';
import { PassengerModule } from './passenger/passenger.module';
import { BookingModule } from './booking/booking.module';
import { User } from './user/entities/user.entity';
import { Airport } from './airport/entities/airport.entity';
import { Flight } from './flight/entities/flight.entity';
import { Staff } from './staff/entities/staff.entity';
import { Passenger } from './passenger/entities/passenger.entity';
import { Booking } from './booking/entities/booking.entity';
import { FlightStaff } from './flight/entities/flight_staff';
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: '/tmp/schema.gql',
      context: ({ req }) => ({ req }),
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: parseInt(process.env.POSTGRES_PORT!, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: true,
      logging: ['error', 'warn'],
      entities: [User, Airport, Flight, Staff, Passenger, Booking, FlightStaff],
    }), 

    AuthModule,
    UserModule,
    AirportModule,
    FlightModule,
    StaffModule,
    PassengerModule,
    BookingModule,
  ],
})
export class AppModule {}
