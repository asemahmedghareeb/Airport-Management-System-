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
    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    private dataSource: DataSource,
  ) {}

  async bookFlight(input: BookFlightInput): Promise<Booking> {
    const { passengerId, flightId, seatNumber } = input;

    // 1. Initialize QueryRunner and start transaction
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

      // 3. Check for Duplicate Passenger (Passenger already booked on this flight)
      const passengerAlreadyBooked = await manager.findOne(Booking, {
        where: { passenger: { id: passengerId }, flight: { id: flightId } },
      });
      if (passengerAlreadyBooked) {
        throw new BadRequestException(
          `Passenger has already booked a seat on flight ${flightId}.`,
        );
      }

      // 4. Check for Duplicate Seat assignment
      const duplicateSeat = await manager.findOne(Booking, {
        where: { flight: { id: flightId }, seatNumber },
      });
      if (duplicateSeat) {
        throw new BadRequestException(
          `Seat ${seatNumber} is already booked on flight ${flightId}.`,
        );
      }

      // 5. Check if the flight is fully booked
      const bookedCount = await manager.count(Booking, {
        where: { flight: { id: flightId } },
      });
      if (bookedCount >= flight.availableSeats) {
        throw new BadRequestException('This flight is fully booked.');
      }

      // 6. Create and save the booking
      const newBooking = manager.create(Booking, {
        passenger,
        flight,
        seatNumber,
        passengerId,
        flightId,
      });
      await manager.save(newBooking);

      // 7. Decrement available seats count on the Flight entity
      if (flight.availableSeats > 0) {
        flight.availableSeats -= 1;
        await manager.save(flight);
      }

      // 8. Commit Transaction (All changes are saved to the database)
      await queryRunner.commitTransaction();
      return newBooking;
    } catch (err) {
      // 9. Rollback Transaction on error (No changes are saved)
      await queryRunner.rollbackTransaction();

      // Re-throw the error for the resolver to handle
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      // Handle unexpected DB errors (e.g., race conditions caught by unique constraint)
      if (err.code === '23505') {
        // PostgreSQL unique violation code
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

  // --- CRUD: Find One ---
  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found.`);
    }
    return booking;
  }

  // --- CRUD: Find All (with Pagination) ---
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
  // --- CRUD: Update Booking (Change Seat Number) ---
  async updateBooking(input: UpdateBookingInput): Promise<Booking> {
    const booking = await this.findOne(input.id);

    if (input.seatNumber && input.seatNumber !== booking.seatNumber) {
      // Must re-validate new seat for duplication on the same flight
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

  // --- CRUD: Delete Booking ---
  // src/booking/booking.service.ts

  async deleteBooking(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    const deletedBookingData = { ...booking };
    const flight = deletedBookingData.flight;
    flight.availableSeats += 1;
    await this.flightRepository.save(flight);
    await this.bookingRepository.remove(booking);

    return deletedBookingData as Booking;
  }

  // --- Query: Allow passengers to check flight details (Requirement 2) ---
  async findBookingsByPassenger(passengerId: string): Promise<Booking[]> {
    const bookings = await this.bookingRepository.find({
      where: { passenger: { id: passengerId } },
      order: { bookingDate: 'DESC' },
    });
    return bookings;
  }

  async findByFlight(id: string): Promise<Booking[]> {
    return this.bookingRepository.find({ where: { flight: { id } } });
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
