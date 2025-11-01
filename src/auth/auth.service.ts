import { FlightStaff } from './../flight/entities/flight_staff';
import { Role } from 'src/auth/role.enum';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Passenger } from '../passenger/entities/passenger.entity';
import { User } from './entities/user.entity';
import { AuthResponse } from './dto/loginResponse.dto';
import { LoginInput } from './dto/loginInput.dto';
import { RegisterPassengerInput } from './dto/passenger.dto';
import { Staff } from 'src/staff/entities/staff.entity';
import { Airport } from 'src/airport/entities/airport.entity';
import { RegisterStaffInput } from './dto/staff.dto';
import { Booking } from 'src/booking/entities/booking.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Passenger)
    private passengersRepository: Repository<Passenger>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(FlightStaff)
    private flightStaffRepository: Repository<FlightStaff>,
    @InjectRepository(Airport)
    private airportsRepository: Repository<Airport>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private jwtService: JwtService,
  ) {}

  async registerPassenger(
    input: RegisterPassengerInput,
  ): Promise<{ msg: string }> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: input.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = this.usersRepository.create({
      email: input.email,
      password: hashedPassword,
      role: 'Passenger',
    });
    const savedUser = await this.usersRepository.save(newUser);

    const newPassenger = this.passengersRepository.create({
      user: savedUser,
      name: input.name,
      passportNumber: input.passportNumber,
      nationality: input.nationality,
    });
    await this.passengersRepository.save(newPassenger);

    return {
      msg: 'Passenger registered successfully',
    };
  }

  async registerStaff(input: RegisterStaffInput): Promise<{ msg: string }> {
    const airport = await this.airportsRepository.findOne({
      where: { id: input.airportId },
    });
    if (!airport) {
      throw new BadRequestException(
        `Airport with ID ${input.airportId} not found.`,
      );
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = this.usersRepository.create({
      email: input.email,
      password: hashedPassword,
      role: input.userRole,
    });
    const savedUser = await this.usersRepository.save(newUser);

    const newStaff = this.staffRepository.create({
      user: savedUser,
      airport: airport,
      employeeId: input.employeeId,
      name: input.name,
      role: input.staffRole,
      userId: savedUser.id,
    });

    await this.staffRepository.save(newStaff);

    return { msg: 'Staff registered successfully' };
  }

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (user.role === Role.PASSENGER) {
      const passenger = await this.passengersRepository.findOne({
        where: { userId: user.id },
      });
      const bookings = await this.bookingRepository.find({
        where: { passengerId: passenger?.id },
      });
      const bookingIds = bookings.map((booking) => booking.id);
      const payload = {
        userId: user.id,
        role: user.role,
        passengerId: passenger?.id,
        bookings: bookingIds,
      };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    }

    if (user.role === Role.STAFF) {
      const staff = await this.staffRepository.findOne({
        where: { userId: user.id },
      });
      const flightStaff = await this.flightStaffRepository.find({
        where: { staffId: staff?.id },
      });

      const payload = {
        userId: user.id,
        role: user.role,
        staffId: staff?.id,
        airportId: staff?.airportId,
        flights: flightStaff?.map((flightStaff) => flightStaff.flightId),
      };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    }
    const payload = { userId: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }

  async findOne(id: string): Promise<User> {
    const user: User | null = await this.usersRepository.findOne({
      where: { id },
      relations: ['pushDevices'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return user;
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.usersRepository.find({
      where: { id: In(userIds) },
    });
  }
}
