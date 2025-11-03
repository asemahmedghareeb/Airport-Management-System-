import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Scope } from '@nestjs/common';
import { AirportService } from 'src/airport/airport.service';
import { Airport } from 'src/airport/entities/airport.entity';

@Injectable({ scope: Scope.REQUEST })
export class AirportLoader {
  constructor(private readonly airportService: AirportService) {}

  readonly airportById = new DataLoader<string, Airport>(
    async (ids: string[]) => {
      const airports = await this.airportService.findByIds(
        Array.from(new Set(ids)),
      );
      const airportMap = new Map(
        airports.map((airport) => [airport.id, airport]),
      );
      return ids.map((id) => airportMap.get(id) as Airport);
    },
  );
}
