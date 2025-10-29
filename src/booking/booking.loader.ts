import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Booking } from './entities/booking.entity';
import { BookingService } from './booking.service';
import { mapArrayToIds } from 'src/common/utils';
// Assuming a utility exists for mapping one-to-many

@Injectable()
export class BookingLoader {
  constructor(private readonly bookingService: BookingService) {}

  createLoaders() {
    // One-to-many: Accepts Flight IDs, returns an array of Booking[]
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

        // MUST return results in the EXACT order of the input keys
        return passengerIds.map((id) => mappedBookings[id] || []);
      },
    );

    return {
      bookingsByFlightId,
      bookingsByPassengerId,
    };
  }
}
