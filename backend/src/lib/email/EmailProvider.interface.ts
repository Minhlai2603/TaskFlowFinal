export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailProvider {
  sendEmail(options: EmailOptions): Promise<void>;
}
