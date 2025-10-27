import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { FlightStaff } from 'src/flight/entities/flight_staff';
@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(FlightStaff)
    private readonly flightStaffRepository: Repository<FlightStaff>,
  ) {}
  create(createStaffInput) {
    return 'This action adds a new staff';
  }

  findAll() {
    return `This action returns all staff`;
  }

  findOne(id: number) {
    return `This action returns a #${id} staff`;
  }

  update(id: number, updateStaffInput) {
    return `This action updates a #${id} staff`;
  }

  remove(id: number) {
    return `This action removes a #${id} staff`;
  }

  findByAirport(airportId: string) {
    return this.staffRepository.find({ where: { airport: { id: airportId } } });
  }

  async findByFlight(flightId: string): Promise<Staff[]> {
    const flightStaff: FlightStaff[] = await this.flightStaffRepository.find({ where: { flightId }, relations: ['staff'] });
    if(!flightStaff){
        return [];
    }
    return flightStaff.map((flightStaff) => flightStaff.staff);
  }
}
