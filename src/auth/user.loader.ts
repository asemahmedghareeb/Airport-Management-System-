import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class UserLoader {
  constructor(private readonly authService: AuthService) {}

  createLoaders() {
    const userById = new DataLoader<string, User>(async (userIds: string[]) => {
      const users = await this.authService.findByIds(userIds);

      const userMap = new Map(users.map((user) => [user.id, user]));

      return userIds.map((id) => userMap.get(id) as User);
    });

    return {
      userById,
    };
  }
}
