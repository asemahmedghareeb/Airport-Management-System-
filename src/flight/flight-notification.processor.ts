import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { OneSignalService } from 'src/push-notifications/onesignal.service';

interface FlightStatusUpdateJob {
  flightNumber: string;
  newStatus: string;
  playerIds: string[];
}

@Processor('notification')
export class FlightNotificationProcessor {
  constructor(private readonly oneSignalService: OneSignalService) {}

  @Process('flight-status-update')
  async handleFlightStatusUpdate(job: Job<FlightStatusUpdateJob>) {
    const { flightNumber, newStatus, playerIds } = job.data;

    console.log(
      `Processing flight status update notification for flight ${flightNumber}`,
    );

    if (playerIds.length === 0) {
      console.log(
        `No players found for flight ${flightNumber}. Skipping notification.`,
      );
      return;
    }

    try {
      await this.oneSignalService.sendNotification(
        { en: `Flight number ${flightNumber} has been Status Updated` },
        { en: `The flight status is now: ${newStatus}` },
        playerIds,
      );
      console.log(`Successfully sent notifications for flight ${flightNumber}`);
    } catch (err) {
      console.error(`Notification failed for flight ${flightNumber}:`, err);
      throw err;
    }
  }
}
