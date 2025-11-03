import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Booking } from './entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Passenger } from 'src/passenger/entities/passenger.entity';
import { Flight } from 'src/flight/entities/flight.entity';
import { BookFlightInput, UpdateBookingInput } from './dto/BookFlightInput.dto';
import { PaginationInput } from 'src/common/pagination.input';
import { PaginatedBooking } from './dto/paginatedBooking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    private dataSource: DataSource,
  ) {}

  async bookFlight(input: BookFlightInput): Promise<Booking> {
    const { passengerId, flightId, seatNumber } = input;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const [passenger, flight] = await Promise.all([
        manager.findOne(Passenger, { where: { id: passengerId } }),
        manager.findOne(Flight, { where: { id: flightId } }),
      ]);

      if (!passenger) {
        throw new NotFoundException(
          `Passenger with ID "${passengerId}" not found.`,
        );
      }
      if (!flight) {
        throw new NotFoundException(`Flight with ID "${flightId}" not found.`);
      }

      const passengerAlreadyBooked = await manager.findOne(Booking, {
        where: { passenger: { id: passengerId }, flight: { id: flightId } },
      });
      if (passengerAlreadyBooked) {
        throw new BadRequestException(
          `Passenger has already booked a seat on flight ${flightId}.`,
        );
      }

      const duplicateSeat = await manager.findOne(Booking, {
        where: { flight: { id: flightId }, seatNumber },
      });
      if (duplicateSeat) {
        throw new BadRequestException(
          `Seat ${seatNumber} is already booked on flight ${flightId}.`,
        );
      }

      const bookedCount = await manager.count(Booking, {
        where: { flight: { id: flightId } },
      });
      if (bookedCount >= flight.availableSeats) {
        throw new BadRequestException('This flight is fully booked.');
      }

      const newBooking = manager.create(Booking, {
        passenger,
        flight,
        seatNumber,
        passengerId,
        flightId,
      });
      await manager.save(newBooking);

      if (flight.availableSeats > 0) {
        flight.availableSeats -= 1;
        await manager.save(flight);
      }

      await queryRunner.commitTransaction();
      return newBooking;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      if (err.code === '23505') {
        throw new BadRequestException(
          'A booking conflict occurred. The seat or passenger-flight combination is already taken.',
        );
      }

      throw new InternalServerErrorException(
        'An internal error occurred during booking.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found.`);
    }
    return booking;
  }

  async findAll(pagination: PaginationInput): Promise<PaginatedBooking> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.bookingRepository.findAndCount({
      skip,
      take: limit,
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async updateBooking(input: UpdateBookingInput): Promise<Booking> {
    const booking = await this.findOne(input.id);

    if (input.seatNumber && input.seatNumber !== booking.seatNumber) {
      const duplicateSeat = await this.bookingRepository.findOne({
        where: {
          flight: booking.flight,
          seatNumber: input.seatNumber,
        },
      });
      if (duplicateSeat) {
        throw new BadRequestException(
          `Seat ${input.seatNumber} is already taken on this flight.`,
        );
      }
      booking.seatNumber = input.seatNumber;
    }

    return this.bookingRepository.save(booking);
  }

  async deleteBooking(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    const deletedBookingData = { ...booking };
    const flight = deletedBookingData.flight;
    flight.availableSeats += 1;
    await this.flightRepository.save(flight);
    await this.bookingRepository.remove(booking);

    return deletedBookingData as Booking;
  }

  async findBookingsByPassenger(passengerId: string): Promise<Booking[]> {
    const bookings = await this.bookingRepository.find({
      where: { passenger: { id: passengerId } },
      order: { bookingDate: 'DESC' },
    });
    return bookings;
  }

  findByFlightIds(flightIds: string[]): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { flight: { id: In(flightIds) } },
    });
  }

  findByPassengerIds(passengerIds: string[]): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { passenger: { id: In(passengerIds) } },
    });
  }
}
