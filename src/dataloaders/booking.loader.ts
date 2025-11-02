import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { mapArrayToIds } from 'src/common/utils';
import { Scope } from '@nestjs/common';
import { BookingService } from 'src/booking/booking.service';
import { Booking } from 'src/booking/entities/booking.entity';

@Injectable({ scope: Scope.REQUEST })
export class BookingLoader {
  constructor(private readonly bookingService: BookingService) {}

  readonly bookingsByFlightId = new DataLoader<string, Booking[]>(
    async (flightIds: string[]) => {
      const bookings = await this.bookingService.findByFlightIds(flightIds);

      const mappedBookings = mapArrayToIds(bookings, 'flightId');

      return flightIds.map((id) => mappedBookings[id] || []);
    },
  );

  readonly bookingsByPassengerId = new DataLoader<string, Booking[]>(
    async (passengerIds: string[]) => {
      const bookings =
        await this.bookingService.findByPassengerIds(passengerIds);

      const mappedBookings = mapArrayToIds(bookings, 'passengerId');

      return passengerIds.map((id) => mappedBookings[id] || []);
    },
  );
}
