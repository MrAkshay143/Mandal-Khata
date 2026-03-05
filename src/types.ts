export interface Customer {
  id: number;
  name: string;
  mobile?: string;
  balance: number; // Positive: They owe me (Green). Negative: I owe them (Red).
  last_transaction_date?: string;
  last_transaction_desc?: string;
}

export interface Transaction {
  id: number;
  customer_id: number;
  type: 'GAVE' | 'GOT';
  amount: number;
  description?: string;
  date: string;
  created_at: string;
}

export interface DashboardStats {
  totalToReceive: number;
  totalToPay: number;
  todayCount: number;
  monthCount: number;
}
