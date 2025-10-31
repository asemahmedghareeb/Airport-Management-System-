import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from 'src/auth/role.enum';


interface IPassenger {
  userId: string;
  role: string;
  passengerId: string;
  bookings: string[]; 
}

@Injectable()
export class IsOwnerGuard implements CanActivate {
t

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    const user = ctx.getContext().req.user as IPassenger;

    if (user.role === Role.ADMIN) {
      return true;
    }

    if (user.role === Role.PASSENGER) {
      const requestedId = this.extractTargetId(args);

      if (!requestedId) {
         // This typically happens if the resolver expects an ID but none was provided
         throw new ForbiddenException('Resource ID not provided for validation.');
      }
      
      // SCENARIO A: Request is for the passenger's own ID (e.g., findBookingsByPassenger)
      if (requestedId === user.passengerId) {
          return true;
      }
      
      // SCENARIO B: Request is for a Booking ID (e.g., findOne, updateBooking, deleteBooking)
      // 🔑 CRITICAL CHECK: Check if the requested ID exists in the token's booking list.
      if (user.bookings && user.bookings.includes(requestedId)) {
        return true;
      }
    }

    // --- 3. DENIAL ---
    throw new ForbiddenException(
      `You do not have permission to access the requested resource.`,
    );
  }

  /**
   * Helper function to extract the target ID from various argument structures.
   */
  private extractTargetId(args: Record<string, any>): string | null {
    // 1. Check for 'id' argument (used in findOne, deleteBooking)
    if (args.id) {
      return args.id;
    }

    // 2. Check for 'input.id' (used in updateBooking)
    if (args.input && args.input.id) {
      return args.input.id;
    }

    // 3. Check for 'passengerId' argument (used in findBookingsByPassenger)
    if (args.passengerId) {
        return args.passengerId;
    }

    return null;
  }
}
