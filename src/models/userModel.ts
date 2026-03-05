import { query } from '../config/db.js';

export const userModel = {
  async findByEmail(email: string) {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    return users.length > 0 ? users[0] : null;
  },

  async findByUsername(username: string) {
    const users = await query('SELECT id FROM users WHERE username = ?', [username]);
    return users.length > 0 ? users[0] : null;
  },

  async findById(id: number) {
    const users = await query('SELECT id, name, email, email_verified, created_at FROM users WHERE id = ?', [id]);
    return users.length > 0 ? users[0] : null;
  },

  async create(user: any) {
    const { name, email, passwordHash, username, verificationToken, verificationExpires } = user;
    const result: any = await query(
      'INSERT INTO users (name, email, password_hash, username, verification_token, verification_expires) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, username, verificationToken, verificationExpires]
    );
    return result;
  },

  async verifyEmail(token: string) {
    const users = await query(
      'SELECT * FROM users WHERE verification_token = ? AND verification_expires > NOW()',
      [token]
    );
    if (users.length === 0) return null;

    await query(
      'UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires = NULL WHERE id = ?',
      [users[0].id]
    );
    return users[0];
  },

  async setVerificationToken(userId: number, token: string, expires: Date) {
    await query(
      'UPDATE users SET verification_token = ?, verification_expires = ? WHERE id = ?',
      [token, expires, userId]
    );
  },

  async setResetToken(email: string, token: string, expires: Date) {
    await query(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
      [token, expires, email]
    );
  },

  async resetPassword(token: string, passwordHash: string) {
    const users = await query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );
    if (users.length === 0) return false;

    await query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [passwordHash, users[0].id]
    );
    return true;
  }
};
