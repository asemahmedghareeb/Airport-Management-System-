// src/flight/flight.loader.ts
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Flight } from './entities/flight.entity';
import { FlightService } from './flight.service';

@Injectable()
export class FlightLoader {
  constructor(private readonly flightService: FlightService) {}

  createLoaders() {
    const flightsByDepartureAirportId = new DataLoader<string, Flight[]>(
      async (airportIds: string[]) => {
        const flights =
          await this.flightService.findByDepartureAirportIds(airportIds);
        return airportIds.map((airportId) =>
          flights.filter((flight) => flight.departureAirportId === airportId),
        );
      },
    );

    const flightsByArrivalAirportId = new DataLoader<string, Flight[]>(
      async (airportIds: string[]) => {
        const flights =
          await this.flightService.findByArrivalAirportIds(airportIds);
        return airportIds.map((airportId) =>
          flights.filter((flight) => flight.destinationAirportId === airportId),
        );
      },
    );

    const flightById = new DataLoader<string, Flight>(async (ids: string[]) => {
      const flights = await this.flightService.findByIds(
        Array.from(new Set(ids)),
      );

      const flightMap = new Map(flights.map((flight) => [flight.id, flight]));

      return ids.map((id) => flightMap.get(id) as Flight);
    });

    return {
      flightsByDepartureAirportId,
      flightsByArrivalAirportId,
      flightById,
    };
  }
}
