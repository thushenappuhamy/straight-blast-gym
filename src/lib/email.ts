import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'Straight Blast Gym';

function isPlaceholder(value?: string) {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === 'your-email@gmail.com' || normalized === 'your-app-password';
}

export function isSmtpConfigured() {
  return Boolean(
    SMTP_HOST &&
      SMTP_PORT &&
      SMTP_USER &&
      SMTP_PASS &&
      SMTP_FROM_EMAIL &&
      !isPlaceholder(SMTP_USER) &&
      !isPlaceholder(SMTP_PASS) &&
      !isPlaceholder(SMTP_FROM_EMAIL)
  );
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP_NOT_CONFIGURED');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
    to: toEmail,
    subject: 'Reset your SBG account password',
    text: `You requested a password reset for your SBG account. Use this link to reset your password: ${resetUrl}. This link expires in 10 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1A1816;">
        <h2 style="margin-bottom: 8px;">Reset your password</h2>
        <p>You requested a password reset for your SBG account.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 16px; background: #F4D03F; color: #1A1816; text-decoration: none; font-weight: 700; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p style="word-break: break-all;">If the button does not work, use this link: ${resetUrl}</p>
        <p>This link expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
