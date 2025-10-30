import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { sendNotificationDTO } from './dto/send-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async sendNotification(@Body() pushNotification: sendNotificationDTO) {
    console.log('pushNotification');
    await this.notificationService.sendPush(pushNotification);
  }
}
