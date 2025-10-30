// src/notification/dto/send-notification.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SendNotificationInput {
  @Field()
  title: string;

  @Field()
  message: string;

  @Field(() => [String])
  playerIds: string[];
}
