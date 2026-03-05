import { transporter } from '../config/smtp.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyLink = `${ENV.APP_URL}/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #059669; padding: 32px 32px 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .body p { color: #444; font-size: 15px; line-height: 1.6; }
    .btn { display: block; margin: 28px auto 0; background: #059669; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; text-align: center; max-width: 220px; }
    .footer { text-align: center; padding: 20px; color: #aaa; font-size: 12px; }
    .link-text { word-break: break-all; color: #059669; font-size: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mandal Khata</h1>
      <p>Email Verification</p>
    </div>
    <div class="body">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering! Please verify your email address to activate your account and start creating entries.</p>
      <a href="${verifyLink}" class="btn">Verify My Email</a>
      <p class="link-text">Or copy this link: ${verifyLink}</p>
    </div>
    <div class="footer">This link expires in 24 hours. If you did not register, please ignore this email.</div>
  </div>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: `"Mandal Khata" <${ENV.SMTP_FROM}>`,
      to: email,
      subject: 'Verify Your Email — Mandal Khata',
      html,
      text: `Hello ${name},\n\nPlease verify your email by visiting:\n${verifyLink}\n\nThis link expires in 24 hours.`,
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (err: any) {
    logger.error(`Failed to send verification email to ${email}`, err);
    throw err;
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetLink = `${ENV.APP_URL}/reset-password?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<!-- Using similar styles to verification email -->
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #059669; padding: 32px 32px 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .body p { color: #444; font-size: 15px; line-height: 1.6; }
    .btn { display: block; margin: 28px auto 0; background: #059669; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; text-align: center; max-width: 220px; }
    .footer { text-align: center; padding: 20px; color: #aaa; font-size: 12px; }
    .link-text { word-break: break-all; color: #059669; font-size: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mandal Khata</h1>
      <p>Password Reset</p>
    </div>
    <div class="body">
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <a href="${resetLink}" class="btn">Reset Password</a>
      <p class="link-text">Or copy this link: ${resetLink}</p>
    </div>
    <div class="footer">This link expires in 1 hour. If you did not request this, please ignore this email.</div>
  </div>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: `"Mandal Khata" <${ENV.SMTP_FROM}>`,
      to: email,
      subject: 'Reset Your Password — Mandal Khata',
      html,
      text: `Hello ${name},\n\nPlease reset your password by visiting:\n${resetLink}\n\nThis link expires in 1 hour.`,
    });
    logger.info(`Password reset email sent to ${email}`);
  } catch (err: any) {
    logger.error(`Failed to send password reset email to ${email}`, err);
    throw err;
  }
}
