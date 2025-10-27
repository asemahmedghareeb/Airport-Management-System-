import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtService } from '@nestjs/jwt';
import { Role } from './role.enum';
import { Roles } from './decorators/roles.decorator';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';

import { RegisterPassengerInput } from './dto/passenger.dto';
import { LoginInput } from './dto/loginInput.dto';
import { AuthResponse } from './dto/authResponse.dto';
import { RegisterStaffInput } from './dto/staff.dto';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'registerPassenger' })
  async registerPassenger(
    @Args('input') input: RegisterPassengerInput,
  ): Promise<AuthResponse> {
    return this.authService.registerPassenger(input);
  }

  @Mutation(() => AuthResponse, { name: 'registerStaff' })
  async registerStaff(
    @Args('input') input: RegisterStaffInput,
  ): Promise<AuthResponse> {
    return this.authService.registerStaff(input);
  }

  @Mutation(() => AuthResponse, { name: 'login' })
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input);
  }
}

// @Resolver()
// export class AuthResolver {
//   constructor(private jwtService: JwtService) {}
//   private users = [
//     {
//       id: 1,
//       username: 'user',
//       roles: ['user'],
//     },
//     {
//       id: 2,
//       username: 'admin',
//       roles: ['admin'],
//     },
//   ];

//   @Query(() => String)
//   publicHello() {
//     return 'Hello — public';
//   }

//   // Any authenticated user
//   @Query(() => String)
//   @UseGuards(AuthGuard)
//   me(@CurrentUser() user: any) {
//     return `me: ${user.username} (roles: ${user.roles.join(',')})`;
//   }

//   // Only admin
//   @Query(() => String)
//   @Roles(Role.ADMIN)
//   @UseGuards(AuthGuard, RolesGuard)
//   adminOnly(@CurrentUser() user: any) {
//     return `admin area — welcome ${user.username}`;
//   }

//   // Only user role
//   @Query(() => String)
//   @Roles(Role.ADMIN)
//   @UseGuards(AuthGuard, RolesGuard)
//   userArea(@CurrentUser() user: any) {
//     return `user area — welcome ${user.username}`;
//   }

//   @Mutation(() => String)
//   login(@Args('username') username: string) {
//     const user = this.users.find((u) => u.username === username);
//     if (!user) throw new NotFoundException('User not found');
//     const token = this.jwtService.sign(user);
//     return token;
//   }
// }
