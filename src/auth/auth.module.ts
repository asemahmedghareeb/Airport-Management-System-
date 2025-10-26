import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [AuthResolver, AuthService, CaslAbilityFactory],
})
export class AuthModule {}
