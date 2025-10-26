import { Test, TestingModule } from '@nestjs/testing';
import { FlightResolver } from './flight.resolver';
import { FlightService } from './flight.service';

describe('FlightResolver', () => {
  let resolver: FlightResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightResolver, FlightService],
    }).compile();

    resolver = module.get<FlightResolver>(FlightResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
