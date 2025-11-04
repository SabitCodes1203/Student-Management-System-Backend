import nodemailer from 'nodemailer';

export type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail(options: MailOptions): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

