import { query } from '../config/db.js';
import { PaginationParams } from '../types/globalTypes.js';

export const transactionModel = {
  async findAllByCustomer(customerId: number, userId: number, pagination: PaginationParams) {
    return await query(`
      SELECT * FROM transactions 
      WHERE customer_id = ? AND user_id = ? AND deleted_at IS NULL 
      ORDER BY date ASC
      LIMIT ? OFFSET ?
    `, [customerId, userId, pagination.limit, pagination.offset]);
  },

  async getCustomerBalance(customerId: number, userId: number) {
    const balResult = await query(
      `SELECT COALESCE(SUM(CASE WHEN type = 'GAVE' THEN amount ELSE -amount END), 0) as balance 
       FROM transactions WHERE customer_id = ? AND user_id = ? AND deleted_at IS NULL`,
      [customerId, userId]
    );
    return Number(balResult[0]?.balance || 0);
  },

  async create(userId: number, transaction: any) {
    const { customerId, type, amount, description, date } = transaction;
    const result: any = await query(
      'INSERT INTO transactions (customer_id, user_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [customerId, userId, type, amount, description || '', date || new Date().toISOString()]
    );
    return result;
  },

  async update(id: number, userId: number, transaction: any) {
    const { type, amount, description, date } = transaction;
    await query(
      'UPDATE transactions SET type = ?, amount = ?, description = ?, date = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [type, amount, description, date, id, userId]
    );
  },

  async softDelete(id: number, userId: number) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await query('UPDATE transactions SET deleted_at = ? WHERE id = ? AND user_id = ?', [now, id, userId]);
  },
  
  async getSummary(userId: number, today: string, startOfMonth: string) {
    const totalGiven = await query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GAVE' AND user_id = ? AND deleted_at IS NULL", [userId]);
    const totalGot = await query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GOT' AND user_id = ? AND deleted_at IS NULL", [userId]);
    const todayEntries = await query(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE DATE(date) = ? AND user_id = ? AND deleted_at IS NULL",
      [today, userId]
    );
    const monthEntries = await query(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM transactions WHERE DATE(date) >= ? AND user_id = ? AND deleted_at IS NULL",
      [startOfMonth, userId]
    );

    return {
      totalReceive: Number(totalGiven[0].total) - Number(totalGot[0].total),
      totalPay: 0,
      todayEntries: todayEntries[0],
      monthEntries: monthEntries[0],
    };
  }
};
