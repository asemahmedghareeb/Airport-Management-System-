import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { EmailsService } from 'src/emails/emails.service';

interface FlightEmailJob {
  toEmail: string;
  flightNumber: string;
  newStatus: string;
}

@Processor('email')
export class FlightEmailProcessor {
  constructor(private readonly emailsService: EmailsService) {}

  @Process('send-status-email')
  async handleSendStatusEmail(job: Job<FlightEmailJob>) {
    const { toEmail, flightNumber, newStatus } = job.data;

    console.log(`Processing email for user: ${toEmail}`);

    try {
      await this.emailsService.sendEmail(
        toEmail,
        `Flight number ${flightNumber} has been Status Updated`,
        `<h1>The flight status is now: ${newStatus}</h1>`,
      );
      console.log(`Successfully sent email to ${toEmail}`);
    } catch (err) {
      console.error(`Email failed for ${toEmail}:`, err);
      throw err;
    }
  }
  
}
