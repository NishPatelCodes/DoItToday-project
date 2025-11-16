import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaDollarSign, FaArrowUp, FaArrowDown, FaWallet, FaTimes, FaCheckCircle, FaChartPie } from 'react-icons/fa';
import { format, subDays, startOfDay, isToday, parseISO } from 'date-fns';
import { financeAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Area, AreaChart 
} from 'recharts';

const FinanceTracker = () => {
  const [finance, setFinance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [setupForm, setSetupForm] = useState({
    accountType: 'checking',
    accountName: 'Primary Account',
    initialBalance: '',
    currency: 'USD',
    bankName: '',
    accountNumber: '',
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

  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investment',
    'Business',
    'Gift',
    'Rental',
    'Other',
  ];

  // Modern color palette for charts
  const COLORS = {
    expense: ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#3B82F6'],
    income: '#22C55E',
    background: 'var(--bg-secondary)',
    border: 'var(--border-color)',
    text: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const financeRes = await financeAPI.getAll();
      setFinance(financeRes.data);
      setTransactions(financeRes.data?.transactions || []);
      
      // Show setup modal if account is not set up
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

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      await financeAPI.setupAccount(setupForm);
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

  // Calculate current balance
  const currentBalance = useMemo(() => {
    if (!finance?.accountInfo) return 0;
    const initialBalance = finance.accountInfo.initialBalance || 0;
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return initialBalance + totalIncome - totalExpenses;
  }, [finance, transactions]);

  // Chart 1: Expense Categories Pie Chart (Modern)
  const expenseCategoryData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const categoryTotals = expenseCategories.map(category => {
      const amount = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === category && 
          new Date(t.date) >= startOfMonth
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: category, value: amount };
    }).filter(item => item.value > 0);
    
    return categoryTotals.sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Chart 2: Cash Flow Income vs Expense (Last 30 days)
  const cashFlowData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayIncome = transactions
        .filter(t => 
          t.type === 'income' && 
          new Date(t.date) >= dayStart && 
          new Date(t.date) <= dayEnd
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dayExpense = transactions
        .filter(t => 
          t.type === 'expense' && 
          new Date(t.date) >= dayStart && 
          new Date(t.date) <= dayEnd
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(date, 'MMM dd'),
        income: dayIncome,
        expense: dayExpense,
        net: dayIncome - dayExpense,
      };
    });
    return days;
  }, [transactions]);

  // Chart 3: Daily Expense Line Graph (Last 30 days)
  const dailyExpenseData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const expense = transactions
        .filter(t => 
          t.type === 'expense' && 
          new Date(t.date) >= dayStart && 
          new Date(t.date) <= dayEnd
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(date, 'MMM dd'),
        expense: expense,
      };
    });
    return days;
  }, [transactions]);

  // Chart 4: Account Balance Trend Graph (Last 30 days)
  const balanceTrendData = useMemo(() => {
    if (!finance?.balanceHistory || finance.balanceHistory.length === 0) {
      // Generate from transactions if no history
      const initialBalance = finance?.accountInfo?.initialBalance || 0;
      const days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        const dayStart = startOfDay(date);
        
        const income = transactions
          .filter(t => t.type === 'income' && new Date(t.date) <= dayStart)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = transactions
          .filter(t => t.type === 'expense' && new Date(t.date) <= dayStart)
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          date: format(date, 'MMM dd'),
          balance: initialBalance + income - expense,
        };
      });
      return days;
    }
    
    // Use actual balance history (last 30 entries or last 30 days)
    const sortedHistory = [...finance.balanceHistory]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);
    
    return sortedHistory.map(entry => ({
      date: format(new Date(entry.date), 'MMM dd'),
      balance: entry.balance,
    }));
  }, [finance, transactions]);

  // Calculate monthly stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <FaDollarSign className="text-green-500" />
            Finance Tracker
          </h1>
          <p className="text-[var(--text-secondary)]">
            {finance?.accountInfo?.accountName || 'Manage your finances'}
          </p>
        </div>
        <motion.button
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Add Transaction
        </motion.button>
      </div>

      {/* Account Summary Cards */}
      {finance?.accountInfo?.isSetupComplete && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">Account Balance</span>
              <FaWallet className={currentBalance >= 0 ? 'text-green-500' : 'text-red-500'} />
            </div>
            <p className={`text-2xl md:text-3xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${currentBalance.toFixed(2)}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {finance.accountInfo.accountType.charAt(0).toUpperCase() + finance.accountInfo.accountType.slice(1)} Account
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">Monthly Income</span>
              <FaArrowUp className="text-green-500" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-600">
              ${monthlyIncome.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">Monthly Expenses</span>
              <FaArrowDown className="text-red-500" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-red-600">
              ${monthlyExpenses.toFixed(2)}
            </p>
          </motion.div>
        </div>
      )}

      {/* Charts Section - 4 Modern Charts */}
      {finance?.accountInfo?.isSetupComplete && (
        <div className="space-y-6 mb-8">
          {/* Chart 1: Expense Categories Pie Chart */}
          {expenseCategoryData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 md:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaChartPie className="text-[var(--accent-primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Expense Categories
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.expense[index % COLORS.expense.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: COLORS.background,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '8px',
                      color: COLORS.text,
                    }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Chart 2: Cash Flow Income vs Expense */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5 md:p-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Cash Flow - Income vs Expense (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke={COLORS.textSecondary}
                  style={{ fontSize: '12px' }}
                  tick={{ fill: COLORS.textSecondary }}
                />
                <YAxis 
                  stroke={COLORS.textSecondary}
                  tick={{ fill: COLORS.textSecondary }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.text,
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="income" fill={COLORS.income} name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Chart 3: Daily Expense Line Graph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-5 md:p-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Daily Expense Trend (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={dailyExpenseData}>
                <defs>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke={COLORS.textSecondary}
                  style={{ fontSize: '12px' }}
                  tick={{ fill: COLORS.textSecondary }}
                />
                <YAxis 
                  stroke={COLORS.textSecondary}
                  tick={{ fill: COLORS.textSecondary }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.text,
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGradient)" 
                  name="Expense"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Chart 4: Account Balance Trend Graph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-5 md:p-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Account Balance Trend (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={balanceTrendData}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke={COLORS.textSecondary}
                  style={{ fontSize: '12px' }}
                  tick={{ fill: COLORS.textSecondary }}
                />
                <YAxis 
                  stroke={COLORS.textSecondary}
                  tick={{ fill: COLORS.textSecondary }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: COLORS.background,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.text,
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#22C55E" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#balanceGradient)" 
                  name="Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Recent Transactions */}
      {finance?.accountInfo?.isSetupComplete && (
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Recent Transactions
          </h2>
          <div className="card p-4 md:p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <FaDollarSign className="text-6xl text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
                <p className="text-[var(--text-secondary)]">No transactions yet</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-2">Add your first transaction to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map((transaction) => (
                    <motion.div
                      key={transaction._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.type === 'income'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {transaction.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--text-primary)]">
                            {transaction.category}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)] truncate">
                            {transaction.description || 'No description'}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingTransaction(transaction);
                              setTransactionForm({
                                type: transaction.type,
                                category: transaction.category,
                                amount: transaction.amount,
                                description: transaction.description || '',
                                date: new Date(transaction.date).toISOString().split('T')[0],
                              });
                              setShowTransactionModal(true);
                            }}
                            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                            aria-label="Edit transaction"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction._id)}
                            className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
                            aria-label="Delete transaction"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </div>
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
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Setup Modal Component
const SetupModal = ({ isOpen, onClose, onSave, form, setForm }) => {
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
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Setup Your Account
            </h2>
            <p className="text-[var(--text-secondary)]">
              Let's get started with your finance tracking
            </p>
          </div>
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
              Account Type *
            </label>
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
              <option value="investment">Investment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Account Name *
            </label>
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
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Initial Balance *
            </label>
            <input
              type="number"
              step="0.01"
              value={form.initialBalance}
              onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
              className="input-field"
              placeholder="0.00"
              required
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Enter your current account balance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="input-field"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Bank Name (Optional)
              </label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="input-field"
                placeholder="e.g., Chase Bank"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Account Number (Optional)
            </label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              className="input-field"
              placeholder="Last 4 digits only"
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              For your reference only - stored securely
            </p>
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
const TransactionModal = ({ isOpen, onClose, onSave, form, setForm, expenseCategories, incomeCategories, isEditing }) => {
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
              Type *
            </label>
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
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Category *
            </label>
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
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Amount *
            </label>
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
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Date *
            </label>
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
