import { Test, TestingModule } from '@nestjs/testing';
import { AirportResolver } from './airport.resolver';
import { AirportService } from './airport.service';

describe('AirportResolver', () => {
  let resolver: AirportResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirportResolver, AirportService],
    }).compile();

    resolver = module.get<AirportResolver>(AirportResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
