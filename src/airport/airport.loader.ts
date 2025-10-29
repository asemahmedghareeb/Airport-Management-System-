// src/airport/airport.loader.ts
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Airport } from './entities/airport.entity';
import { AirportService } from './airport.service';

@Injectable()
export class AirportLoader {
  constructor(private readonly airportService: AirportService) {}

  createLoaders() {
    const airportByIdLoader = new DataLoader<string, Airport>(
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



  

    return {
      airportById: airportByIdLoader,
    };
  }
}
