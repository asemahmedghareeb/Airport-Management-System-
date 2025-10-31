import { Resolver, Query, Mutation, Args, Field } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { RegisterPassengerInput } from './dto/passenger.dto';
import { LoginInput } from './dto/loginInput.dto';
import { AuthResponse } from './dto/loginResponse.dto';
import { RegisterStaffInput } from './dto/staff.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './role.enum';
import { Roles } from './decorators/roles.decorator';
import { ObjectType } from '@nestjs/graphql';
import { RegisterResponse } from './dto/registerResponse.dto';

@ObjectType()
class Me {
  @Field()
  userId: string;

  @Field()
  role: string;
}

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterResponse, { name: 'registerPassenger' })
  async registerPassenger(
    @Args('input') input: RegisterPassengerInput,
  ): Promise<RegisterResponse> {
    return this.authService.registerPassenger(input);
  }

  @Mutation(() => RegisterResponse, { name: 'registerStaff' })
  async registerStaff(
    @Args('input') input: RegisterStaffInput,
  ): Promise<RegisterResponse> {
    return this.authService.registerStaff(input);
  }

  @Mutation(() => AuthResponse, { name: 'login' })
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Me, { name: 'me' })
  async me(@CurrentUser() user: { userId: string; role: string }) {
    return user;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => User, { name: 'user' })
  async findUser(@Args('id') id: string): Promise<User> {
    return this.authService.findOne(id);
  }
}
