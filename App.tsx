import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Calendar as CalendarIcon, PieChart, 
  WalletCards, Settings, ChevronLeft, ChevronRight,
  Trash2, X, Check
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { Transaction, Ledger, Category, TransactionType, ViewState, DailyGroup } from './types';
import { StorageService } from './services/storage';
import { DEFAULT_CATEGORIES } from './constants';
import { MobileLayout, Card, Button, IconView, formatMoney } from './components/Components';

// --- Sub-components defined here for cohesion within the single-file request limit structure ---

const BottomNav: React.FC<{ current: ViewState; onChange: (v: ViewState) => void; onAdd: () => void }> = ({ current, onChange, onAdd }) => (
  <div className="bg-white/90 backdrop-blur-md border-t border-rose-100 h-20 flex justify-around items-center px-4 absolute bottom-0 w-full z-10 pb-2">
    <button onClick={() => onChange('home')} className={`flex flex-col items-center p-2 ${current === 'home' ? 'text-primary' : 'text-gray-400'}`}>
      <WalletCards size={24} />
      <span className="text-xs mt-1 font-medium">明细</span>
    </button>
    
    <div className="relative -top-5">
      <button 
        onClick={onAdd}
        className="w-16 h-16 bg-primary rounded-full shadow-lg shadow-rose-300 flex items-center justify-center text-white active:scale-90 transition-transform ring-4 ring-white"
      >
        <Plus size={32} />
      </button>
    </div>

    <button onClick={() => onChange('stats')} className={`flex flex-col items-center p-2 ${current === 'stats' ? 'text-primary' : 'text-gray-400'}`}>
      <PieChart size={24} />
      <span className="text-xs mt-1 font-medium">统计</span>
    </button>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  // State
  const [view, setView] = useState<ViewState>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeLedgerId, setActiveLedgerId] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Date Filter State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load Initial Data
  useEffect(() => {
    setTransactions(StorageService.getTransactions());
    setLedgers(StorageService.getLedgers());
    setCategories(StorageService.getCategories());
    setActiveLedgerId(StorageService.getActiveLedgerId());
  }, []);

  // Save Effects
  useEffect(() => {
    if (transactions.length > 0) StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    if (activeLedgerId) StorageService.setActiveLedgerId(activeLedgerId);
  }, [activeLedgerId]);

  // Derived Data
  const currentLedger = ledgers.find(l => l.id === activeLedgerId) || ledgers[0];
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return t.ledgerId === activeLedgerId && 
             tDate.getMonth() === currentDate.getMonth() &&
             tDate.getFullYear() === currentDate.getFullYear();
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, activeLedgerId, currentDate]);

  // Calculate Monthly Stats
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  // Calculate Total Assets (Global Balance for current Ledger)
  const totalBalance = useMemo(() => {
    return transactions
      .filter(t => t.ledgerId === activeLedgerId)
      .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [transactions, activeLedgerId]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, DailyGroup> = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) {
        groups[t.date] = { date: t.date, totalIncome: 0, totalExpense: 0, transactions: [] };
      }
      groups[t.date].transactions.push(t);
      if (t.type === 'income') groups[t.date].totalIncome += t.amount;
      else groups[t.date].totalExpense += t.amount;
    });
    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTransactions]);

  // Handlers
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'timestamp' | 'ledgerId'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Date.now().toString(),
      timestamp: Date.now(),
      ledgerId: activeLedgerId
    };
    setTransactions(prev => [tx, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  // --- Views ---

  const renderHome = () => (
    <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
      {/* Header */}
      <div className="bg-gradient-to-b from-rose-100 to-background pt-12 pb-6 px-6 rounded-b-[3rem]">
        {/* Ledger Switcher */}
        <div className="flex justify-between items-center mb-6">
          <div 
            className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/80 transition"
            onClick={() => setView('ledgers')}
          >
            <div className={`p-1.5 rounded-full text-white ${currentLedger?.coverColor || 'bg-gray-400'}`}>
              <IconView name={currentLedger?.icon || 'Cat'} size={14} />
            </div>
            <span className="text-sm font-bold text-gray-700">{currentLedger?.name || '默认账本'}</span>
            <ChevronRight size={14} className="text-gray-500" />
          </div>
          <div className="text-sm font-medium text-gray-500 bg-white/60 px-3 py-1.5 rounded-full flex items-center gap-2">
            <button onClick={() => changeMonth(-1)}><ChevronLeft size={16} /></button>
            <span>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</span>
            <button onClick={() => changeMonth(1)}><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-1">本月结余</p>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            <span className="text-2xl mr-1">¥</span>{formatMoney(stats.balance)}
          </h1>
          
          {/* Total Assets / Savings Display */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-2xl flex items-center gap-2 shadow-sm text-gray-600 border border-white/40">
              <div className="bg-yellow-100 p-1 rounded-full text-yellow-500">
                 <IconView name="PiggyBank" size={14} />
              </div>
              <span className="text-xs font-medium">总资产</span>
              <span className="text-sm font-bold text-gray-800">¥{formatMoney(totalBalance)}</span>
            </div>
          </div>

          <div className="flex justify-center gap-8">
            <div className="text-left">
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div> 收入
              </div>
              <p className="font-bold text-lg text-gray-700">{formatMoney(stats.income)}</p>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                <div className="w-2 h-2 rounded-full bg-rose-400"></div> 支出
              </div>
              <p className="font-bold text-lg text-gray-700">{formatMoney(stats.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-4 mt-4 space-y-4">
        {groupedTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <IconView name="Cat" size={48} className="mx-auto mb-2 opacity-50" />
            <p>这个月还没有记录喵 ~</p>
          </div>
        ) : (
          groupedTransactions.map(group => (
            <div key={group.date}>
              <div className="flex justify-between items-end px-2 mb-2 text-xs text-gray-400 font-medium">
                <span>{group.date}</span>
                <span>
                   收 {group.totalIncome > 0 ? formatMoney(group.totalIncome) : '0.00'} &nbsp; 
                   支 {group.totalExpense > 0 ? formatMoney(group.totalExpense) : '0.00'}
                </span>
              </div>
              <Card className="p-0 overflow-hidden">
                {group.transactions.map((t, idx) => {
                  const cat = categories.find(c => c.id === t.categoryId);
                  return (
                    <div 
                      key={t.id} 
                      className={`flex items-center justify-between p-4 ${idx !== group.transactions.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors cursor-pointer group`}
                      onClick={() => handleDeleteTransaction(t.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${cat?.color || 'bg-gray-300'}`}>
                          <IconView name={cat?.icon || 'HelpCircle'} size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-700">{cat?.name || '未知'}</p>
                          {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
                        </div>
                      </div>
                      <div className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-gray-800'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderStats = () => {
    // Calculate category totals for pie chart
    const dataMap: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      dataMap[t.categoryId] = (dataMap[t.categoryId] || 0) + t.amount;
    });
    
    const data = Object.entries(dataMap).map(([catId, value]) => {
      const cat = categories.find(c => c.id === catId);
      return { name: cat?.name || 'Unknown', value, color: cat?.color.replace('bg-', '') || 'gray-400' };
    }).sort((a, b) => b.value - a.value);

    // Map tailwind colors to hex for Recharts (simplified mapping)
    const COLORS = ['#fb7185', '#38bdf8', '#f472b6', '#818cf8', '#a78bfa', '#34d399', '#fbbf24'];

    return (
      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar bg-white">
        <div className="pt-12 px-6 pb-6">
          <h2 className="text-2xl font-bold mb-6">收支统计</h2>
          
          <div className="bg-rose-50 rounded-3xl p-6 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">本月总支出</p>
              <p className="text-3xl font-bold text-gray-800">¥{formatMoney(stats.expense)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">本月总收入</p>
              <p className="text-xl font-bold text-emerald-500">+¥{formatMoney(stats.income)}</p>
            </div>
          </div>

          {data.length > 0 ? (
            <>
              <div className="h-64 w-full mb-8 relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-gray-400 text-sm font-medium">支出分布</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 mb-2">排行榜</h3>
                {data.map((item, idx) => {
                   const percent = (item.value / stats.expense) * 100;
                   return (
                     <div key={idx} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                           {idx + 1}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-700">{item.name}</p>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }}></div>
                            </div>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-sm font-bold text-gray-800">{formatMoney(item.value)}</p>
                         <p className="text-xs text-gray-400">{percent.toFixed(1)}%</p>
                       </div>
                     </div>
                   );
                })}
              </div>
            </>
          ) : (
             <div className="text-center py-20 text-gray-400">
               <p>本月没有支出数据哦</p>
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderLedgers = () => (
    <div className="flex-1 bg-gray-50 p-6 pt-12">
      <div className="flex items-center mb-8">
        <button onClick={() => setView('home')} className="p-2 -ml-2 text-gray-600">
           <ChevronLeft />
        </button>
        <h2 className="text-2xl font-bold ml-2">我的账本</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ledgers.map(l => (
          <div 
            key={l.id}
            onClick={() => {
              setActiveLedgerId(l.id);
              setView('home');
            }}
            className={`relative overflow-hidden p-6 rounded-3xl cursor-pointer transition-transform active:scale-95 ${l.id === activeLedgerId ? 'ring-4 ring-rose-200' : ''} bg-white shadow-sm`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${l.coverColor} opacity-20 rounded-bl-full -mr-4 -mt-4`}></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${l.coverColor} flex items-center justify-center text-white shadow-md`}>
                <IconView name={l.icon} size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{l.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{l.id === activeLedgerId ? '当前使用中' : '点击切换'}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add Ledger Placeholder (Non-functional for demo brevity) */}
        <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-400 gap-2 cursor-pointer hover:bg-gray-100/50">
           <Plus size={32} />
           <span className="text-sm">新建账本</span>
        </div>
      </div>
    </div>
  );

  return (
    <MobileLayout>
      {view === 'home' && renderHome()}
      {view === 'stats' && renderStats()}
      {view === 'ledgers' && renderLedgers()}
      
      {view !== 'ledgers' && (
        <BottomNav 
          current={view} 
          onChange={setView} 
          onAdd={() => setIsAddModalOpen(true)} 
        />
      )}

      {isAddModalOpen && (
        <AddTransactionModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={handleAddTransaction}
          categories={categories}
        />
      )}
    </MobileLayout>
  );
};

// --- Add Transaction Modal (Complex Component) ---

interface AddTransactionProps {
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'timestamp' | 'ledgerId'>) => void;
  categories: Category[];
}

const AddTransactionModal: React.FC<AddTransactionProps> = ({ onClose, onSave, categories }) => {
  const [amount, setAmount] = useState('0');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Set default category when type changes
  useEffect(() => {
    const firstCat = categories.find(c => c.type === type);
    if (firstCat) setSelectedCatId(firstCat.id);
  }, [type, categories]);

  const handleNumPad = (val: string) => {
    if (val === 'backspace') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (val === '.') {
      if (!amount.includes('.')) setAmount(prev => prev + '.');
    } else {
      setAmount(prev => prev === '0' ? val : prev + val);
    }
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) return;
    onSave({
      amount: numAmount,
      type,
      categoryId: selectedCatId,
      date,
      note
    });
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-t-[2rem] h-[85vh] flex flex-col w-full shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={24} /></button>
          <div className="flex bg-gray-100 rounded-full p-1">
             <button 
                onClick={() => setType('expense')}
                className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-400'}`}
             >支出</button>
             <button 
                onClick={() => setType('income')}
                className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-400'}`}
             >收入</button>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Amount Display */}
        <div className="px-6 py-4 text-right">
           <div className="text-xs text-gray-400 mb-1">金额</div>
           <div className="text-4xl font-bold text-gray-800 tracking-wider">
             {type === 'expense' ? '-' : '+'}{amount}
           </div>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
          <div className="grid grid-cols-4 gap-4 mb-4">
            {filteredCategories.map(cat => (
              <div 
                key={cat.id} 
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => setSelectedCatId(cat.id)}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${selectedCatId === cat.id ? `${cat.color} text-white scale-110 shadow-lg` : 'bg-gray-100 text-gray-400'}`}>
                   <IconView name={cat.icon} size={24} />
                </div>
                <span className={`text-xs ${selectedCatId === cat.id ? 'font-bold text-gray-800' : 'text-gray-400'}`}>{cat.name}</span>
              </div>
            ))}
          </div>
          
          {/* Note & Date */}
          <div className="flex gap-3 mt-4 px-2">
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2">
               <span className="text-gray-400 text-sm">备注</span>
               <input 
                 type="text" 
                 className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-300" 
                 placeholder="点击输入..."
                 value={note}
                 onChange={(e) => setNote(e.target.value)}
               />
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-gray-600 relative">
               <CalendarIcon size={16} />
               <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="bg-transparent outline-none w-24 text-center z-10"
               />
            </div>
          </div>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-4 bg-gray-50 p-2 gap-1 pb-6">
          {['1','2','3','DEL', '4','5','6', 'OK', '7','8','9', '0', '.'].map((key, idx) => {
             // Custom layout logic for grid
             if (key === 'OK') {
               return (
                 <button 
                    key={key} 
                    onClick={handleConfirm}
                    className="row-span-3 bg-primary text-white rounded-2xl text-lg font-bold shadow-lg shadow-rose-200 active:scale-95 transition-transform flex flex-col items-center justify-center gap-1"
                    style={{ gridColumn: '4', gridRow: '2 / 5' }}
                 >
                    <Check size={28} />
                    <span className="text-xs">完成</span>
                 </button>
               );
             }
             if (key === 'DEL') {
               return (
                 <button key={key} onClick={() => handleNumPad('backspace')} className="bg-white rounded-xl py-4 shadow-sm active:bg-gray-100 text-gray-500 font-bold flex justify-center items-center">
                   <IconView name="Delete" className="hidden" /> {/* Placeholder */}
                   ←
                 </button>
               )
             }
             
             let gridClass = "bg-white rounded-xl py-4 shadow-sm active:bg-gray-100 text-xl font-bold text-gray-700";
             if(key === '0') gridClass += " col-span-2";
             
             return (
               <button 
                 key={key} 
                 onClick={() => handleNumPad(key)} 
                 className={gridClass}
               >
                 {key}
               </button>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;