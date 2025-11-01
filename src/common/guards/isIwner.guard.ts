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
  t;

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
        throw new ForbiddenException(
          'Resource ID not provided for validation.',
        );
      }

      if (requestedId === user.passengerId) {
        return true;
      }

      if (user.bookings && user.bookings.includes(requestedId)) {
        return true;
      }
    }
    throw new ForbiddenException(
      `You do not have permission to access the requested resource.`,
    );
  }

  private extractTargetId(args: Record<string, any>): string | null {
    if (args.id) {
      return args.id;
    }

    if (args.input && args.input.id) {
      return args.input.id;
    }

    if (args.passengerId) {
      return args.passengerId;
    }

    return null;
  }
}
