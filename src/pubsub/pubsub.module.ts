import { Module, Global } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const PUB_SUB = 'PUB_SUB';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: () => {
        const options = {
          host: 'redis',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        };

        return new RedisPubSub({
          publisher: new Redis(options),
          subscriber: new Redis(options),
        });
      },
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}



// import { Global, Module } from '@nestjs/common';
// import { RedisPubSub } from 'graphql-redis-subscriptions';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// export const PUB_SUB = 'PUB_SUB';

// @Global()
// @Module({
//   imports: [ConfigModule],
//   providers: [
//     {
//       provide: PUB_SUB,
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => {
//         const pubsub = new RedisPubSub({
//           connection: {
//             host: 'redis',
//             port: parseInt(process.env.REDIS_PORT || '6379', 10),
//           },
//         });
//         return pubsub;
//       },
//     },
//   ],
//   exports: [PUB_SUB],
// })
// export class PubSubModule {}
