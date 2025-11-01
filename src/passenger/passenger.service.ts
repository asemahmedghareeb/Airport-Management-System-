import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Passenger } from './entities/passenger.entity';
import { PaginationInput } from 'src/common/pagination.input';
import { PassengerFilterInput } from './dto/passengerFilterInput.dto';
import { PaginatedPassenger } from './dto/paginatedPassenger.dto';
import { UpdatePassengerInput } from './dto/passengerUpdateInput.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class PassengerService {
  constructor(
    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<Passenger> {
    const passenger = await this.passengerRepository.findOne({
      where: { id },
    });
    if (!passenger) {
      throw new NotFoundException(`Passenger with ID "${id}" not found.`);
    }
    return passenger;
  } 

  async findAll(
    pagination: PaginationInput,
    filter: PassengerFilterInput,
  ): Promise<PaginatedPassenger> {
    const { page, limit } = pagination;
    const { name, passportNumber, nationality } = filter;
    const skip = (page - 1) * limit;

    const query = this.passengerRepository
      .createQueryBuilder('passenger')
      .orderBy('passenger.name', 'ASC');

    if (name) {
      query.andWhere('passenger.name ILIKE :name', { name: `%${name}%` });
    }
    if (passportNumber) {
      query.andWhere('passenger.passportNumber = :passportNumber', {
        passportNumber,
      });
    }
    if (nationality) {
      query.andWhere('passenger.nationality ILIKE :nationality', {
        nationality: `%${nationality}%`,
      });
    }

    const [items, totalItems] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  } 

  async update(input: UpdatePassengerInput): Promise<Passenger> {
    const { id, ...updateFields } = input;
    const passenger = await this.findOne(id); 

    if (
      updateFields.passportNumber &&
      updateFields.passportNumber !== passenger.passportNumber
    ) {
      const existing = await this.passengerRepository.findOne({
        where: { passportNumber: updateFields.passportNumber },
      });
      if (existing) {
        throw new BadRequestException('Passport number is already in use.');
      }
    }

    Object.assign(passenger, updateFields);
    return this.passengerRepository.save(passenger);
  } 

  async delete(id: string): Promise<Passenger> {
    const passenger = await this.findOne(id);

    const user = await this.userRepository.findOne({
      where: { id: passenger.userId },
    });

    if (user) {
      await this.userRepository.remove(user);
    }

    await this.passengerRepository.remove(passenger);

    return passenger;
  }


  async findByIds(ids: string[]): Promise<Passenger[]> {
    return await this.passengerRepository.find({ where: { id: In(ids) } });
  }
}
