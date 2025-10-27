import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportModule } from './airport/airport.module';
import { FlightModule } from './flight/flight.module';
import { StaffModule } from './staff/staff.module';
import { PassengerModule } from './passenger/passenger.module';
import { BookingModule } from './booking/booking.module';
import { Airport } from './airport/entities/airport.entity';
import { Flight } from './flight/entities/flight.entity';
import { Staff } from './staff/entities/staff.entity';
import { Passenger } from './passenger/entities/passenger.entity';
import { Booking } from './booking/entities/booking.entity';
import { FlightStaff } from './flight/entities/flight_staff';
import { User } from './auth/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: parseInt(process.env.POSTGRES_PORT!, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: true,
      autoLoadEntities: true, // helps auto-register entities
      // logging: ['error', 'warn'],
      entities: [User, Airport, Flight, Staff, Passenger, Booking, FlightStaff],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),

      context: ({ req }) => ({ req }),
    }),

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, //change it in production
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    AirportModule,
    FlightModule,
    StaffModule,
    PassengerModule,
    BookingModule,
  ],
})
export class AppModule {}
