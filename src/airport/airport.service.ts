import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Airport } from './entities/airport.entity';
import { CreateAirportInput } from './dto/create-airport.input';
import { UpdateAirportInput } from './dto/update-airport.input';
import { PaginationInput } from '../common/pagination.input';
import { PaginatedAirportResponse } from './dto/paginated-airport.response';

@Injectable()
export class AirportService {
  constructor(
    @InjectRepository(Airport)
    private readonly airportRepository: Repository<Airport>,
  ) {}

  async create(input: CreateAirportInput): Promise<Airport> {
    const airportExists = await this.airportRepository.findOne({
      where: { code: input.code },
    });

    if (airportExists) throw new ConflictException('Airport already exists');
    const airport = this.airportRepository.create(input);

    return this.airportRepository.save(airport);
  }

  async findAll(
    pagination: PaginationInput,
  ): Promise<PaginatedAirportResponse> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, totalCount] = await this.airportRepository.findAndCount({
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      items,
      totalCount,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: string): Promise<Airport> {
    const airport = await this.airportRepository.findOne({ where: { id } });
    if (!airport) throw new NotFoundException(`Airport ${id} not found`);
    return airport;
  }

  async update(id: string, input: UpdateAirportInput): Promise<Airport> {
    const airport = await this.findOne(id);
    if (!airport) throw new NotFoundException(`Airport ${id} not found`);
    Object.assign(airport, input);
    return this.airportRepository.save(airport);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.airportRepository.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Airport ${id} not found`);
    return true;
  }

  async findByIds(ids: string[]): Promise<Airport[]> {
    return this.airportRepository.find({ where: { id: In(ids) } });
  }
}
