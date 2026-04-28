import { IEmailProvider } from './EmailProvider.interface';
import { NodemailerProvider } from './NodemailerProvider';
import { ResendProvider } from './ResendProvider';

export class EmailFactory {
  static getProvider(): IEmailProvider {
    const providerType = process.env.EMAIL_PROVIDER || 'nodemailer';

    switch (providerType) {
      case 'resend':
        return new ResendProvider();
      case 'nodemailer':
      default:
        return new NodemailerProvider();
    }
  }
}
