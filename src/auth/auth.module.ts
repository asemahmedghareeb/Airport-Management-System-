import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { CaslAbilityFactory } from './casl-ability.factory';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Passenger } from '../passenger/entities/passenger.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Airport } from 'src/airport/entities/airport.entity';
import { UserLoader } from './user.loader';

@Module({
  imports: [TypeOrmModule.forFeature([User, Passenger, Staff, Airport])],
  providers: [AuthResolver, AuthService, CaslAbilityFactory, UserLoader],
  exports: [AuthService, UserLoader],
})
export class AuthModule {}
