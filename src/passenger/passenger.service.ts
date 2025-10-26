import { Injectable } from '@nestjs/common';


@Injectable()
export class PassengerService {
  create(createPassengerInput) {
    return 'This action adds a new passenger';
  }

  findAll() {
    return `This action returns all passenger`;
  }

  findOne(id: number) {
    return `This action returns a #${id} passenger`;
  }

  update(id: number, updatePassengerInput) {
    return `This action updates a #${id} passenger`;
  }

  remove(id: number) {
    return `This action removes a #${id} passenger`;
  }
}
