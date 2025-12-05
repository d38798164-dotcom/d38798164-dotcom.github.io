import React from 'react';
import { Icons } from '../constants';

// --- Icon Helper ---
export const IconView: React.FC<{ name: string; className?: string; size?: number }> = ({ name, className, size = 20 }) => {
  const IconComponent = Icons[name] || Icons.Cat;
  return <IconComponent className={className} size={size} />;
};

// --- Buttons ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseStyles = "transition-all active:scale-95 flex items-center justify-center font-bold";
  
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-rose-200 rounded-full py-3 px-6 hover:bg-rose-500",
    secondary: "bg-white text-text border-2 border-rose-100 rounded-full py-2 px-4 hover:border-rose-200",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 rounded-xl p-2",
    icon: "p-2 rounded-full hover:bg-black/5"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Cards ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-rose-50 p-4 ${className}`}>
    {children}
  </div>
);

// --- Layout Wrapper ---
export const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-background w-full flex justify-center">
    <div className="w-full max-w-md bg-background shadow-2xl relative flex flex-col h-screen overflow-hidden">
      {children}
    </div>
  </div>
);

// --- Money Formatter ---
export const formatMoney = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
