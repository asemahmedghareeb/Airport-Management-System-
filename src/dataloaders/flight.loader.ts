import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Scope } from '@nestjs/common';
import { FlightService } from 'src/flight/flight.service';
import { Flight } from 'src/flight/entities/flight.entity';

@Injectable({ scope: Scope.REQUEST })
export class FlightLoader {
  constructor(private readonly flightService: FlightService) {}

  readonly flightsByDepartureAirportId: DataLoader<string, Flight[]> =
    new DataLoader<string, Flight[]>(async (airportIds: string[]) => {
      const flights =
        await this.flightService.findByDepartureAirportIds(airportIds);
      return airportIds.map((airportId) =>
        flights.filter((flight) => flight.departureAirportId === airportId),
      );
    });

  readonly flightsByArrivalAirportId: DataLoader<string, Flight[]> =
    new DataLoader<string, Flight[]>(async (airportIds: string[]) => {
      const flights =
        await this.flightService.findByArrivalAirportIds(airportIds);
      return airportIds.map((airportId) =>
        flights.filter((flight) => flight.destinationAirportId === airportId),
      );
    });

  readonly flightById: DataLoader<string, Flight> = new DataLoader<
    string,
    Flight
  >(async (ids: string[]) => {
    const flights = await this.flightService.findByIds(
      Array.from(new Set(ids)),
    );

    const flightMap = new Map(flights.map((flight) => [flight.id, flight]));

    return ids.map((id) => flightMap.get(id) as Flight);
  });
}
