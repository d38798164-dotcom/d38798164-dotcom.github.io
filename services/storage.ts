import { Transaction, Ledger, Category } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_LEDGERS } from '../constants';

const KEYS = {
  TRANSACTIONS: 'miao_transactions',
  LEDGERS: 'miao_ledgers',
  CATEGORIES: 'miao_categories',
  ACTIVE_LEDGER: 'miao_active_ledger',
};

export const StorageService = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveTransactions: (data: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data));
  },

  getLedgers: (): Ledger[] => {
    const data = localStorage.getItem(KEYS.LEDGERS);
    return data ? JSON.parse(data) : DEFAULT_LEDGERS;
  },

  saveLedgers: (data: Ledger[]) => {
    localStorage.setItem(KEYS.LEDGERS, JSON.stringify(data));
  },

  getCategories: (): Category[] => {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  },

  getActiveLedgerId: (): string => {
    return localStorage.getItem(KEYS.ACTIVE_LEDGER) || DEFAULT_LEDGERS[0].id;
  },

  setActiveLedgerId: (id: string) => {
    localStorage.setItem(KEYS.ACTIVE_LEDGER, id);
  }
};
