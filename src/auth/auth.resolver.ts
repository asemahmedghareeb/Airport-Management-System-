import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
 
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtService } from '@nestjs/jwt';
import { Role } from './role.enum';
import { Roles } from './decorators/roles.decorator';
@Resolver()
export class AuthResolver {
  constructor(private jwtService: JwtService) {}
  private users = [
    {
      id: 1,
      username: 'user',
      roles: ['user'],
    },
    {
      id: 2,
      username: 'admin',
      roles: ['admin'],
    },
  ];

  @Query(() => String)
  publicHello() {
    return 'Hello — public';
  }

  // Any authenticated user
  @Query(() => String)
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: any) {
    return `me: ${user.username} (roles: ${user.roles.join(',')})`;
  }

  // Only admin
  @Query(() => String)
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  adminOnly(@CurrentUser() user: any) {
    return `admin area — welcome ${user.username}`;
  }

  // Only user role
  @Query(() => String)
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  userArea(@CurrentUser() user: any) {
    return `user area — welcome ${user.username}`;
  }

  @Mutation(() => String)
  login(@Args('username') username: string) {
    const user = this.users.find((u) => u.username === username);
    if (!user) throw new NotFoundException('User not found');
    const token = this.jwtService.sign(user);
    return token;
  }
}
