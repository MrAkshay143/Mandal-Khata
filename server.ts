import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './server/db.ts';


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  // Get all customers with their current balance
  app.get('/api/customers', (req, res) => {
    try {
      const customers = db.prepare(`
        SELECT 
          c.*,
          COALESCE(SUM(CASE WHEN t.type = 'GAVE' THEN t.amount ELSE -t.amount END), 0) as balance,
          (SELECT date FROM transactions WHERE customer_id = c.id ORDER BY date DESC LIMIT 1) as last_transaction_date,
          (SELECT description FROM transactions WHERE customer_id = c.id ORDER BY date DESC LIMIT 1) as last_transaction_desc
        FROM customers c
        LEFT JOIN transactions t ON c.id = t.customer_id
        GROUP BY c.id
        ORDER BY last_transaction_date DESC, c.name ASC
      `).all();
      res.json(customers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  });

  // Update a customer
  app.put('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const { name, mobile } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    try {
      db.prepare('UPDATE customers SET name = ?, mobile = ? WHERE id = ?').run(name, mobile || '', id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update customer' });
    }
  });

  // Add a new customer
  app.post('/api/customers', (req, res) => {
    const { name, mobile } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    try {
      const result = db.prepare('INSERT INTO customers (name, mobile) VALUES (?, ?)').run(name, mobile || '');
      res.json({ id: result.lastInsertRowid, name, mobile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create customer' });
    }
  });

  // Update a transaction
  app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { type, amount, description, date } = req.body;
    try {
      db.prepare(`
        UPDATE transactions 
        SET type = ?, amount = ?, description = ?, date = ?
        WHERE id = ?
      `).run(type, amount, description, date, id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  });

  // Delete a transaction
  app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  });

  // Get transactions for a customer
  app.get('/api/transactions/:customerId', (req, res) => {
    const { customerId } = req.params;
    try {
      const transactions = db.prepare(`
        SELECT * FROM transactions 
        WHERE customer_id = ? 
        ORDER BY date ASC
      `).all(customerId);
      
      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
      
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      // Calculate current balance
      const balanceResult = db.prepare(`
        SELECT COALESCE(SUM(CASE WHEN type = 'GAVE' THEN amount ELSE -amount END), 0) as balance
        FROM transactions
        WHERE customer_id = ?
      `).get(customerId);

      const balance = (balanceResult as any).balance;

      res.json({ customer: { ...customer, balance }, transactions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Add a transaction
  app.post('/api/transactions', (req, res) => {
    const { customerId, type, amount, description, date } = req.body;
    
    if (!customerId || !type || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const result = db.prepare(`
        INSERT INTO transactions (customer_id, type, amount, description, date)
        VALUES (?, ?, ?, ?, ?)
      `).run(customerId, type, amount, description || '', date || new Date().toISOString());
      
      res.json({ id: result.lastInsertRowid, ...req.body });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add transaction' });
    }
  });

  // Get summary
  app.get('/api/summary', (req, res) => {
    try {
      const totalGiven = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GAVE'").get();
      const totalGot = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'GOT'").get();
      
      // Today's entries
      const today = new Date().toISOString().split('T')[0];
      const todayEntries = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE date(date) = ?
      `).get(today);

      // This month's entries
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const monthEntries = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE date(date) >= ?
      `).get(startOfMonth);

      res.json({
        totalReceive: (totalGiven as any).total - (totalGot as any).total, // Net balance (positive means I receive)
        totalPay: 0, // Usually 0 unless I owe more than they owe me globally? 
                     // Or maybe sum of negative balances vs sum of positive balances?
                     // Let's refine: 
                     // "Total You Will Receive" = Sum of positive balances
                     // "Total You Need To Pay" = Sum of negative balances (absolute value)
        
        todayEntries,
        monthEntries
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  });
  
  // Enhanced Dashboard API
  app.get('/api/dashboard', (req, res) => {
      try {
        const customers = db.prepare(`
            SELECT 
              c.id, c.name,
              COALESCE(SUM(CASE WHEN t.type = 'GAVE' THEN t.amount ELSE -t.amount END), 0) as balance,
              MAX(t.date) as last_transaction_date
            FROM customers c
            LEFT JOIN transactions t ON c.id = t.customer_id
            GROUP BY c.id
        `).all() as any[];

        let totalToReceive = 0;
        let totalToPay = 0;
        customers.forEach((c: any) => {
            if (c.balance > 0) totalToReceive += c.balance;
            else totalToPay += Math.abs(c.balance);
        });

        // Top 5 pending customers (highest absolute balance)
        const topPending = [...customers]
          .filter((c: any) => c.balance !== 0)
          .sort((a: any, b: any) => Math.abs(b.balance) - Math.abs(a.balance))
          .slice(0, 5)
          .map((c: any) => ({ id: c.id, name: c.name, balance: c.balance }));

        // 30-days overdue (positive balance, no transaction in 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const overdueCustomers = customers.filter((c: any) => {
          if (c.balance <= 0) return false;
          if (!c.last_transaction_date) return true;
          return new Date(c.last_transaction_date) < thirtyDaysAgo;
        }).map((c: any) => ({ id: c.id, name: c.name, balance: c.balance, lastDate: c.last_transaction_date }));

        // Today stats
        const today = new Date().toISOString().split('T')[0];
        const todayStats = db.prepare(`
            SELECT COUNT(*) as count,
              COALESCE(SUM(CASE WHEN type='GAVE' THEN amount ELSE 0 END), 0) as gave,
              COALESCE(SUM(CASE WHEN type='GOT' THEN amount ELSE 0 END), 0) as got
            FROM transactions WHERE date(date) = ?
        `).get(today) as any;

        // Month stats
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthStats = db.prepare(`
            SELECT COUNT(*) as count,
              COALESCE(SUM(CASE WHEN type='GAVE' THEN amount ELSE 0 END), 0) as gave,
              COALESCE(SUM(CASE WHEN type='GOT' THEN amount ELSE 0 END), 0) as got
            FROM transactions WHERE strftime('%Y-%m', date) = ?
        `).get(currentMonth) as any;

        // Monthly overview (last 6 months)
        const monthlyOverview = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const ym = d.toISOString().slice(0, 7);
          const label = d.toLocaleString('default', { month: 'short' });
          const row = db.prepare(`
            SELECT 
              COALESCE(SUM(CASE WHEN type='GAVE' THEN amount ELSE 0 END), 0) as gave,
              COALESCE(SUM(CASE WHEN type='GOT' THEN amount ELSE 0 END), 0) as got
            FROM transactions WHERE strftime('%Y-%m', date) = ?
          `).get(ym) as any;
          monthlyOverview.push({ month: label, gave: row.gave, got: row.got });
        }

        // Recent 10 transactions
        const recentTransactions = db.prepare(`
            SELECT t.*, c.name as customer_name
            FROM transactions t
            JOIN customers c ON t.customer_id = c.id
            ORDER BY t.date DESC LIMIT 10
        `).all();

        res.json({
            totalToReceive,
            totalToPay,
            todayCount: todayStats.count,
            todayGave: todayStats.gave,
            todayGot: todayStats.got,
            monthCount: monthStats.count,
            monthGave: monthStats.gave,
            monthGot: monthStats.got,
            topPending,
            overdueCustomers,
            monthlyOverview,
            recentTransactions,
        });

      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to fetch dashboard data' });
      }
  });

  // Get all entries for backup
  app.get('/api/entries', (req, res) => {
    try {
      const entries = db.prepare('SELECT * FROM transactions').all();
      res.json(entries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch entries' });
    }
  });

  // Restore data
  app.post('/api/restore', (req, res) => {
    const { customers, entries } = req.body;
    if (!customers || !entries) return res.status(400).json({ error: 'Invalid data' });

    try {
      const transaction = db.transaction(() => {
        // Clear existing data
        db.prepare('DELETE FROM transactions').run();
        db.prepare('DELETE FROM customers').run();

        // Insert customers
        const insertCustomer = db.prepare('INSERT INTO customers (id, name, mobile) VALUES (?, ?, ?)');
        for (const c of customers) {
          insertCustomer.run(c.id, c.name, c.mobile || '');
        }

        // Insert transactions
        const insertTransaction = db.prepare('INSERT INTO transactions (id, customer_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)');
        for (const t of entries) {
          insertTransaction.run(t.id, t.customer_id, t.type, t.amount, t.description || '', t.date);
        }
      });

      transaction();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Restore failed' });
    }
  });


  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production (if needed, but usually handled by build output)
    // For this environment, we rely on Vite middleware mostly, but good to have placeholder
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
