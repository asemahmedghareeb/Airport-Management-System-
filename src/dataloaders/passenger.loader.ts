import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Scope } from '@nestjs/common';
import { PassengerService } from 'src/passenger/passenger.service';
import { Passenger } from 'src/passenger/entities/passenger.entity';

@Injectable({ scope: Scope.REQUEST })
export class PassengerLoader {
  constructor(private readonly passengerService: PassengerService) {}

  readonly passengerById = new DataLoader<string, Passenger>(
    async (ids: string[]) => {
      const passengers = await this.passengerService.findByIds(
        Array.from(new Set(ids)),
      );

      const passengerMap = new Map(passengers.map((p) => [p.id, p]));
      return ids.map((id) => passengerMap.get(id) as Passenger);
    },
  );
}
