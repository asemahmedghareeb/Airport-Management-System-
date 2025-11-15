import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Flight } from './entities/flight.entity';
import { CreateFlightInput } from './dto/create-flight.input';
import { UpdateFlightInput } from './dto/update-flight.input';
import { FlightFilterInput } from './dto/flight-filter.input';
import { Airport } from 'src/airport/entities/airport.entity';
import { PaginationInput } from 'src/common/pagination.input';
import { Booking } from 'src/booking/entities/booking.entity';
import { User } from 'src/auth/entities/user.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepo: Repository<Flight>,
    @InjectRepository(Airport)
    private readonly airportRepo: Repository<Airport>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
  ) {}

  async create(input: CreateFlightInput): Promise<Flight> {
    const departureAirport = await this.airportRepo.findOneBy({
      id: input.departureAirportId,
    });
    if (!departureAirport)
      throw new NotFoundException('Departure airport not found');
    const destinationAirport = await this.airportRepo.findOneBy({
      id: input.destinationAirportId,
    });
    if (!destinationAirport)
      throw new NotFoundException('Destination airport not found');

    if(departureAirport.id === destinationAirport.id){
      throw new BadRequestException('Departure and destination airports cannot be the same');
    }
    const flight = this.flightRepo.create({
      ...input,
      departureAirport,
      destinationAirport,
    });

    return this.flightRepo.save(flight);
  }

  async update(input: UpdateFlightInput,flight:Flight): Promise<Flight> {
    // const flight = await this.flightRepo.findOne({
    //   where: { id: input.id },
    //   relations: ['departureAirport', 'destinationAirport'],
    // });
    if (!flight) throw new NotFoundException('Flight not found');
    let isStatusChanged = false;
    if (input.status !== flight.status) {
      isStatusChanged = true;
    }
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
      if (!departureAirport)
        throw new NotFoundException('Departure airport not found');
      flight.departureAirport = departureAirport;
    }

    if (input.destinationAirportId) {
      const destinationAirport = await this.airportRepo.findOneBy({
        id: input.destinationAirportId,
      });
      if (!destinationAirport)
        throw new NotFoundException('Destination airport not found');
      flight.destinationAirport = destinationAirport;
    }

    const updatedFlight = await this.flightRepo.save(flight);
    if (isStatusChanged) {
      console.log('Flight status changed:');
      const Bookings = await this.bookingRepo.find({
        where: { flightId: input.id },
        relations: ['passenger'],
      });
      const userIds = Bookings.map((booking) => booking.passenger.userId);

      const users = await this.userRepo.find({
        where: { id: In(userIds) },
        relations: ['pushDevices'],
      });

      const PlayerIds = users
        .map((user) =>
          user.pushDevices.map((pushDevice) => pushDevice.playerId),
        )
        .flat();
      console.log(PlayerIds);
      for (const user of users) {
        if (user.email) {
          await this.emailQueue.add(
            'send-status-email',
            {
              toEmail: user.email,
              flightNumber: updatedFlight.flightNumber,
              newStatus: updatedFlight.status,
            },
            {
              jobId: `flight-${updatedFlight.id}-email-${user.id}-${Date.now()}`,
            },
          );
        }
      }

      await this.notificationQueue.add(
        'flight-status-update',
        {
          flightNumber: updatedFlight.flightNumber,
          newStatus: updatedFlight.status,
          playerIds: PlayerIds,
        },
        {
          jobId: `flight-${updatedFlight.id}-status-update-${Date.now()}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      );

      this.pubSub.publish('flightStatusUpdated', {
        flightStatusUpdated: updatedFlight,
      });
    }

    return updatedFlight;
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

  async findByDepartureAirportIds(airportIds: string[]): Promise<Flight[]> {
    return this.flightRepo.find({
      where: {
        departureAirportId: In(airportIds),
      },
    });
  }

  async findByArrivalAirportIds(airportIds: string[]): Promise<Flight[]> {
    return this.flightRepo.find({
      where: {
        destinationAirportId: In(airportIds),
      },
    });
  }

  async findByIds(ids: string[]): Promise<Flight[]> {
    return this.flightRepo.find({
      where: {
        id: In(ids),
      },
    });
  }
}
