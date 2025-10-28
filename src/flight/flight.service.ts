import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { CreateFlightInput } from './dto/create-flight.input';
import { UpdateFlightInput } from './dto/update-flight.input';
import { FlightFilterInput } from './dto/flight-filter.input';
import { Airport } from 'src/airport/entities/airport.entity';
import { PaginationInput } from 'src/common/pagination.input';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepo: Repository<Flight>,
    @InjectRepository(Airport)
    private readonly airportRepo: Repository<Airport>,
    
  ) {}

  async create(input: CreateFlightInput): Promise<Flight> {
    const departureAirport = await this.airportRepo.findOneBy({
      id: input.departureAirportId,
    });
    if (!departureAirport) throw new NotFoundException('Departure airport not found');
    const destinationAirport = await this.airportRepo.findOneBy({
      id: input.destinationAirportId,
    });
    if (!destinationAirport) throw new NotFoundException('Destination airport not found');

    const flight = this.flightRepo.create({
      ...input,
      departureAirport,
      destinationAirport,
    });

    return this.flightRepo.save(flight);
  }

  async update(id: string, input: UpdateFlightInput): Promise<Flight> {
    const flight = await this.flightRepo.findOne({
      where: { id },
      relations: ['departureAirport', 'destinationAirport'],
    });
    if (!flight) throw new NotFoundException('Flight not found');

    Object.assign(flight, {
      flightNumber: input.flightNumber ?? flight.flightNumber,
      airline: input.airline ?? flight.airline,
      departureTime: input.departureTime ?? flight.departureTime,
      arrivalTime: input.arrivalTime ?? flight.arrivalTime,
      availableSeats: input.availableSeats ?? flight.availableSeats,
      status: input.status ?? flight.status,
    });

    if (input.departureAirportId) {
      const departureAirport = await this.airportRepo.findOneBy({
        id: input.departureAirportId,
      });
      if (!departureAirport) throw new NotFoundException('Departure airport not found');
      flight.departureAirport = departureAirport;
    }

    if (input.destinationAirportId) {
      const destinationAirport = await this.airportRepo.findOneBy({
        id: input.destinationAirportId,
      });
      if (!destinationAirport) throw new NotFoundException('Destination airport not found');
      flight.destinationAirport = destinationAirport;
    }

    return this.flightRepo.save(flight);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.flightRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Flight not found');
    return true;
  }

  async findAll(
    pagination: PaginationInput,
    filter?: FlightFilterInput,
  ): Promise<{
    items: Flight[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
  }> {
    const { page = 1, limit = 10 } = pagination;
    const query = this.flightRepo
      .createQueryBuilder('flight')
      .leftJoinAndSelect('flight.departureAirport', 'departureAirport')
      .leftJoinAndSelect('flight.destinationAirport', 'destinationAirport');

    // Apply filters
    if (filter?.airline) {
      query.andWhere('flight.airline ILIKE :airline', {
        airline: `%${filter.airline}%`,
      });
    }

    if (filter?.destination) {
      query.andWhere(
        '(destinationAirport.name ILIKE :dest OR destinationAirport.city ILIKE :dest)',
        { dest: `%${filter.destination}%` },
      );
    }

    if (filter?.departureAfter) {
      query.andWhere('flight.departureTime >= :after', {
        after: filter.departureAfter,
      });
    }

    if (filter?.departureBefore) {
      query.andWhere('flight.departureTime <= :before', {
        before: filter.departureBefore,
      });
    }

    // Pagination
    const totalCount = await query.getCount();
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;

    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('flight.departureTime', 'ASC')
      .getMany();

    return { items, totalCount, totalPages, currentPage: page, hasNextPage };
  }

  async findOne(id: string): Promise<Flight> {
    const flight = await this.flightRepo.findOne({
      where: { id },

    });
    if (!flight) throw new NotFoundException('Flight not found');
    return flight;
  }

  // Helpers for AirportResolver
  findDepartingFlights(airportId: string) {
    return this.flightRepo.find({
      where: { departureAirport: { id: airportId } },
    });
  }

  findArrivingFlights(airportId: string) {
    return this.flightRepo.find({
      where: { destinationAirport: { id: airportId } },
    });
  }
}
