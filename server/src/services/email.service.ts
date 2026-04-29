import nodemailer from 'nodemailer';
import pug from 'pug';
import path from 'path';
import { convert } from 'html-to-text';
import { env } from '../config/env';

export class Email {
  private to: string;
  private firstName: string;
  private url: string;
  private from: string;
  private email: string;

  constructor(user: { email: string; name: { first: string } }, url: string) {
    this.to = user.email;
    this.firstName = user.name.first;
    this.email = user.email;
    this.url = url;
    this.from = env.EMAIL_FROM;
  }

  private newTransport(): nodemailer.Transporter {
    if (env.NODE_ENV === 'production') {
      // Sendgrid logic
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: env.SENDGRID_API_KEY,
        },
      });
    }

    // Development (Mailtrap or similar SMTP)
    return nodemailer.createTransport({
      host: env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
      port: env.EMAIL_PORT || 2525,
      auth: {
        user: env.EMAIL_USERNAME,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  private async send(
    template: string,
    subject: string,
    data: Record<string, unknown> = {}
  ): Promise<void> {
    const templatePath = path.join(__dirname, '..', 'views', 'emails', `${template}.pug`);

    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      email: this.email,
      url: this.url,
      subject,
      ...data,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome(): Promise<void> {
    await this.send('welcome', 'Welcome to BookMyGuruji! 🙏');
  }

  async sendPasswordReset(): Promise<void> {
    await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
  }

  async sendVerificationEmail(): Promise<void> {
    await this.send('welcome', 'Please verify your email address');
  }

  async sendPasswordChanged(): Promise<void> {
    await this.send('passwordChanged', 'Your password has been changed');
  }

  async sendAccountApproved(): Promise<void> {
    await this.send('accountApproved', 'Your Priest Account has been Approved! 🙏');
  }

  async sendAccountRejected(reason: string): Promise<void> {
    await this.send('accountRejected', 'Update on your Priest Account Application', { reason });
  }
}
