// src/flight/flight-email.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { EmailsService } from 'src/emails/emails.service'; // Assuming you have this service

// Define the job structure
interface FlightEmailJob {
  toEmail: string;
  flightNumber: string;
  newStatus: string;
}

@Processor('email') // Matches the registered queue name
export class FlightEmailProcessor {
  constructor(private readonly emailsService: EmailsService) {}

  @Process('send-status-email') // The specific job name
  async handleSendStatusEmail(job: Job<FlightEmailJob>) {
    const { toEmail, flightNumber, newStatus } = job.data;

    console.log(`Processing email for user: ${toEmail}`);

    try {
      // 🚨 Replace this with your actual email service call 🚨
      await this.emailsService.sendEmail(
        toEmail,
        `Flight number ${flightNumber} has been Status Updated`,
        `<h1>The flight status is now: ${newStatus}</h1>`,
      );
      console.log(`Successfully sent email to ${toEmail}`);
    } catch (err) {
      console.error(`Email failed for ${toEmail}:`, err);
      // Re-throw to allow BullMQ to handle retries (up to 3 times)
      throw err;
    }
  }
}