import nodemailer from 'nodemailer';
import { IEmailProvider, EmailOptions } from './EmailProvider.interface';

export class NodemailerProvider implements IEmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        ...options,
      });
    } catch (error) {
      console.error('Nodemailer failed to send email:', error);
      throw new Error('Email delivery failed');
    }
  }
}
