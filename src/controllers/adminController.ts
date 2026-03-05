import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { adminModel } from '../models/adminModel.js';
import { generateAdminToken } from '../utils/tokenUtils.js';
import { query } from '../config/db.js';

export const adminController = {
  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    
    try {
      const admin = await adminModel.getAdminByUsername(username);
      if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
      
      const valid = await bcrypt.compare(password, admin.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      
      const token = generateAdminToken();
      return res.json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Login failed' });
    }
  },

  async updateCredentials(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!username && !password) return res.status(400).json({ error: 'Provide username or password to update' });
    try {
      let passwordHash;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }
      await adminModel.updateAdminCredentials(1, username, passwordHash);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update credentials' });
    }
  },

  async getUsers(req: Request, res: Response) {
    try {
      const users: any[] = await adminModel.getAllUsers();
      
      // We process counts for the users
      for (const user of users) {
        const stats = await adminModel.getUserStats(user.id);
        user.customer_count = stats.customerCount;
        user.transaction_count = stats.transactionCount;
        user.email_verified = user.email_verified === 1;
      }
      return res.json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { action, password } = req.body;
    try {
      if (action === 'verify-email') {
        await query('UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires = NULL WHERE id = ?', [id]);
        return res.json({ success: true, message: 'User email verified' });
      } else if (action === 'reset-password' && password) {
        const hash = await bcrypt.hash(password, 10);
        await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
        return res.json({ success: true, message: 'Password reset' });
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  },

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await query('DELETE FROM users WHERE id = ?', [id]);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  async getCustomers(req: Request, res: Response) {
    const search = req.query.search as string | undefined;
    try {
      let sql = `SELECT c.*, u.name as user_name, u.email as user_email,
        COALESCE(SUM(CASE WHEN t.type='GAVE' THEN t.amount ELSE -t.amount END), 0) as balance
        FROM customers c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN transactions t ON c.id = t.customer_id AND t.deleted_at IS NULL
        WHERE c.deleted_at IS NULL`;
        
      const params: any[] = [];
      if (search) {
        sql += ' AND (c.name LIKE ? OR u.name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      sql += ' GROUP BY c.id ORDER BY c.created_at DESC';
      
      const customers = await query(sql, params);
      return res.json(customers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminModel.getGlobalStats();
      return res.json(stats);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
};
