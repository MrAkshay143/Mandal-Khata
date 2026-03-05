import { query, pool } from '../config/db.js';
import { PaginationParams } from '../types/globalTypes.js';

export const customerModel = {
  async findAllByUser(userId: number, pagination: PaginationParams) {
    return await query(`
      SELECT 
        c.*,
        COALESCE(SUM(CASE WHEN t.type = 'GAVE' THEN t.amount ELSE -t.amount END), 0) as balance,
        (SELECT date FROM transactions WHERE customer_id = c.id AND deleted_at IS NULL ORDER BY date DESC LIMIT 1) as last_transaction_date,
        (SELECT description FROM transactions WHERE customer_id = c.id AND deleted_at IS NULL ORDER BY date DESC LIMIT 1) as last_transaction_desc
      FROM customers c
      LEFT JOIN transactions t ON c.id = t.customer_id AND t.deleted_at IS NULL
      WHERE c.user_id = ? AND c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY last_transaction_date DESC, c.name ASC
      LIMIT ? OFFSET ?
    `, [userId, pagination.limit, pagination.offset]);
  },

  async findById(id: number, userId: number) {
    const customers = await query(
      'SELECT * FROM customers WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [id, userId]
    );
    return customers.length > 0 ? customers[0] : null;
  },

  async create(userId: number, customer: { name: string; mobile?: string }) {
    const result: any = await query(
      'INSERT INTO customers (user_id, name, mobile) VALUES (?, ?, ?)',
      [userId, customer.name, customer.mobile || '']
    );
    return result;
  },

  async update(id: number, userId: number, customer: { name: string; mobile?: string }) {
    await query(
      'UPDATE customers SET name = ?, mobile = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [customer.name, customer.mobile || '', id, userId]
    );
  },

  async softDelete(id: number, userId: number) {
    // We soft-delete the customer and all their transactions
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      await conn.query('UPDATE transactions SET deleted_at = ? WHERE customer_id = ? AND user_id = ?', [now, id, userId]);
      await conn.query('UPDATE customers SET deleted_at = ? WHERE id = ? AND user_id = ?', [now, id, userId]);
      
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
};
