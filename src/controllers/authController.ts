import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userModel } from '../models/userModel.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { generateToken } from '../utils/tokenUtils.js';
import { generateUsername } from '../utils/helpers.js';
import { AuthRequest } from '../types/globalTypes.js';

async function ensureUniqueUsername(name: string): Promise<string> {
  let username = generateUsername(name);
  let attempts = 0;
  while (attempts < 10) {
    const existing = await userModel.findByUsername(username);
    if (!existing) return username;
    username = generateUsername(name);
    attempts++;
  }
  return `${generateUsername(name)}_${Date.now()}`;
}

export const authController = {
  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;

    try {
      const existing = await userModel.findByEmail(email);
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const username = await ensureUniqueUsername(name);
      const passwordHash = await bcrypt.hash(password, 10);
      const verificationToken = uuidv4();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await userModel.create({
        name,
        email,
        passwordHash,
        username,
        verificationToken,
        verificationExpires
      });

      // Send verification email (non-blocking)
      sendVerificationEmail(email, name, verificationToken).catch(err => {
        console.error('[Mailer] Failed to send verification email:', err.message);
      });

      return res.json({ success: true, message: 'Registration successful. Please check your email to verify your account.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Registration failed' });
    }
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await userModel.findByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

      const token = generateToken(user.id, user.email);
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified === 1,
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Login failed' });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query as { token: string };
    if (!token) return res.status(400).json({ error: 'Token required' });

    try {
      const user = await userModel.verifyEmail(token);
      if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });

      return res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Verification failed' });
    }
  },

  async resendVerification(req: AuthRequest, res: Response) {
    const { email } = req.body;
    try {
      const user = await userModel.findByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.email_verified) return res.status(400).json({ error: 'Email already verified' });

      const verificationToken = uuidv4();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await userModel.setVerificationToken(user.id, verificationToken, verificationExpires);
      await sendVerificationEmail(user.email, user.name, verificationToken);

      return res.json({ success: true, message: 'Verification email sent. Please check your inbox.' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to resend verification email: ' + error.message });
    }
  },

  async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body;
    try {
      const user = await userModel.findByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await userModel.setResetToken(user.email, resetToken, resetExpires);
      await sendPasswordResetEmail(user.email, user.name, resetToken);

      return res.json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (error) {
      console.error('Password reset request error:', error);
      return res.status(500).json({ error: 'Failed to request password reset' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    try {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const success = await userModel.resetPassword(token, passwordHash);

      if (!success) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      return res.json({ success: true, message: 'Password reset successful. You can log in.' });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({ error: 'Failed to reset password' });
    }
  },

  async me(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const user = await userModel.findById(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified === 1,
        createdAt: user.created_at
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
};
