import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { FlightStaff } from 'src/flight/entities/flight_staff';
import { Airport } from 'src/airport/entities/airport.entity';
import { Flight } from 'src/flight/entities/flight.entity';
import { StaffFilterInput } from './dto/staffFilterInput.dto';
import { PaginationInput } from 'src/common/pagination.input';
import { PaginatedStaff } from './dto/paginatedStaff.dto';
import { UpdateStaffInput } from './dto/UpdateStaffInput.dto';
import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { AssignStaffToFlightInput } from './dto/assignStaffToFlightInput';
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
  ) {}

  // --- READ: Retrieve Staff with Pagination and Filtering ---
  async findAll(
    pagination: PaginationInput,
    filter: StaffFilterInput,
  ): Promise<PaginatedStaff> {
    const { page, limit } = pagination;
    const { name, employeeId, role } = filter;
    const skip = (page - 1) * limit;

    const query = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.airport', 'airport')
      .leftJoinAndSelect('staff.user', 'user');

    // Add filtering conditions
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

  // --- READ: Retrieve Single Staff Member ---
  async findOne(id: string): Promise<Staff> {
    const staffMember = await this.staffRepository.findOne({
      where: { id },
      relations: ['airport', 'user', 'flightAssignments.flight'],
    });
    if (!staffMember) {
      throw new NotFoundException(`Staff member with ID "${id}" not found.`);
    }
    return staffMember;
  }

  // --- UPDATE: Modify Staff Details ---
  async update(input: UpdateStaffInput): Promise<Staff> {
    const { id, airportId, ...updateFields } = input;
    const staff = await this.findOne(id);
    if (!staff) {
      throw new NotFoundException(`Staff member with ID "${id}" not found.`);
    }

    if (airportId) {
      const airport = await this.airportRepository.findOne({
        where: { id: airportId },
      });

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

  // --- DELETE: Remove Staff Member ---
  async delete(id: string): Promise<Staff> {
    const staff = await this.findOne(id);
    if (!staff) {
      throw new NotFoundException(`Staff member with ID "${id}" not found.`);
    }
    // Deletes the Staff record and cascades to the associated User record
    await this.staffRepository.remove(staff);
    return staff;
  }

  // --- ASSIGNMENT: Assign Staff to a Flight ---
  async assignToFlight(input: AssignStaffToFlightInput): Promise<FlightStaff> {
    const { staffId, flightId, assignedRoleOnFlight } = input;

    const staff = await this.findOne(staffId);
    if (!staff) {
      throw new NotFoundException(
        `Staff member with ID "${staffId}" not found.`,
      );
    }

    const flight = await this.flightRepository.findOne({
      where: { id: flightId },
    });
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
    const airport = await this.airportRepository.findOne({
      where: { id: airportId },
    });
    if (!airport) {
      throw new NotFoundException(`Airport with ID "${airportId}" not found.`);
    }

    const staff = await this.staffRepository.find({
      where: { airport: { id: airportId } },

      relations: ['user', 'airport'],
    });

    return staff;
  }
  async findByFlight(flightId: string): Promise<Staff[]> {
    const flightStaff: FlightStaff[] = await this.flightStaffRepository.find({
      where: { flightId },
      relations: ['staff'],
    });
    if (!flightStaff) {
      return [];
    }
    return flightStaff.map((flightStaff) => flightStaff.staff);
  }
}
