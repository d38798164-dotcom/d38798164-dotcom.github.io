import React from 'react';
import { 
  Utensils, Bus, ShoppingBag, Home, Gamepad2, 
  HeartPulse, GraduationCap, Banknote, Briefcase, 
  Gift, Coffee, Cat, Wallet, PiggyBank, CreditCard
} from 'lucide-react';
import { Category, Ledger } from './types';

// Icon Map
export const Icons: Record<string, React.ElementType> = {
  Utensils, Bus, ShoppingBag, Home, Gamepad2, 
  HeartPulse, GraduationCap, Banknote, Briefcase, 
  Gift, Coffee, Cat, Wallet, PiggyBank, CreditCard
};

export const DEFAULT_LEDGERS: Ledger[] = [
  { id: 'l1', name: '日常账本', coverColor: 'bg-rose-400', icon: 'Cat' },
  { id: 'l2', name: '旅游基金', coverColor: 'bg-sky-400', icon: 'Bus' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense
  { id: 'c1', name: '餐饮', icon: 'Utensils', type: 'expense', color: 'bg-orange-400' },
  { id: 'c2', name: '交通', icon: 'Bus', type: 'expense', color: 'bg-blue-400' },
  { id: 'c3', name: '购物', icon: 'ShoppingBag', type: 'expense', color: 'bg-pink-400' },
  { id: 'c4', name: '居住', icon: 'Home', type: 'expense', color: 'bg-indigo-400' },
  { id: 'c5', name: '娱乐', icon: 'Gamepad2', type: 'expense', color: 'bg-purple-400' },
  { id: 'c6', name: '医疗', icon: 'HeartPulse', type: 'expense', color: 'bg-red-400' },
  { id: 'c7', name: '学习', icon: 'GraduationCap', type: 'expense', color: 'bg-teal-400' },
  { id: 'c8', name: '零食', icon: 'Coffee', type: 'expense', color: 'bg-amber-400' },
  // Income
  { id: 'c9', name: '工资', icon: 'Briefcase', type: 'income', color: 'bg-emerald-500' },
  { id: 'c10', name: '兼职', icon: 'Banknote', type: 'income', color: 'bg-lime-500' },
  { id: 'c11', name: '理财', icon: 'PiggyBank', type: 'income', color: 'bg-yellow-500' },
  { id: 'c12', name: '红包', icon: 'Gift', type: 'income', color: 'bg-rose-500' },
];
