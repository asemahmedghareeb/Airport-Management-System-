import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  // --- READ: Retrieve Single Passenger ---
  async findOne(id: string): Promise<Passenger> {
    const passenger = await this.passengerRepository.findOne({
      where: { id },
      relations: ['user', 'bookings'], // Load user and bookings relations
    });
    if (!passenger) {
      throw new NotFoundException(`Passenger with ID "${id}" not found.`);
    }
    return passenger;
  }

  // --- READ: Retrieve Passengers with Pagination and Filtering ---
  async findAll(
    pagination: PaginationInput,
    filter: PassengerFilterInput,
  ): Promise<PaginatedPassenger> {
    const { page, limit } = pagination;
    const { name, passportNumber, nationality } = filter;
    const skip = (page - 1) * limit;

    const query = this.passengerRepository
      .createQueryBuilder('passenger')
      .leftJoinAndSelect('passenger.user', 'user');

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

  // --- UPDATE: Modify Passenger Details ---
  async update(input: UpdatePassengerInput): Promise<Passenger> {
    const { id, ...updateFields } = input;
    const passenger = await this.findOne(id);

    // Check if the new passport number (if provided) is already in use by another passenger
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

  // --- DELETE: Remove Passenger Member ---
  async delete(id: string): Promise<Passenger> {
    // 1. Find the Passenger record (loads the user relationship if configured)
    const passenger = await this.findOne(id);

    // Find the associated User record
    // We use findOne to ensure the User entity is fully tracked by TypeORM before removal.
    const user = await this.userRepository.findOne({
      where: { passenger: { id } },
    });

    // 2. *** CORRECT ORDER: Delete the User record FIRST ***
    if (user) {
      await this.userRepository.remove(user);
    }

    // 3. Remove the Passenger record
    // This will now succeed because the dependent User record (with the FK) is gone.
    await this.passengerRepository.remove(passenger);

    return passenger;
  }
}
