// src/staff/staff.loader.ts
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
        const staffMembers = await this.staffService.findByAirportIds(airportIds);
        const staffMap = new Map<string, Staff[]>();
        
        // Initialize map with empty arrays
        airportIds.forEach(id => staffMap.set(id, []));
        
        // Populate the map
        staffMembers.forEach(staff => {
          if (staff.airportId) {
            const current = staffMap.get(staff.airportId) || [];
            staffMap.set(staff.airportId, [...current, staff]);
          }
        });
        
        return airportIds.map(id => staffMap.get(id) || []);
      }
    );
    


      const staffByFlightId = new DataLoader<string, Staff[]>(
      async (flightIds: string[]) => {
        // Assume findByFlightIds is optimized to fetch all staff in one query, 
        // and crucially, returns the results with the 'flightId' property attached
        const rawStaffResults = await this.staffService.findByFlightIds(flightIds);

        // Cast the results to the expected type for correct mapping.
        // NOTE: The underlying service implementation must ensure 'flightId' 
        // is projected onto these results (e.g., using TypeORM's query builder to JOIN FlightStaff).
        const staffWithKeys = rawStaffResults as StaffWithFlightId[];

        // Utility to map an array of results back to the keys (Flight IDs)
        // We can now use 'flightId' safely since the array type has been asserted.
        const mappedStaff = mapArrayToIds(staffWithKeys, 'flightId');

        // MUST return results in the EXACT order of the input keys
        return flightIds.map((id) => mappedStaff[id] || []);
      },
    );


    
    // --- NEW LOADER IMPLEMENTATION ---
    const flightAssignmentsByStaffId = new DataLoader<string, FlightStaff[]>(
      async (staffIds: string[]) => {
        // This service method must use TypeORM's 'IN' operator to fetch all assignments
        const rawAssignments = await this.staffService.flightAssignmentsByStaffIds(staffIds);

        // Cast results to ensure TypeScript knows the 'staffId' property exists for mapping
        const assignmentsWithKeys = rawAssignments as FlightStaffWithStaffId[];

        // Group by the foreign key 'staffId'
        const mappedAssignments = mapArrayToIds(assignmentsWithKeys, 'staffId');

        // Return the results in the EXACT order of the input keys
        return staffIds.map((id) => mappedAssignments[id] || []);
      },
    );




    

    return { staffByAirportId, staffByFlightId ,flightAssignmentsByStaffId};
  }
}