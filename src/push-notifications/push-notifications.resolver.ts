// src/subscriptions/push-device.resolver.ts
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { PushDeviceService } from './push-notifications.service';
import { PushDevice } from './entities/PushDevice.entity';
import { RegisterPushDeviceInput } from './dto/register-push-device.input';
import { NotificationResponse } from './dto/notification-response.model';
import { SendNotificationInput } from './dto/send-notification.input';
import { OneSignalService } from './onesignal.service';

@Resolver(() => PushDevice)
export class PushDeviceResolver {
  constructor(
    private readonly pushDeviceService: PushDeviceService,
    private readonly oneSignalService: OneSignalService,
  ) {}

  @Mutation(() => PushDevice)
  async registerPushDevice(
    @Args('input') input: RegisterPushDeviceInput,
    // Use an Authentication Guard/Decorator to get the logged-in User's ID
    // @CurrentUser() user: User,
  ) {
    // 🛑 IMPORTANT: Replace this placeholder with the actual authenticated user's ID
    const authenticatedUserId = '88587bee-4c3d-4aa4-8763-30769bcf3e44';

    return this.pushDeviceService.registerDevice(authenticatedUserId, input);
  }

  @Mutation(() => NotificationResponse)
  async sendNotification(
    @Args('input') input: SendNotificationInput,
  ): Promise<NotificationResponse> {
    const result = await this.oneSignalService.sendNotification(
      { en: input.title },
      { en: input.message },
      input.playerIds,
    );
    console.log(result);
    return {
      id: result.id,
      recipients: result.recipients,
    };
  }
}
