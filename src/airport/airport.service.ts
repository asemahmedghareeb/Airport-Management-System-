import { Injectable } from '@nestjs/common';


@Injectable()
export class AirportService {
  create(createAirportInput) {
    return 'This action adds a new airport';
  }

  findAll() {
    return `This action returns all airport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} airport`;
  }

  update(id: number, updateAirportInput) {
    return `This action updates a #${id} airport`;
  }

  remove(id: number) {
    return `This action removes a #${id} airport`;
  }
}
