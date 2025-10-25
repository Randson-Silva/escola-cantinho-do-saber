import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
import { singleton } from 'tsyringe';

@singleton()
export class NodeMailerService {
  async sendMail(mailOptions: MailOptions) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    try {
      await transporter.sendMail(mailOptions).then(() => console.log('Email sent'));
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
