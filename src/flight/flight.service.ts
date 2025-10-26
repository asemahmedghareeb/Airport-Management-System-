import { Injectable } from '@nestjs/common';

@Injectable()
export class FlightService {
  create(createFlightInput) {
    return 'This action adds a new flight';
  }

  findAll() {
    return `This action returns all flight`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flight`;
  }

  update(id: number, updateFlightInput) {
    return `This action updates a #${id} flight`;
  }

  remove(id: number) {
    return `This action removes a #${id} flight`;
  }
}
