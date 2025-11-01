import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Booking } from './entities/booking.entity';
import { BookingService } from './booking.service';
import { mapArrayToIds } from 'src/common/utils';
@Injectable()
export class BookingLoader {
  constructor(private readonly bookingService: BookingService) {}

  createLoaders() {
    const bookingsByFlightId = new DataLoader<string, Booking[]>(
      async (flightIds: string[]) => {
        const bookings = await this.bookingService.findByFlightIds(flightIds);

        const mappedBookings = mapArrayToIds(bookings, 'flightId');

        return flightIds.map((id) => mappedBookings[id] || []);
      },
    );

    const bookingsByPassengerId = new DataLoader<string, Booking[]>(
      async (passengerIds: string[]) => {
        const bookings =
          await this.bookingService.findByPassengerIds(passengerIds);

        const mappedBookings = mapArrayToIds(bookings, 'passengerId');

        return passengerIds.map((id) => mappedBookings[id] || []);
      },
    );

    return {
      bookingsByFlightId,
      bookingsByPassengerId,
    };
  }
}
