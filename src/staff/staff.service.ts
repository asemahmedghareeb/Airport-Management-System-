import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; 
import { Staff } from './entities/staff.entity';
import { FlightStaff } from 'src/flight/entities/flight_staff';
import { Airport } from 'src/airport/entities/airport.entity';
import { Flight } from 'src/flight/entities/flight.entity';
import { StaffFilterInput } from './dto/staffFilterInput.dto';
import { PaginationInput } from 'src/common/pagination.input';
import { PaginatedStaff } from './dto/paginatedStaff.dto';
import { UpdateStaffInput } from './dto/UpdateStaffInput.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AssignStaffToFlightInput } from './dto/assignStaffToFlightInput';
import { User } from 'src/auth/entities/user.entity'; 

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Airport)
    private airportRepository: Repository<Airport>,
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(FlightStaff)
    private flightStaffRepository: Repository<FlightStaff>,
    @InjectRepository(User) 
    private userRepository: Repository<User>,
  ) {} 

  async findAll(
    pagination: PaginationInput,
    filter: StaffFilterInput,
  ): Promise<PaginatedStaff> {
    const { page, limit } = pagination;
    const { name, employeeId, role } = filter;
    const skip = (page - 1) * limit;

    const query = this.staffRepository
      .createQueryBuilder('staff') 
      .orderBy('staff.name', 'ASC'); 

    if (name) {
      query.andWhere('staff.name ILIKE :name', { name: `%${name}%` });
    }
    if (employeeId) {
      query.andWhere('staff.employeeId = :employeeId', { employeeId });
    }
    if (role) {
      query.andWhere('staff.role = :role', { role });
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

  async findOne(id: string): Promise<Staff> {
    const staffMember = await this.staffRepository.findOne({
      where: { id }, 
    });
    if (!staffMember) {
      throw new NotFoundException(`Staff member with ID "${id}" not found.`);
    }
    return staffMember;
  } 

  async update(input: UpdateStaffInput): Promise<Staff> {
    const { id, airportId, ...updateFields } = input;
    const staff = await this.staffRepository.findOneBy({ id });
    if (!staff) {
      throw new NotFoundException(`Staff member with ID "${id}" not found.`);
    }

    if (airportId) {
      const airport = await this.airportRepository.findOneBy({ id: airportId });
      if (!airport) {
        throw new NotFoundException(
          `Airport with ID "${airportId}" not found.`,
        );
      }
      staff.airport = airport;
    }

    Object.assign(staff, updateFields);
    return this.staffRepository.save(staff);
  }

  async delete(id: string): Promise<Staff> {
   
    const staff = await this.staffRepository.findOneBy({ id });
    if (!staff) {
      throw new NotFoundException(`Staff member with ID "${id}" not found.`);
    }


    const user = await this.userRepository.findOneBy({
      staff: { id: staff.id },
    });
    if (user) {
      await this.userRepository.remove(user);
    }


    await this.staffRepository.remove(staff);
    return staff;
  }

  async assignToFlight(input: AssignStaffToFlightInput): Promise<FlightStaff> {
    const { staffId, flightId, assignedRoleOnFlight } = input; 

    const staff = await this.staffRepository.findOneBy({ id: staffId });
    if (!staff) {
      throw new NotFoundException(
        `Staff member with ID "${staffId}" not found.`,
      );
    }

    const flight = await this.flightRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new NotFoundException(`Flight with ID "${flightId}" not found.`);
    } 

    const existingAssignment = await this.flightStaffRepository.findOne({
      where: { staff: { id: staffId }, flight: { id: flightId } },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        'Staff member is already assigned to this specific flight.',
      );
    }

    const newAssignment = this.flightStaffRepository.create({
      staff,
      flight,
      assignedRoleOnFlight,
    });

    return this.flightStaffRepository.save(newAssignment);
  }   

  async findByAirport(airportId: string): Promise<Staff[]> {
    
    const airportExists = await this.airportRepository.count({
      where: { id: airportId },
    });
    if (airportExists === 0) {
      throw new NotFoundException(`Airport with ID "${airportId}" not found.`);
    } 

    const staff = await this.staffRepository.find({
      where: { airportId }, 
    });

    return staff;
  } 

  async findByFlight(flightId: string): Promise<Staff[]> {
    
    const flightStaff: FlightStaff[] = await this.flightStaffRepository.find({
      where: { flightId },
      relations: ['staff'],
    });
    return flightStaff.map((fs) => fs.staff);
  }

  // // --- NEW HELPERS for Resolvers/DataLoaders ---
  // async findUserByStaffId(userId: string): Promise<User | null> {
  //   // Assuming a dedicated UserService exists, but using UserRepository directly for now
  //   return this.userRepository.findOneBy({ id: userId });
  // }

  // async findAirportByStaffId(airportId: string): Promise<Airport | null> {
  //   return this.airportRepository.findOneBy({ id: airportId });
  // }

  // async findFlightAssignmentsByStaffId(
  //   staffId: string,
  // ): Promise<FlightStaff[]> {
  //   // Eagerly loading flight for the assignment list might be fine, but we'll stick to base data
  //   return this.flightStaffRepository.find({ where: { staffId } });
  // }

  
  async findByAirportIds(airportIds: string[]): Promise<Staff[]> {
    return this.staffRepository.find({
      where: { airportId: In(airportIds) },
    });
  }

  async findByFlightIds(flightIds: string[]): Promise<Staff[]> {
   
    return this.staffRepository.find({
      where: {
        id: In(flightIds),
      },
    });
  }

  flightAssignmentsByStaffIds(staffIds: string[]): Promise<FlightStaff[]> {
    return this.flightStaffRepository.find({
      where: { staffId: In(staffIds) },
    });
  }
}
