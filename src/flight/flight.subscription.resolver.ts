import { Resolver, Subscription, Args, ID } from '@nestjs/graphql';
import { Flight } from './entities/flight.entity';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Inject } from '@nestjs/common';

@Resolver(() => Flight)
export class FlightSubscriptionResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  @Subscription(() => Flight, {
    name: 'flightStatusUpdated',
    filter: (payload, variables) => {
      return payload.flightStatusUpdated.id === variables.flightId;
    },
  })
  flightStatusUpdated(@Args('flightId', { type: () => ID }) flightId: string) {
    console.log('from the subscription');
    return this.pubSub.asyncIterator('flightStatusUpdated');
  }
}
