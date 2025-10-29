// src/passenger/passenger.loader.ts
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Passenger } from './entities/passenger.entity';
import { PassengerService } from './passenger.service';

@Injectable()
export class PassengerLoader {
  constructor(private readonly passengerService: PassengerService) {}

  createLoaders() {
    const passengerByIdLoader = new DataLoader<string, Passenger>(
      async (ids: string[]) => {
        const passengers = await this.passengerService.findByIds(
          Array.from(new Set(ids)),
        );

        const passengerMap = new Map(passengers.map((p) => [p.id, p]));

        return ids.map((id) => passengerMap.get(id) as Passenger);
      },
    );

    return {
      passengerById: passengerByIdLoader,
    };
  }
}
