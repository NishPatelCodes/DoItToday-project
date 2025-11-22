import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaDollarSign, FaWallet, FaTimes, FaCheckCircle, FaChartPie, FaSearch, FaBell, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { format } from 'date-fns';
import { financeAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useScrollLock } from '../hooks/useScrollLock';
import { formatCurrency } from '../utils/currencyFormatter';
import CurrencySelector from './CurrencySelector';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Glassmorphism Card Component
const GlassCard = ({ children, className = '', delay = 0, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className={`
      backdrop-blur-xl bg-white/5 dark:bg-white/5 
      border border-white/10 dark:border-white/10 
      shadow-2xl rounded-2xl
      hover:bg-white/10 dark:hover:bg-white/10 
      hover:border-white/20 hover:shadow-2xl
      hover:translate-y-[-4px]
      transition-all duration-300 ease-out
      ${className}
    `}
    {...props}
  >
    {children}
  </motion.div>
);

// Net Worth Hero Component
const NetWorthHero = ({ netWorth, monthlyIncome, monthlyExpenses, baseCurrency, onPeriodChange, selectedPeriod }) => {
  const periods = [
    { value: '30d', label: '30d' },
    { value: '3m', label: '3m' },
    { value: '6m', label: '6m' },
    { value: '1y', label: '1y' },
  ];

  const maxValue = Math.max(monthlyIncome, monthlyExpenses) || 1;
  const incomePercent = (monthlyIncome / maxValue) * 100;
  const expensePercent = (monthlyExpenses / maxValue) * 100;

  return (
    <GlassCard className="p-4 md:p-6 mb-6 max-h-[160px] md:max-h-[180px] flex flex-col justify-between">
      {/* Net Worth Display */}
      <div className="text-center mb-3 md:mb-4">
        <p className="text-xs md:text-sm text-zinc-100/60 mb-1">Net Worth</p>
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
        >
          {formatCurrency(netWorth, baseCurrency)}
        </motion.h1>
      </div>

      {/* Income vs Expenses Bars */}
      <div className="space-y-2 mb-3">
        {/* Income Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-100/80">Income</span>
            <span className="text-green-400 font-semibold text-xs">{formatCurrency(monthlyIncome, baseCurrency)}</span>
          </div>
          <div className="relative h-6 rounded-lg overflow-hidden bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${incomePercent}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500/80 to-green-400/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Expenses Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-100/80">Expenses</span>
            <span className="text-red-400 font-semibold text-xs">{formatCurrency(monthlyExpenses, baseCurrency)}</span>
          </div>
          <div className="relative h-6 rounded-lg overflow-hidden bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${expensePercent}%` }}
              transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500/80 to-red-400/80 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-center gap-2">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out
              ${selectedPeriod === period.value
                ? 'bg-white/20 text-white shadow-2xl backdrop-blur-sm'
                : 'bg-white/5 text-zinc-100/60 hover:bg-white/10 hover:text-zinc-100/80 hover:border-white/20'
              }
            `}
          >
            {period.label}
          </button>
        ))}
      </div>
    </GlassCard>
  );
};

// Quick Stats Grid Component
const QuickStatsGrid = ({ stats, baseCurrency, delay = 0.1 }) => {
  const statCards = [
    {
      title: 'Total Income',
      value: stats.totalIncome,
      icon: FaArrowUp,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-green-400/10',
    },
    {
      title: 'Total Expenses',
      value: stats.totalExpenses,
      icon: FaArrowDown,
      color: 'text-red-400',
      bgGradient: 'from-red-500/20 to-red-400/10',
    },
    {
      title: 'Savings Rate',
      value: stats.savingsRate,
      suffix: '%',
      icon: FaChartPie,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-blue-400/10',
    },
    {
      title: 'Avg Daily Spend',
      value: stats.avgDailySpend,
      icon: FaWallet,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-purple-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {statCards.map((stat, index) => (
        <GlassCard key={stat.title} delay={delay + index * 0.05} className="p-4 md:p-6">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center mb-3`}>
            <stat.icon className={`text-lg ${stat.color}`} />
          </div>
          <p className="text-xs md:text-sm text-zinc-100/60 mb-1">{stat.title}</p>
          <p className={`text-xl md:text-2xl font-bold text-white ${stat.color}`}>
            {stat.suffix ? `${stat.value}${stat.suffix}` : formatCurrency(stat.value, baseCurrency)}
          </p>
        </GlassCard>
      ))}
    </div>
  );
};

// Cash Flow Chart Component
const CashFlowChart = ({ data, baseCurrency, delay = 0.3 }) => {
  const COLORS = {
    gradientStart: '#8b5cf6',
    gradientEnd: '#3b82f6',
    stroke: '#a78bfa',
  };

  return (
    <GlassCard className="p-6 md:p-8 my-6" delay={delay}>
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Cash Flow Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.gradientStart} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.gradientEnd} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            tickFormatter={(value) => formatCurrency(value, baseCurrency, { useLocale: false })}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              backdropFilter: 'blur(10px)',
            }}
            formatter={(value) => formatCurrency(value, baseCurrency)}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke={COLORS.stroke}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#cashFlowGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};

// Transaction Row Component
const TransactionRow = ({ transaction, baseCurrency, onEdit, onDelete, index }) => {
  const isIncome = transaction.type === 'income';
  const initials = (transaction.description || transaction.category || 'T').substring(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="
        backdrop-blur-xl bg-white/5 dark:bg-white/5
        border border-white/10 dark:border-white/10
        rounded-xl p-4 mb-3
        hover:bg-white/10 dark:hover:bg-white/10
        hover:border-white/20 hover:shadow-2xl
        hover:translate-y-[-4px]
        transition-all duration-300 ease-out
        flex items-center gap-4
      "
    >
      {/* Avatar */}
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold
        ${isIncome ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
      `}>
        {initials}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{transaction.description || transaction.category}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-zinc-100/60">
            {transaction.category}
          </span>
          <span className="text-xs text-zinc-100/40">{format(new Date(transaction.date), 'MMM dd')}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-3">
        <p className={`text-lg font-bold text-white ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount || 0), baseCurrency)}
        </p>
        {onEdit && (
          <button
            onClick={() => onEdit(transaction)}
            className="p-2 text-zinc-100/40 hover:text-zinc-100/80 transition-colors duration-300 ease-out"
          >
            <FaEdit className="text-sm" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(transaction._id)}
            className="p-2 text-zinc-100/40 hover:text-red-400 transition-colors duration-300 ease-out"
          >
            <FaTrash className="text-sm" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Category Breakdown Component
const CategoryBreakdown = ({ transactions, baseCurrency, delay = 0.5 }) => {
  const categoryData = useMemo(() => {
    const categoryTotals = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
      });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
      {/* Horizontal Scrollable Pills */}
      <GlassCard className="p-6" delay={delay}>
        <h2 className="text-xl font-bold text-white mb-4">Category Breakdown</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categoryData.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + index * 0.1 }}
              className="
                backdrop-blur-xl bg-white/10 border border-white/20
                rounded-full px-4 py-2 flex-shrink-0
                hover:bg-white/20 hover:border-white/30 hover:shadow-2xl
                hover:translate-y-[-2px]
                transition-all duration-300 ease-out
              "
            >
              <p className="text-white text-sm font-medium">{cat.name}</p>
              <p className="text-zinc-100/60 text-xs">{cat.percentage.toFixed(0)}%</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Donut Chart */}
      {categoryData.length > 0 && (
        <GlassCard className="p-6" delay={delay + 0.1}>
          <h2 className="text-xl font-bold text-white mb-4">Spending Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                }}
                formatter={(value) => formatCurrency(value, baseCurrency)}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </div>
  );
};

// Floating FAB Component
const FloatingFAB = ({ onClick }) => (
  <motion.button
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="
      fixed bottom-6 right-6 z-50
      w-14 h-14 md:w-16 md:h-16
      backdrop-blur-xl bg-gradient-to-br from-purple-500/80 to-indigo-500/80
      border border-white/20
      rounded-full
      shadow-2xl
      flex items-center justify-center
      text-white text-2xl
      hover:bg-white/10 hover:border-white/30 hover:shadow-2xl
      hover:translate-y-[-4px]
      transition-all duration-300 ease-out
    "
    aria-label="Add transaction"
  >
    <FaPlus />
  </motion.button>
);

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="space-y-6">
    <GlassCard className="p-8 h-64 animate-pulse" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <GlassCard key={i} className="p-6 h-32 animate-pulse" />
      ))}
    </div>
  </div>
);

const FinanceTracker = () => {
  const [finance, setFinance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [setupForm, setSetupForm] = useState({
    accountType: 'checking',
    accountName: 'Primary Account',
    initialBalance: '',
    currency: 'USD',
  });
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const toast = useToast();

  const expenseCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Health & Fitness', 'Education', 'Travel',
    'Gifts & Donations', 'Other',
  ];

  const incomeCategories = [
    'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Rental', 'Other',
  ];

  useEffect(() => {
    if (finance?.accountInfo?.currency) {
      setSelectedCurrency(finance.accountInfo.currency);
    }
  }, [finance]);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const financeRes = await financeAPI.getAll();
      setFinance(financeRes.data);
      setTransactions(financeRes.data?.transactions || []);
      
      if (!financeRes.data?.accountInfo?.isSetupComplete) {
        setShowSetupModal(true);
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = monthlyIncome > 0 
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1)
      : 0;

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const avgDailySpend = monthlyExpenses / daysInMonth;

    return {
      monthlyIncome,
      monthlyExpenses,
      totalIncome,
      totalExpenses,
      savingsRate: parseFloat(savingsRate),
      avgDailySpend,
    };
  }, [transactions]);

  // Calculate net worth
  const netWorth = useMemo(() => {
    if (!finance?.accountInfo) return 0;
    const initialBalance = finance.accountInfo.initialBalance || 0;
    return initialBalance + stats.totalIncome - stats.totalExpenses;
  }, [finance, stats]);

  // Cash flow chart data
  const cashFlowData = useMemo(() => {
    const days = 30;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const income = transactions
        .filter(t => t.type === 'income' && new Date(t.date) <= dayStart)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = transactions
        .filter(t => t.type === 'expense' && new Date(t.date) <= dayStart)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const initialBalance = finance?.accountInfo?.initialBalance || 0;
      
      data.push({
        date: format(date, 'MMM dd'),
        balance: initialBalance + income - expense,
      });
    }
    
    return data;
  }, [transactions, finance]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [transactions]);

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      await financeAPI.setupAccount({
        ...setupForm,
        initialBalance: parseFloat(setupForm.initialBalance) || 0,
      });
      toast.success('Account setup complete!');
      setShowSetupModal(false);
      loadFinanceData();
    } catch (error) {
      toast.error('Failed to setup account');
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await financeAPI.updateTransaction(editingTransaction._id, transactionForm);
        toast.success('Transaction updated');
      } else {
        await financeAPI.addTransaction(transactionForm);
        toast.success('Transaction added');
      }
      setShowTransactionModal(false);
      setEditingTransaction(null);
      setTransactionForm({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      loadFinanceData();
    } catch (error) {
      toast.error('Failed to save transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await financeAPI.deleteTransaction(id);
      toast.success('Transaction deleted');
      loadFinanceData();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
    setShowTransactionModal(true);
  };

  const baseCurrency = finance?.accountInfo?.currency || selectedCurrency;

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-black">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-black pb-24">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Finance</h1>
            <p className="text-zinc-100/60">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
          </div>
          <div className="flex items-center gap-3">
            <CurrencySelector
              value={baseCurrency}
              onChange={(currency) => {
                setSelectedCurrency(currency);
                if (finance?.accountInfo) {
                  financeAPI.updateAccount({ currency }).then(() => loadFinanceData());
                }
              }}
            />
          </div>
        </div>
      </div>

      {finance?.accountInfo?.isSetupComplete ? (
        <>
          {/* Net Worth Hero */}
          <NetWorthHero
            netWorth={netWorth}
            monthlyIncome={stats.monthlyIncome}
            monthlyExpenses={stats.monthlyExpenses}
            baseCurrency={baseCurrency}
            onPeriodChange={setSelectedPeriod}
            selectedPeriod={selectedPeriod}
          />

          {/* Quick Stats */}
          <QuickStatsGrid stats={stats} baseCurrency={baseCurrency} />

          {/* Cash Flow Chart */}
          <CashFlowChart data={cashFlowData} baseCurrency={baseCurrency} />

          {/* Recent Transactions */}
          <GlassCard className="p-6 my-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Recent Transactions</h2>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-100/60">No transactions yet</p>
              </div>
            ) : (
              <div>
                {recentTransactions.map((transaction, index) => (
                  <TransactionRow
                    key={transaction._id || index}
                    transaction={transaction}
                    baseCurrency={baseCurrency}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    index={index}
                  />
                ))}
              </div>
            )}
          </GlassCard>

          {/* Category Breakdown */}
          <CategoryBreakdown transactions={transactions} baseCurrency={baseCurrency} />
        </>
      ) : (
        <GlassCard className="p-8 text-center">
          <p className="text-zinc-100/80 mb-4">Please set up your account to get started</p>
          <button onClick={() => setShowSetupModal(true)} className="btn-primary">
            Setup Account
          </button>
        </GlassCard>
      )}

      {/* Floating FAB */}
      {finance?.accountInfo?.isSetupComplete && (
        <FloatingFAB onClick={() => {
          setEditingTransaction(null);
          setTransactionForm({
            type: 'expense',
            category: '',
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
          });
          setShowTransactionModal(true);
        }} />
      )}

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetupModal && (
          <SetupModal
            isOpen={showSetupModal}
            onClose={() => setShowSetupModal(false)}
            onSave={handleSetup}
            form={setupForm}
            setForm={setSetupForm}
          />
        )}
      </AnimatePresence>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showTransactionModal && (
          <TransactionModal
            isOpen={showTransactionModal}
            onClose={() => {
              setShowTransactionModal(false);
              setEditingTransaction(null);
            }}
            onSave={handleAddTransaction}
            form={transactionForm}
            setForm={setTransactionForm}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            isEditing={!!editingTransaction}
            baseCurrency={baseCurrency}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Setup Modal Component
const SetupModal = ({ isOpen, onClose, onSave, form, setForm }) => {
  // Lock body scroll when modal is open
  useScrollLock(isOpen);
  
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="backdrop-blur-xl bg-white/10 dark:bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Setup Your Account</h2>
          <button onClick={onClose} className="p-2 text-zinc-100/60 hover:text-zinc-100 transition-colors duration-300 ease-out">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-100/80 mb-2">Account Type *</label>
            <select
              value={form.accountType}
              onChange={(e) => setForm({ ...form, accountType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-100/80 mb-2">Account Name *</label>
            <input
              type="text"
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="e.g., Primary Checking Account"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-100/80 mb-2">Initial Balance *</label>
            <input
              type="number"
              step="0.01"
              value={form.initialBalance}
              onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="0.00"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              <FaCheckCircle className="inline mr-2" />
              Complete Setup
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Transaction Modal Component
const TransactionModal = ({ isOpen, onClose, onSave, form, setForm, expenseCategories, incomeCategories, isEditing, baseCurrency }) => {
  // Lock body scroll when modal is open
  useScrollLock(isOpen);
  
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="backdrop-blur-xl bg-white/10 dark:bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-100/60 hover:text-zinc-100 transition-colors duration-300 ease-out">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-100/80 mb-2">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value, category: '' })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-100/80 mb-2">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            >
              <option value="">Select category</option>
              {(form.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-100/80 mb-2">Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-100/80 mb-2">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-100/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-100/80 mb-2">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              {isEditing ? 'Update' : 'Add'} Transaction
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};


// Budget Modal Component
const BudgetModal = ({ isOpen, onClose, onSave, form, setForm, baseCurrency }) => {
  // Lock body scroll when modal is open
  useScrollLock(isOpen);
  
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card p-6 md:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="budget-modal-title" className="text-2xl font-bold text-[var(--text-primary)]">
            Set Monthly Budget
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Monthly Income Budget ({formatCurrency(0, baseCurrency).charAt(0)})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.income}
              onChange={(e) => setForm({ ...form, income: e.target.value })}
              className="input-field"
              placeholder="0.00"
              aria-label="Monthly income budget"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Monthly Expense Budget ({formatCurrency(0, baseCurrency).charAt(0)})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.expenses}
              onChange={(e) => setForm({ ...form, expenses: e.target.value })}
              className="input-field"
              placeholder="0.00"
              aria-label="Monthly expense budget"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Save Budget
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};



export default FinanceTracker;
