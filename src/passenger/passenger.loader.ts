// src/passenger/passenger.loader.ts
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Passenger } from './entities/passenger.entity';
import { PassengerService } from './passenger.service';

@Injectable()
export class PassengerLoader {
  constructor(private readonly passengerService: PassengerService) {}

  createLoaders() {
    // Loader: Fetch a single Passenger entity by ID
    const passengerByIdLoader = new DataLoader<string, Passenger>(
      async (ids: string[]) => {
        // Assume this service method is optimized to fetch all unique passengers in one query
        const passengers = await this.passengerService.findByIds(
          Array.from(new Set(ids)),
        );

        const passengerMap = new Map(
          passengers.map((p) => [p.id, p]),
        );

        // MUST return results in the EXACT order of the input keys
        return ids.map((id) => passengerMap.get(id) as Passenger);
      },
    );

    return {
      passengerById: passengerByIdLoader,
    };
  }
}