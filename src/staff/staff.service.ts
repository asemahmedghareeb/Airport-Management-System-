import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // Import 'In' for potential DataLoader implementation
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
import { User } from 'src/auth/entities/user.entity'; // Assuming User entity is used for deletion

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
    @InjectRepository(User) // Needed for deletion logic (if not handled by cascade)
    private userRepository: Repository<User>,
  ) {} // --- READ: Retrieve Staff with Pagination and Filtering ---

  async findAll(
    pagination: PaginationInput,
    filter: StaffFilterInput,
  ): Promise<PaginatedStaff> {
    const { page, limit } = pagination;
    const { name, employeeId, role } = filter;
    const skip = (page - 1) * limit;

    const query = this.staffRepository
      .createQueryBuilder('staff') // ❌ REMOVED: .leftJoinAndSelect('staff.airport', 'airport')
      // ❌ REMOVED: .leftJoinAndSelect('staff.user', 'user')
      .orderBy('staff.name', 'ASC'); // ... Filtering conditions remain the same ...

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
  } // --- READ: Retrieve Single Staff Member ---

  async findOne(id: string): Promise<Staff> {
    const staffMember = await this.staffRepository.findOne({
      where: { id }, // ❌ REMOVED: relations: ['airport', 'user', 'flightAssignments.flight'],
    });
    if (!staffMember) {
      throw new NotFoundException(`Staff member with ID "${id}" not found.`);
    }
    return staffMember;
  } // --- UPDATE: Modify Staff Details ---
  async update(input: UpdateStaffInput): Promise<Staff> {
    const { id, airportId, ...updateFields } = input; // We must fetch the staff member, but without eager relations for performance
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
      } // 💡 Assigning the entity will update the airportId foreign key automatically
      staff.airport = airport;
    }

    Object.assign(staff, updateFields);
    return this.staffRepository.save(staff);
  } // --- DELETE: Remove Staff Member ---

  async delete(id: string): Promise<Staff> {
    // Fetch staff member to return it, no relations needed here
    const staff = await this.staffRepository.findOneBy({ id });
    if (!staff) {
      throw new NotFoundException(`Staff member with ID "${id}" not found.`);
    }

    // Explicitly delete the linked user account using the foreign key
    const user = await this.userRepository.findOneBy({
      staff: { id: staff.id },
    });
    if (user) {
      await this.userRepository.remove(user);
    }

    // Delete the Staff record
    await this.staffRepository.remove(staff);
    return staff;
  } // --- ASSIGNMENT: Assign Staff to a Flight (Logic remains sound) ---

  async assignToFlight(input: AssignStaffToFlightInput): Promise<FlightStaff> {
    const { staffId, flightId, assignedRoleOnFlight } = input; // Using findOneBy for cleaner fetching

    const staff = await this.staffRepository.findOneBy({ id: staffId });
    if (!staff) {
      throw new NotFoundException(
        `Staff member with ID "${staffId}" not found.`,
      );
    }

    const flight = await this.flightRepository.findOneBy({ id: flightId });
    if (!flight) {
      throw new NotFoundException(`Flight with ID "${flightId}" not found.`);
    } // ... existing assignment check remains the same ...

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
  } // --- READ: Find Staff by Airport (Optimized Fetching) ---

  async findByAirport(airportId: string): Promise<Staff[]> {
    // Only check for airport existence, don't fetch the whole object if possible
    const airportExists = await this.airportRepository.count({
      where: { id: airportId },
    });
    if (airportExists === 0) {
      throw new NotFoundException(`Airport with ID "${airportId}" not found.`);
    } // Find staff using the foreign key filter. No eager relations needed here.

    const staff = await this.staffRepository.find({
      where: { airportId }, // 💡 Use the explicit foreign key!
    });

    return staff;
  } // --- READ: Find Staff by Flight (Helper for Resolver) ---

  async findByFlight(flightId: string): Promise<Staff[]> {
    // Fetch the join entities, eagerly load the Staff member
    const flightStaff: FlightStaff[] = await this.flightStaffRepository.find({
      where: { flightId },
      relations: ['staff'],
    });
    return flightStaff.map((fs) => fs.staff);
  }

  // --- NEW HELPERS for Resolvers/DataLoaders ---
  async findUserByStaffId(userId: string): Promise<User | null> {
    // Assuming a dedicated UserService exists, but using UserRepository directly for now
    return this.userRepository.findOneBy({ id: userId });
  }

  async findAirportByStaffId(airportId: string): Promise<Airport | null> {
    return this.airportRepository.findOneBy({ id: airportId });
  }

  async findFlightAssignmentsByStaffId(
    staffId: string,
  ): Promise<FlightStaff[]> {
    // Eagerly loading flight for the assignment list might be fine, but we'll stick to base data
    return this.flightStaffRepository.find({ where: { staffId } });
  }
}
