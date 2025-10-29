import { Injectable } from '@nestjs/common';
import {
  IDataLoaderService,
  IDataLoaders,
} from './interfaces/dataloader.interface';
import { AirportLoader } from '../airport/airport.loader';
import { FlightLoader } from '../flight/flight.loader';
import { StaffLoader } from '../staff/staff.loader';
import { PassengerLoader } from '../passenger/passenger.loader';
import { BookingLoader } from 'src/booking/booking.loader';
import { UserLoader } from 'src/auth/user.loader';

@Injectable()
export class DataLoaderService implements IDataLoaderService {
  constructor(
    private readonly airportLoader: AirportLoader,
    private readonly flightLoader: FlightLoader,
    private readonly staffLoader: StaffLoader,
    private readonly passengerLoader: PassengerLoader,
    private readonly bookingLoader: BookingLoader,
    private readonly userLoader: UserLoader,
  ) {}

  createLoaders(): IDataLoaders {
    return {
      ...this.airportLoader.createLoaders(),
      ...this.flightLoader.createLoaders(),
      ...this.staffLoader.createLoaders(),
      ...this.passengerLoader.createLoaders(),
      ...this.bookingLoader.createLoaders(),
      ...this.userLoader.createLoaders(),
    };
  }
}
