
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Staff } from './entities/staff.entity';
import { StaffService } from './staff.service';
import { mapArrayToIds } from 'src/common/utils';
import { FlightStaff } from 'src/flight/entities/flight_staff';

type StaffWithFlightId = Staff & { flightId: string };
type FlightStaffWithStaffId = FlightStaff & { staffId: string };

@Injectable()
export class StaffLoader {
  constructor(private readonly staffService: StaffService) {}

  createLoaders() {
    const staffByAirportId = new DataLoader<string, Staff[]>(
      async (airportIds: string[]) => {
        const staffMembers =
          await this.staffService.findByAirportIds(airportIds);
        const staffMap = new Map<string, Staff[]>();

        airportIds.forEach((id) => staffMap.set(id, []));

        staffMembers.forEach((staff) => {
          if (staff.airportId) {
            const current = staffMap.get(staff.airportId) || [];
            staffMap.set(staff.airportId, [...current, staff]);
          }
        });

        return airportIds.map((id) => staffMap.get(id) || []);
      },
    );

    const staffByFlightId = new DataLoader<string, Staff[]>(
      async (flightIds: string[]) => {
        const rawStaffResults =
          await this.staffService.findByFlightIds(flightIds);

        const staffWithKeys = rawStaffResults as StaffWithFlightId[];

        const mappedStaff = mapArrayToIds(staffWithKeys, 'flightId');

        return flightIds.map((id) => mappedStaff[id] || []);
      },
    );

    const flightAssignmentsByStaffId = new DataLoader<string, FlightStaff[]>(
      async (staffIds: string[]) => {
        const rawAssignments =
          await this.staffService.flightAssignmentsByStaffIds(staffIds);

        const assignmentsWithKeys = rawAssignments as FlightStaffWithStaffId[];

        const mappedAssignments = mapArrayToIds(assignmentsWithKeys, 'staffId');

        return staffIds.map((id) => mappedAssignments[id] || []);
      },
    );

    return { staffByAirportId, staffByFlightId, flightAssignmentsByStaffId };
  }
}
