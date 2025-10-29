import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class UserLoader {
  constructor(private readonly authService: AuthService) {}

  createLoaders() {
    // One-to-one: Accepts User IDs, returns a single User
    const userById = new DataLoader<string, User>(async (userIds: string[]) => {
      const users = await this.authService.findByIds(userIds);

      // Create a map for quick lookup: { id: User }
      const userMap = new Map(users.map((user) => [user.id, user]));

      // Return the results in the EXACT order of the input keys
      return userIds.map((id) => userMap.get(id) as User);
    });

    return {
      // Key must be 'userById' to match the @Loader decorator
      userById,
    };
  }
}
