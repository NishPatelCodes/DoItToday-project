import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaDollarSign, FaWallet, FaTimes, FaCheckCircle, FaChartPie, FaSearch, FaBell } from 'react-icons/fa';
import { format } from 'date-fns';
import { financeAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/currencyFormatter';
import CurrencySelector from './CurrencySelector';
import CashFlowBars from './CashFlowBars';
import RecentTransactions from './RecentTransactions';
import ExpenseBreakdown from './ExpenseBreakdown';
import BudgetTracker from './BudgetTracker';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const FinanceTracker = () => {
  const [finance, setFinance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
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
  const [budgetForm, setBudgetForm] = useState({
    income: '',
    expenses: '',
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

  // Get currency from account or default
  useEffect(() => {
    if (finance?.accountInfo?.currency) {
      setSelectedCurrency(finance.accountInfo.currency);
      setSetupForm(prev => ({ ...prev, currency: finance.accountInfo.currency }));
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
      
      // Initialize budget form if monthly budget exists
      if (financeRes.data?.monthlyBudget) {
        setBudgetForm({
          income: financeRes.data.monthlyBudget.income || '',
          expenses: financeRes.data.monthlyBudget.expenses || '',
        });
      }
      
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
      const setupData = {
        ...setupForm,
        initialBalance: parseFloat(setupForm.initialBalance) || 0,
      };
      
      await financeAPI.setupAccount(setupData);
      toast.success('Account setup complete!');
      setShowSetupModal(false);
      setSelectedCurrency(setupForm.currency);
      loadFinanceData();
    } catch (error) {
      console.error('Setup error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to setup account';
      toast.error(errorMessage);
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

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    try {
      await financeAPI.updateMonthlyBudget({
        income: parseFloat(budgetForm.income) || 0,
        expenses: parseFloat(budgetForm.expenses) || 0,
      });
      toast.success('Budget updated');
      setShowBudgetModal(false);
      loadFinanceData();
    } catch (error) {
      toast.error('Failed to update budget');
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

  // Calculate monthly stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  // Chart 1: Expense Categories Pie Chart
  const expenseCategoryData = useMemo(() => {
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

  // Chart 2: Balance Trend (Last 30 days)
  const balanceTrendData = useMemo(() => {
    if (!finance?.balanceHistory || finance.balanceHistory.length === 0) {
      const initialBalance = finance?.accountInfo?.initialBalance || 0;
      const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 29 + i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        
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
    
    const sortedHistory = [...finance.balanceHistory]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);
    
    return sortedHistory.map(entry => ({
      date: format(new Date(entry.date), 'MMM dd'),
      balance: entry.balance,
    }));
  }, [finance, transactions]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading finance data...</p>
        </div>
      </div>
    );
  }

  const baseCurrency = finance?.accountInfo?.currency || selectedCurrency;

  return (
    <div className="p-4 md:p-6 lg:p-8 overflow-x-hidden min-h-screen bg-[var(--bg-primary)]">
      {/* Header Section - Matching Photo Design */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">
              Hello {finance?.accountInfo?.accountName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)]">
              {format(new Date(), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search here"
                className="pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 w-64"
                aria-label="Search transactions"
              />
            </div>
            <button
              className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-tertiary)]"
              aria-label="Notifications"
            >
              <FaBell className="text-lg" />
            </button>
            <CurrencySelector
              value={baseCurrency}
              onChange={(currency) => {
                setSelectedCurrency(currency);
                if (finance?.accountInfo) {
                  financeAPI.updateAccount({ currency }).then(() => {
                    loadFinanceData();
                  });
                }
              }}
              size="md"
            />
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
              aria-label="Add new transaction"
            >
              <FaPlus />
              <span className="hidden md:inline">Add Transaction</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Account Summary Cards */}
      {finance?.accountInfo?.isSetupComplete && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 md:p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">Total Balance</span>
              <FaWallet className={currentBalance >= 0 ? 'text-green-500' : 'text-red-500'} />
            </div>
            <p className={`text-2xl md:text-3xl font-bold mb-2 ${
              currentBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(currentBalance, baseCurrency)}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {finance.accountInfo.accountType.charAt(0).toUpperCase() + finance.accountInfo.accountType.slice(1)} Account
            </p>
          </motion.div>

          {/* Monthly Income Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5 md:p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">Monthly Income</span>
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xs font-bold">↑</span>
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {formatCurrency(monthlyIncome, baseCurrency)}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">vs Last Month</p>
          </motion.div>

          {/* Monthly Expenses Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-5 md:p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">Monthly Expenses</span>
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-xs font-bold">↓</span>
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {formatCurrency(monthlyExpenses, baseCurrency)}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">vs Last Month</p>
          </motion.div>
        </div>
      )}

      {/* Cash Flow Bars - Hero Widget */}
      {finance?.accountInfo?.isSetupComplete && (
        <div className="mb-6 md:mb-8">
          <CashFlowBars
            transactions={transactions}
            baseCurrency={baseCurrency}
            period="30days"
          />
        </div>
      )}

      {/* Main Content Grid - Matching Photo Layout */}
      {finance?.accountInfo?.isSetupComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Left Column: Recent Transactions */}
          <div className="lg:col-span-2">
            <RecentTransactions
              transactions={transactions}
              baseCurrency={baseCurrency}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              limit={10}
            />
          </div>

          {/* Right Column: Budget Tracker */}
          <div>
            <BudgetTracker
              transactions={transactions}
              monthlyBudget={finance?.monthlyBudget || {}}
              baseCurrency={baseCurrency}
              onEditBudget={() => setShowBudgetModal(true)}
            />
          </div>
        </div>
      )}

      {/* Expense Breakdown */}
      {finance?.accountInfo?.isSetupComplete && (
        <div className="mb-6 md:mb-8">
          <ExpenseBreakdown
            transactions={transactions}
            baseCurrency={baseCurrency}
            compareWithLastMonth={true}
          />
        </div>
      )}

      {/* Charts Section - Enhanced Design */}
      {finance?.accountInfo?.isSetupComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Expense Categories Pie Chart */}
          {expenseCategoryData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 md:p-6 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaChartPie className="text-[var(--accent-primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Expense Categories
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
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
                    formatter={(value) => formatCurrency(value, baseCurrency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Balance Trend Line Chart */}
          {balanceTrendData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5 md:p-6 rounded-2xl"
            >
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Balance Trend (Last 30 Days)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={balanceTrendData}>
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.1}/>
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
                      tickFormatter={(value) => formatCurrency(value, baseCurrency, { useLocale: false })}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: COLORS.background,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '8px',
                        color: COLORS.text,
                      }}
                      formatter={(value) => formatCurrency(value, baseCurrency)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#6D28D9" 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#balanceGradient)" 
                      name="Balance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
            </motion.div>
          )}
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
            baseCurrency={baseCurrency}
          />
        )}
      </AnimatePresence>

      {/* Budget Modal */}
      <AnimatePresence>
        {showBudgetModal && (
          <BudgetModal
            isOpen={showBudgetModal}
            onClose={() => setShowBudgetModal(false)}
            onSave={handleUpdateBudget}
            form={budgetForm}
            setForm={setBudgetForm}
            baseCurrency={baseCurrency}
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-modal-title"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="setup-modal-title" className="text-2xl font-bold text-[var(--text-primary)] mb-2">
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
              aria-label="Account type"
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
              aria-label="Account name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Initial Balance *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.initialBalance}
              onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
              className="input-field"
              placeholder="0.00"
              required
              aria-label="Initial balance"
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
                aria-label="Currency"
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
                aria-label="Bank name"
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
              aria-label="Account number"
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
const TransactionModal = ({ isOpen, onClose, onSave, form, setForm, expenseCategories, incomeCategories, isEditing, baseCurrency }) => {
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="transaction-modal-title" className="text-2xl font-bold text-[var(--text-primary)]">
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
              aria-label="Transaction type"
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
              aria-label="Category"
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                {formatCurrency(0, baseCurrency).charAt(0)}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-field pl-8"
                placeholder="0.00"
                required
                aria-label="Amount"
              />
            </div>
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
              aria-label="Description"
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
              aria-label="Transaction date"
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
