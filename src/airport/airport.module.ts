import {  Module } from '@nestjs/common';
import { AirportService } from './airport.service';
import { AirportResolver } from './airport.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airport } from './entities/airport.entity';
import { AirportLoader } from './airport.loader';

@Module({
  imports: [
    TypeOrmModule.forFeature([Airport]),
  ],
  providers: [AirportResolver, AirportService, AirportLoader],
  exports: [AirportService, AirportLoader],
})
export class AirportModule {}
