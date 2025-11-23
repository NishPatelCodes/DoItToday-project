import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaDollarSign,
  FaWallet,
  FaTimes,
  FaCheckCircle,
  FaChartPie,
  FaSearch,
  FaBell,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaPiggyBank,
  FaCreditCard,
  FaLightbulb,
  FaCalendarAlt,
} from 'react-icons/fa';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { financeAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useScrollLock } from '../hooks/useScrollLock';
import { formatCurrency } from '../utils/currencyFormatter';
import CurrencySelector from './CurrencySelector';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Animated Number Component
const AnimatedNumber = ({ value, duration = 1.5, decimals = 0, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, mobileOnly = true }) => {
  const [isOpen, setIsOpen] = useState(!mobileOnly || !defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const shouldCollapse = mobileOnly && isMobile;

  if (!shouldCollapse) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-lg text-[var(--accent-primary)]" />}
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FaArrowDown className="text-sm text-[var(--text-secondary)]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0, trend, trendValue, className = '', formatter }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md md:shadow-lg backdrop-blur-sm border transition-all duration-300 ${className}`}
      style={{
        background: gradient || 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className="p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-sm transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              <Icon className="text-base md:text-xl text-[var(--accent-primary)]" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)]">{title}</p>
              {trend && (
                <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                  {trend === 'up' ? (
                    <FaArrowUp className="text-green-500 text-xs" />
                  ) : (
                    <FaArrowDown className="text-red-500 text-xs" />
                  )}
                  <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trendValue}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-1 md:mt-2">
          <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {formatter ? formatter(value) : <AnimatedNumber value={value} decimals={0} />}
          </p>
          {subtitle && (
            <p className="text-xs md:text-sm text-[var(--text-tertiary)] mt-0.5 md:mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      <div
        className="hidden md:block absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        }}
      />
      <div
        className="hidden md:block absolute bottom-0 left-0 w-24 h-24 rounded-full -ml-12 -mb-12 opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
};

// Circular Progress Component
const CircularProgress = ({ value, max = 100, size = 120, strokeWidth = 8, color = '#6366f1', label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;
  const mobileSize = size < 120 ? size : 100;
  const mobileStrokeWidth = strokeWidth < 8 ? strokeWidth : 6;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90 w-full h-auto max-w-[100px] md:max-w-none">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-[var(--bg-tertiary)]"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg md:text-2xl font-bold text-[var(--text-primary)]">{Math.round(value)}%</p>
          {label && <p className="text-[10px] md:text-xs text-[var(--text-tertiary)] mt-0.5 md:mt-1">{label}</p>}
        </div>
      </div>
    </div>
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
      <div
        className={`
        w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold
        ${isIncome ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
      `}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{transaction.description || transaction.category}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-zinc-100/60">
            {transaction.category}
          </span>
          <span className="text-xs text-zinc-100/40">{format(new Date(transaction.date), 'MMM dd')}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p className={`text-lg font-bold text-white ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
          {isIncome ? '+' : '-'}
          {formatCurrency(Math.abs(transaction.amount || 0), baseCurrency)}
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
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Health & Fitness',
    'Education',
    'Travel',
    'Gifts & Donations',
    'Other',
  ];

  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Rental', 'Other'];

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
    const startOfMonthDate = startOfMonth(now);
    const endOfMonthDate = endOfMonth(now);

    const monthlyIncome = transactions
      .filter((t) => t.type === 'income' && new Date(t.date) >= startOfMonthDate && new Date(t.date) <= endOfMonthDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter(
        (t) => t.type === 'expense' && new Date(t.date) >= startOfMonthDate && new Date(t.date) <= endOfMonthDate
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0;

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const avgDailySpend = monthlyExpenses / daysInMonth;

    // Calculate trends (compare with previous period)
    const prevMonthStart = startOfMonth(subDays(now, 30));
    const prevMonthEnd = endOfMonth(subDays(now, 30));
    const prevMonthlyIncome = transactions
      .filter((t) => t.type === 'income' && new Date(t.date) >= prevMonthStart && new Date(t.date) <= prevMonthEnd)
      .reduce((sum, t) => sum + t.amount, 0);
    const prevMonthlyExpenses = transactions
      .filter((t) => t.type === 'expense' && new Date(t.date) >= prevMonthStart && new Date(t.date) <= prevMonthEnd)
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeTrend = prevMonthlyIncome > 0 ? ((monthlyIncome - prevMonthlyIncome) / prevMonthlyIncome * 100).toFixed(1) : 0;
    const expenseTrend = prevMonthlyExpenses > 0 ? ((monthlyExpenses - prevMonthlyExpenses) / prevMonthlyExpenses * 100).toFixed(1) : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      totalIncome,
      totalExpenses,
      savingsRate: parseFloat(savingsRate),
      avgDailySpend,
      incomeTrend: parseFloat(incomeTrend),
      expenseTrend: parseFloat(expenseTrend),
    };
  }, [transactions]);

  // Calculate net worth
  const netWorth = useMemo(() => {
    if (!finance?.accountInfo) return 0;
    const initialBalance = finance.accountInfo.initialBalance || 0;
    return initialBalance + stats.totalIncome - stats.totalExpenses;
  }, [finance, stats]);

  // Income vs Expenses chart data (monthly)
  const incomeExpensesData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = subDays(now, i * 30);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const income = transactions
        .filter((t) => t.type === 'income' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter((t) => t.type === 'expense' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      months.push({
        month: format(monthDate, 'MMM'),
        income,
        expenses,
      });
    }
    return months;
  }, [transactions]);

  // Cash flow chart data (daily for last 30 days)
  const cashFlowData = useMemo(() => {
    const days = 30;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const income = transactions
        .filter((t) => t.type === 'income' && new Date(t.date) >= dayStart && new Date(t.date) <= dayEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions
        .filter((t) => t.type === 'expense' && new Date(t.date) >= dayStart && new Date(t.date) <= dayEnd)
        .reduce((sum, t) => sum + t.amount, 0);

      const initialBalance = finance?.accountInfo?.initialBalance || 0;
      const previousBalance = i === days - 1 ? initialBalance : data[data.length - 1]?.balance || initialBalance;
      const balance = previousBalance + income - expense;

      data.push({
        date: format(date, 'MMM dd'),
        income,
        expense,
        balance,
      });
    }

    return data;
  }, [transactions, finance]);

  // Weekly spending trend
  const weeklySpendingData = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekDate = subDays(now, i * 7);
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 0 });
      const spending = transactions
        .filter((t) => t.type === 'expense' && new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      weeks.push({
        week: format(weekStart, 'MMM dd'),
        spending,
      });
    }
    return weeks;
  }, [transactions]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categoryTotals = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
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

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  }, [transactions]);

  // Financial insights
  const insights = useMemo(() => {
    const insightsList = [];
    if (stats.savingsRate > 20) {
      insightsList.push(`Excellent savings rate of ${stats.savingsRate.toFixed(1)}%! Keep it up!`);
    } else if (stats.savingsRate < 0) {
      insightsList.push('Your expenses exceed income this month. Consider reviewing your spending.');
    }
    if (stats.avgDailySpend > 0) {
      const monthlyProjection = stats.avgDailySpend * 30;
      if (monthlyProjection > stats.monthlyExpenses * 1.2) {
        insightsList.push('Your spending pace suggests you may exceed your monthly budget.');
      }
    }
    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      insightsList.push(`${topCategory.name} is your largest expense category at ${topCategory.percentage.toFixed(1)}% of total spending.`);
    }
    return insightsList.length > 0 ? insightsList : ['Keep tracking your finances to gain better insights!'];
  }, [stats, categoryData]);

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
  const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading finance data...</p>
        </div>
      </div>
    );
  }

  if (!finance?.accountInfo?.isSetupComplete) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="card p-8 text-center max-w-md mx-auto">
          <FaWallet className="text-5xl text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Setup Your Finance Account</h2>
          <p className="text-[var(--text-secondary)] mb-6">Get started by setting up your account</p>
          <button onClick={() => setShowSetupModal(true)} className="btn-primary">
            Setup Account
          </button>
        </div>
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
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6 lg:mb-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1 md:mb-2">
              Finance Dashboard
            </h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)]">
              Track your income, expenses, and financial health
            </p>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingTransaction(null);
                setTransactionForm({
                  type: 'expense',
                  category: '',
                  amount: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                });
                setShowTransactionModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <FaPlus />
              <span className="hidden md:inline">Add Transaction</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
        <StatCard
          title="Net Worth"
          value={netWorth}
          subtitle="Total assets"
          icon={FaDollarSign}
          gradient="linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.08) 50%, rgba(21, 128, 61, 0.12) 100%)"
          delay={0}
          formatter={(val) => formatCurrency(val, baseCurrency)}
        />
        <StatCard
          title="Monthly Income"
          value={stats.monthlyIncome}
          subtitle="This month"
          icon={FaArrowUp}
          gradient="linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.08) 50%, rgba(21, 128, 61, 0.12) 100%)"
          delay={0.1}
          trend={stats.incomeTrend > 0 ? 'up' : stats.incomeTrend < 0 ? 'down' : null}
          trendValue={stats.incomeTrend !== 0 ? `${Math.abs(stats.incomeTrend).toFixed(1)}%` : null}
          formatter={(val) => formatCurrency(val, baseCurrency)}
        />
        <StatCard
          title="Monthly Expenses"
          value={stats.monthlyExpenses}
          subtitle="This month"
          icon={FaArrowDown}
          gradient="linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 50%, rgba(185, 28, 28, 0.12) 100%)"
          delay={0.2}
          trend={stats.expenseTrend > 0 ? 'up' : stats.expenseTrend < 0 ? 'down' : null}
          trendValue={stats.expenseTrend !== 0 ? `${Math.abs(stats.expenseTrend).toFixed(1)}%` : null}
          formatter={(val) => formatCurrency(val, baseCurrency)}
        />
        <StatCard
          title="Savings Rate"
          value={stats.savingsRate}
          subtitle="% of income"
          icon={FaPiggyBank}
          gradient="linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 50%, rgba(29, 78, 216, 0.12) 100%)"
          delay={0.3}
          formatter={(val) => `${val.toFixed(1)}%`}
        />
        <StatCard
          title="Avg Daily Spend"
          value={stats.avgDailySpend}
          subtitle="This month"
          icon={FaWallet}
          gradient="linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 50%, rgba(109, 40, 217, 0.12) 100%)"
          delay={0.4}
          className="col-span-2 md:col-span-1"
          formatter={(val) => formatCurrency(val, baseCurrency)}
        />
      </div>

      {/* Income vs Expenses Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl md:rounded-2xl bg-[var(--bg-secondary)] p-4 md:p-6 lg:p-8 border border-[var(--border-color)] shadow-md md:shadow-lg"
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20">
            <FaChartLine className="text-lg md:text-xl text-green-500" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[var(--text-primary)]">
              Income vs Expenses
            </h2>
            <p className="text-xs md:text-sm text-[var(--text-secondary)]">Monthly comparison</p>
          </div>
        </div>

        {incomeExpensesData.length > 0 ? (
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeExpensesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis
                  stroke="var(--text-secondary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, baseCurrency, { useLocale: false, maximumFractionDigits: 0 })}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value) => formatCurrency(value, baseCurrency)}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)]">
            <p>No data available yet</p>
          </div>
        )}
      </motion.div>

      {/* Cash Flow Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl md:rounded-2xl bg-[var(--bg-secondary)] p-4 md:p-6 lg:p-8 border border-[var(--border-color)] shadow-md md:shadow-lg"
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
            <FaChartLine className="text-lg md:text-xl text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Cash Flow Trend</h2>
            <p className="text-xs md:text-sm text-[var(--text-secondary)]">Balance over time</p>
          </div>
        </div>

        {cashFlowData.length > 0 ? (
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <YAxis
                  stroke="var(--text-secondary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                  tickFormatter={(value) => formatCurrency(value, baseCurrency, { useLocale: false, maximumFractionDigits: 0 })}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value) => formatCurrency(value, baseCurrency)}
                />
                <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#cashFlowGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)]">
            <p>No data available yet</p>
          </div>
        )}
      </motion.div>

      {/* Category Breakdown & Weekly Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl md:rounded-2xl bg-[var(--bg-secondary)] p-4 md:p-6 lg:p-8 border border-[var(--border-color)] shadow-md md:shadow-lg"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20">
              <FaChartPie className="text-lg md:text-xl text-pink-500" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Category Breakdown</h2>
              <p className="text-xs md:text-sm text-[var(--text-secondary)]">Spending by category</p>
            </div>
          </div>

          {categoryData.length > 0 ? (
            <>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => formatCurrency(value, baseCurrency)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {categoryData.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-primary)]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-[var(--text-primary)]">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {formatCurrency(cat.value, baseCurrency)}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">{cat.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)]">
              <p>No category data available</p>
            </div>
          )}
        </motion.div>

        {/* Weekly Spending Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-xl md:rounded-2xl bg-[var(--bg-secondary)] p-4 md:p-6 lg:p-8 border border-[var(--border-color)] shadow-md md:shadow-lg"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              <FaCalendarAlt className="text-lg md:text-xl text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Weekly Spending</h2>
              <p className="text-xs md:text-sm text-[var(--text-secondary)]">8-week trend</p>
            </div>
          </div>

          {weeklySpendingData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                  <XAxis dataKey="week" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <YAxis
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    tickFormatter={(value) => formatCurrency(value, baseCurrency, { useLocale: false, maximumFractionDigits: 0 })}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value) => formatCurrency(value, baseCurrency)}
                  />
                  <Line type="monotone" dataKey="spending" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)]">
              <p>No data available yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <CollapsibleSection title="Recent Transactions" icon={FaCreditCard} defaultOpen={true}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="md:rounded-2xl md:bg-[var(--bg-secondary)] md:p-6 lg:p-8 md:border md:border-[var(--border-color)] md:shadow-lg"
        >
          <div className="hidden md:flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
              <FaCreditCard className="text-xl text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Recent Transactions</h2>
              <p className="text-sm text-[var(--text-secondary)]">Latest financial activity</p>
            </div>
          </div>

          {recentTransactions.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <FaCreditCard className="text-5xl text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--text-secondary)] mb-2 font-medium text-lg">No transactions yet</p>
              <p className="text-sm text-[var(--text-tertiary)] mb-6">Start tracking your finances</p>
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setTransactionForm({
                    type: 'expense',
                    category: '',
                    amount: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                  });
                  setShowTransactionModal(true);
                }}
                className="btn-primary"
              >
                <FaPlus className="inline mr-2" />
                Add Transaction
              </button>
            </div>
          )}
        </motion.div>
      </CollapsibleSection>

      {/* Financial Insights */}
      <CollapsibleSection title="Financial Insights" icon={FaLightbulb} defaultOpen={false}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="md:rounded-2xl md:bg-gradient-to-br md:from-purple-500/10 md:via-indigo-500/10 md:to-pink-500/10 md:p-6 lg:p-8 md:border md:border-purple-500/20 md:shadow-lg"
        >
          <div className="hidden md:flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30">
              <FaLightbulb className="text-xl text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Financial Insights</h2>
              <p className="text-sm text-[var(--text-secondary)]">Personalized financial tips</p>
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + i * 0.1 }}
                className="p-3 md:p-4 rounded-lg md:rounded-xl bg-[var(--bg-primary)] border border-purple-500/20 flex items-start gap-2 md:gap-3"
              >
                <FaLightbulb className="text-base md:text-lg text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs md:text-sm text-[var(--text-primary)] leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </CollapsibleSection>

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
    </div>
  );
};

// Setup Modal Component
const SetupModal = ({ isOpen, onClose, onSave, form, setForm }) => {
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
        className="card p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Setup Your Account</h2>
          <button onClick={onClose} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Account Type *</label>
            <select
              value={form.accountType}
              onChange={(e) => setForm({ ...form, accountType: e.target.value })}
              className="input-field"
              required
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Account Name *</label>
            <input
              type="text"
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
              className="input-field"
              placeholder="e.g., Primary Checking Account"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Initial Balance *</label>
            <input
              type="number"
              step="0.01"
              value={form.initialBalance}
              onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
              className="input-field"
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
        className="card p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value, category: '' })}
              className="input-field"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select category</option>
              {(form.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field"
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

export default FinanceTracker;
