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
import { Throttle } from '@nestjs/throttler';

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
