import { Response } from 'express';
import { AuthRequest } from '../types/globalTypes.js';
import { transactionModel } from '../models/transactionModel.js';
import { customerModel } from '../models/customerModel.js';
import { getPaginationQuery } from '../utils/helpers.js';
import { query } from '../config/db.js';

export const transactionController = {
  async listByCustomer(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { customerId } = req.params;
    const pagination = getPaginationQuery(req.query);

    try {
      const customer = await customerModel.findById(Number(customerId), req.userId);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      const transactions = await transactionModel.findAllByCustomer(Number(customerId), req.userId, pagination);
      const balance = await transactionModel.getCustomerBalance(Number(customerId), req.userId);

      return res.json({ customer: { ...customer, balance }, transactions });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const customer = await customerModel.findById(Number(req.body.customerId), req.userId);
      if (!customer) return res.status(403).json({ error: 'Customer not found' });

      const result = await transactionModel.create(req.userId, req.body);
      return res.json({ id: result.insertId, ...req.body });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to add transaction' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    try {
      await transactionModel.update(Number(id), req.userId, req.body);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update transaction' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    try {
      await transactionModel.softDelete(Number(id), req.userId);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete transaction' });
    }
  },

  async getSummary(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      
      const totalGiven = await query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GAVE' AND user_id = ? AND deleted_at IS NULL", [req.userId]);
      const totalGot = await query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GOT' AND user_id = ? AND deleted_at IS NULL", [req.userId]);
      const todayEntries = await query(
        "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE DATE(date) = ? AND user_id = ? AND deleted_at IS NULL",
        [today, req.userId]
      );
      const monthEntries = await query(
        "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE DATE(date) >= ? AND user_id = ? AND deleted_at IS NULL",
        [startOfMonth, req.userId]
      );

      return res.json({
        totalReceive: Number(totalGiven[0].total) - Number(totalGot[0].total),
        totalPay: 0,
        todayEntries: todayEntries[0],
        monthEntries: monthEntries[0],
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }
  },

  async getDashboard(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const customers = await query(`
        SELECT c.id, c.name,
          COALESCE(SUM(CASE WHEN t.type = 'GAVE' THEN t.amount ELSE -t.amount END), 0) as balance,
          MAX(t.date) as last_transaction_date
        FROM customers c
        LEFT JOIN transactions t ON c.id = t.customer_id AND t.deleted_at IS NULL
        WHERE c.user_id = ? AND c.deleted_at IS NULL
        GROUP BY c.id
      `, [req.userId]);

      let totalToReceive = 0, totalToPay = 0;
      customers.forEach((c: any) => {
        const bal = Number(c.balance);
        if (bal > 0) totalToReceive += bal;
        else totalToPay += Math.abs(bal);
      });

      const topPending = [...customers]
        .filter((c: any) => Number(c.balance) !== 0)
        .sort((a: any, b: any) => Math.abs(Number(b.balance)) - Math.abs(Number(a.balance)))
        .slice(0, 5)
        .map((c: any) => ({ id: c.id, name: c.name, balance: Number(c.balance) }));

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const overdueCustomers = customers
        .filter((c: any) => {
          if (Number(c.balance) <= 0) return false;
          if (!c.last_transaction_date) return true;
          return new Date(c.last_transaction_date) < thirtyDaysAgo;
        })
        .map((c: any) => ({ id: c.id, name: c.name, balance: Number(c.balance), lastDate: c.last_transaction_date }));

      const today = new Date().toISOString().split('T')[0];
      const todayStats = await query(`
        SELECT COUNT(*) as count,
          COALESCE(SUM(CASE WHEN type='GAVE' THEN amount ELSE 0 END), 0) as gave,
          COALESCE(SUM(CASE WHEN type='GOT' THEN amount ELSE 0 END), 0) as got
        FROM transactions WHERE DATE(date) = ? AND user_id = ? AND deleted_at IS NULL
      `, [today, req.userId]);

      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthStats = await query(`
        SELECT COUNT(*) as count,
          COALESCE(SUM(CASE WHEN type='GAVE' THEN amount ELSE 0 END), 0) as gave,
          COALESCE(SUM(CASE WHEN type='GOT' THEN amount ELSE 0 END), 0) as got
        FROM transactions WHERE DATE_FORMAT(date, '%Y-%m') = ? AND user_id = ? AND deleted_at IS NULL
      `, [currentMonth, req.userId]);

      const monthlyOverview = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const ym = d.toISOString().slice(0, 7);
        const label = d.toLocaleString('default', { month: 'short' });
        const row = await query(`
          SELECT 
            COALESCE(SUM(CASE WHEN type='GAVE' THEN amount ELSE 0 END), 0) as gave,
            COALESCE(SUM(CASE WHEN type='GOT' THEN amount ELSE 0 END), 0) as got
          FROM transactions WHERE DATE_FORMAT(date, '%Y-%m') = ? AND user_id = ? AND deleted_at IS NULL
        `, [ym, req.userId]);
        monthlyOverview.push({ month: label, gave: Number(row[0].gave), got: Number(row[0].got) });
      }

      const recentTransactions = await query(`
        SELECT t.*, c.name as customer_name
        FROM transactions t
        JOIN customers c ON t.customer_id = c.id AND c.deleted_at IS NULL
        WHERE t.user_id = ? AND t.deleted_at IS NULL
        ORDER BY t.date DESC LIMIT 10
      `, [req.userId]);

      return res.json({
        totalToReceive,
        totalToPay,
        todayCount: Number(todayStats[0].count),
        todayGave: Number(todayStats[0].gave),
        todayGot: Number(todayStats[0].got),
        monthCount: Number(monthStats[0].count),
        monthGave: Number(monthStats[0].gave),
        monthGot: Number(monthStats[0].got),
        topPending,
        overdueCustomers,
        monthlyOverview,
        recentTransactions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  },

  async getEntries(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const entries = await query('SELECT * FROM transactions WHERE user_id = ? AND deleted_at IS NULL', [req.userId]);
      return res.json(entries);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch entries' });
    }
  },

  async restore(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { customers, entries } = req.body;
    if (!customers || !entries) return res.status(400).json({ error: 'Invalid data' });
    const conn = await (await import('../config/db.js')).pool.getConnection();
    try {
      await conn.beginTransaction();
      
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await conn.execute('UPDATE transactions SET deleted_at = ? WHERE user_id = ?', [now, req.userId]);
      await conn.execute('UPDATE customers SET deleted_at = ? WHERE user_id = ?', [now, req.userId]);

      // Note: we might have ID collisions if we simply insert. For real systems, restore logic
      // is usually an append, but doing it the previous way (hard delete + insert)
      // was dangerous. Here, we restore by ignoring collisions or inserting new ones.
      // To strictly adhere to prior system without breaking old backups:
      await conn.execute('DELETE FROM transactions WHERE user_id = ? AND deleted_at IS NOT NULL', [req.userId]);
      await conn.execute('DELETE FROM customers WHERE user_id = ? AND deleted_at IS NOT NULL', [req.userId]);

      for (const c of customers) {
        await conn.execute('INSERT INTO customers (id, user_id, name, mobile) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), mobile=VALUES(mobile), deleted_at=NULL', [c.id, req.userId, c.name, c.mobile || '']);
      }
      for (const t of entries) {
        await conn.execute('INSERT INTO transactions (id, customer_id, user_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=VALUES(type), amount=VALUES(amount), description=VALUES(description), date=VALUES(date), deleted_at=NULL',
          [t.id, t.customer_id, req.userId, t.type, t.amount, t.description || '', t.date]);
      }
      
      await conn.commit();
      return res.json({ success: true });
    } catch (error) {
      await conn.rollback();
      console.error(error);
      return res.status(500).json({ error: 'Restore failed' });
    } finally {
      conn.release();
    }
  }
};
