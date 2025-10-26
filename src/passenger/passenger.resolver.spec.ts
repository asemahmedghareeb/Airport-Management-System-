import { Test, TestingModule } from '@nestjs/testing';
import { PassengerResolver } from './passenger.resolver';
import { PassengerService } from './passenger.service';

describe('PassengerResolver', () => {
  let resolver: PassengerResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassengerResolver, PassengerService],
    }).compile();

    resolver = module.get<PassengerResolver>(PassengerResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
