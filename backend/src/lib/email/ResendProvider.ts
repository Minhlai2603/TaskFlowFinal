import { Resend } from 'resend';
import { IEmailProvider, EmailOptions } from './EmailProvider.interface';

export class ResendProvider implements IEmailProvider {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: 'TaskFlow <onboarding@resend.dev>', // Update in production
        ...options,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Resend failed to send email:', error);
      throw new Error('Email delivery failed');
    }
  }
}
