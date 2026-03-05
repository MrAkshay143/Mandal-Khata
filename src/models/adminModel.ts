import { query } from '../config/db.js';

export const adminModel = {
  async getAdminByUsername(username: string) {
    const admins = await query('SELECT * FROM admin_config WHERE username = ?', [username]);
    return admins.length > 0 ? admins[0] : null;
  },

  async updateAdminCredentials(id: number, username?: string, passwordHash?: string) {
    if (username) {
      await query('UPDATE admin_config SET username = ? WHERE id = ?', [username, id]);
    }
    if (passwordHash) {
      await query('UPDATE admin_config SET password_hash = ? WHERE id = ?', [passwordHash, id]);
    }
  },

  async getAllUsers() {
    return await query(
      'SELECT id, name, email, username, email_verified, created_at FROM users ORDER BY created_at DESC'
    );
  },

  async getUserStats(userId: number) {
    const cCount = await query('SELECT COUNT(*) as cnt FROM customers WHERE user_id = ? AND deleted_at IS NULL', [userId]);
    const tCount = await query('SELECT COUNT(*) as cnt FROM transactions WHERE user_id = ? AND deleted_at IS NULL', [userId]);
    return {
      customerCount: cCount[0].cnt,
      transactionCount: tCount[0].cnt
    };
  },

  async getGlobalStats() {
    const totalUsers = await query('SELECT COUNT(*) as cnt FROM users');
    const totalCustomers = await query('SELECT COUNT(*) as cnt FROM customers WHERE deleted_at IS NULL');
    const totalTransactions = await query('SELECT COUNT(*) as cnt FROM transactions WHERE deleted_at IS NULL');
    const verifiedUsers = await query('SELECT COUNT(*) as cnt FROM users WHERE email_verified = 1');
    return {
      totalUsers: totalUsers[0].cnt,
      totalCustomers: totalCustomers[0].cnt,
      totalTransactions: totalTransactions[0].cnt,
      verifiedUsers: verifiedUsers[0].cnt,
    };
  }
};
