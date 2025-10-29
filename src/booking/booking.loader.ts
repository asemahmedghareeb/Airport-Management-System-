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
        // Assume findByFlightIds is optimized to fetch all bookings in one query
        const bookings = await this.bookingService.findByFlightIds(flightIds);

        // Utility to map an array of results back to the keys (Flight IDs)
        // [ { id: 'b1', flightId: 'fA' }, { id: 'b2', flightId: 'fB' } ] 
        // -> { 'fA': [ {..} ], 'fB': [ {..} ] }
        const mappedBookings = mapArrayToIds(bookings, 'flightId');

        // MUST return results in the EXACT order of the input keys
        return flightIds.map((id) => mappedBookings[id] || []);
      },
    );
    


      const bookingsByPassengerId = new DataLoader<string, Booking[]>(
      async (passengerIds: string[]) => {
        // Assume findByPassengerIds is optimized to fetch all bookings in one query
        const bookings = await this.bookingService.findByPassengerIds(passengerIds);

        // Utility to map an array of results back to the keys (Passenger IDs)
        // NOTE: Booking entity must have the 'passengerId' column exposed (which it does).
        const mappedBookings = mapArrayToIds(bookings, 'passengerId');

        // MUST return results in the EXACT order of the input keys
        return passengerIds.map((id) => mappedBookings[id] || []);
      },
    );
  

      

    return {
      // The key 'bookingsByFlightId' must match the @Loader('...') argument
      bookingsByFlightId,
      bookingsByPassengerId,
    };
  }
}