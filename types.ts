export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO String YYYY-MM-DD
  note: string;
  ledgerId: string;
  timestamp: number; // For sorting
}

export interface Ledger {
  id: string;
  name: string;
  coverColor: string;
  icon: string;
}

export interface DailyGroup {
  date: string;
  totalIncome: number;
  totalExpense: number;
  transactions: Transaction[];
}

export type ViewState = 'home' | 'stats' | 'ledgers';
