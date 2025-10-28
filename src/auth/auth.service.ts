import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Passenger } from '../passenger/entities/passenger.entity';
import { User } from './entities/user.entity';
import { AuthResponse } from './dto/authResponse.dto';
import { LoginInput } from './dto/loginInput.dto';
import { RegisterPassengerInput } from './dto/passenger.dto';
import { Staff } from 'src/staff/entities/staff.entity';
import { Airport } from 'src/airport/entities/airport.entity';
import { RegisterStaffInput } from './dto/staff.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Passenger)
    private passengersRepository: Repository<Passenger>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Airport)
    private airportsRepository: Repository<Airport>,
    private jwtService: JwtService,
  ) {}

  // --- Passenger Registration ---
  async registerPassenger(
    input: RegisterPassengerInput,
  ): Promise<AuthResponse> {
    // 1. Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: input.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // 3. Create the base User entity (role: 'Passenger')
    const newUser = this.usersRepository.create({
      email: input.email,
      password: hashedPassword,
      role: 'Passenger', // Assign the specific role
    });
    const savedUser = await this.usersRepository.save(newUser);

    // 4. Create the Passenger entity linked to the User
    const newPassenger = this.passengersRepository.create({
      user: savedUser, // Link to the new User entity
      name: input.name,
      passportNumber: input.passportNumber,
      nationality: input.nationality,
    });
    await this.passengersRepository.save(newPassenger);

    // 5. Generate JWT Token
    const payload = { userId: savedUser.id, role: savedUser.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }

  // src/auth/auth.service.ts (inside registerStaff method)

  async registerStaff(input: RegisterStaffInput): Promise<AuthResponse> {
    // 1-4. Checks and Password Hashing (REMAIN UNCHANGED)
    // ...

    // 5. Find the Airport (REMAIN UNCHANGED)
    const airport = await this.airportsRepository.findOne({
      where: { id: input.airportId },
    });
    if (!airport) {
      throw new BadRequestException(
        `Airport with ID ${input.airportId} not found.`,
      );
    }


    const hashedPassword = await bcrypt.hash(input.password, 10); 
    
    // 5. Create the base User entity
    // ... (Steps 1-5 remain)
    const newUser = this.usersRepository.create({
      email: input.email,
      password: hashedPassword,
      role: input.userRole,
    });

    const savedUser = await this.usersRepository.save(newUser); // 6. Create the Staff entity linked to the User and Airport

    const newStaff = this.staffRepository.create({
      user: savedUser,
      airport: airport,
      employeeId: input.employeeId,
      name: input.name,
      role: input.staffRole,
    });
    const savedStaff = await this.staffRepository.save(newStaff);

    // 7. CRITICAL FIX: Update the User entity with the new Staff ID and save it.
    savedUser.staff = savedStaff; // Assuming the field is named 'staff' on the User entity
    await this.usersRepository.save(savedUser); 

    const payload = { userId: savedUser.id, role: savedUser.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }



  // --- General Login ---
  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    // 1. Find the User
    const user = await this.usersRepository.findOne({
      where: { email },
      // Select the password explicitly since it's excluded by default
      select: ['id', 'email', 'password', 'role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // 2. Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // 3. Generate JWT Token
    const payload = { userId: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // 4. Return the response (excluding the password property)
    // NOTE: This ensures the User object sent back doesn't expose the password hash

    return {
      accessToken,
    };
  }

  async findOne(id: string): Promise<User> {
    const user: User | null = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return user;
  }
}
