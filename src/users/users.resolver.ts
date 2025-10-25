import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../auth/role.enum';
@Resolver()
export class UsersResolver {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

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
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  adminOnly(@CurrentUser() user: any) {
    return `admin area — welcome ${user.username}`;
  }

  // Only user role
  @Query(() => String)
  @Roles(Role.User)
  @UseGuards(AuthGuard, RolesGuard)
  userArea(@CurrentUser() user: any) {
    return `user area — welcome ${user.username}`;
  }

  @Mutation(() => String)
  login(@Args('username') username: string) {
    const user = this.usersService['users'].find(
      (u) => u.username === username,
    );
    if (!user) throw new NotFoundException('User not found');
    const token = this.jwtService.sign(user);
    return token; 
  }
} 
