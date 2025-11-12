import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaDollarSign, FaArrowUp, FaArrowDown, FaPiggyBank, FaChartLine } from 'react-icons/fa';
import { financeAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FinanceTracker = () => {
  const [finance, setFinance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
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
    'Other',
  ];

  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investment',
    'Gift',
    'Other',
  ];

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const [financeRes, statsRes] = await Promise.all([
        financeAPI.getAll(),
        financeAPI.getStats(),
      ]);
      setFinance(financeRes.data);
      setTransactions(financeRes.data?.transactions || []);
      setSavingsGoals(financeRes.data?.savingsGoals || []);
    } catch (error) {
      console.error('Error loading finance data:', error);
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
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

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await financeAPI.updateSavingsGoal(editingGoal._id, goalForm);
        toast.success('Savings goal updated');
      } else {
        await financeAPI.addSavingsGoal(goalForm);
        toast.success('Savings goal created');
      }
      setShowGoalModal(false);
      setEditingGoal(null);
      setGoalForm({
        name: '',
        targetAmount: '',
        targetDate: '',
      });
      loadFinanceData();
    } catch (error) {
      toast.error('Failed to save savings goal');
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await financeAPI.deleteSavingsGoal(id);
      toast.success('Savings goal deleted');
      loadFinanceData();
    } catch (error) {
      toast.error('Failed to delete savings goal');
    }
  };

  // Calculate monthly stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = monthlyIncome - monthlyExpenses;

  // Chart data
  const monthlyChartData = Array.from({ length: 12 }, (_, i) => {
    const monthStart = new Date(now.getFullYear(), i, 1);
    const monthEnd = new Date(now.getFullYear(), i + 1, 0);
    const monthIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
      .reduce((sum, t) => sum + t.amount, 0);
    const monthExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      month: new Date(now.getFullYear(), i).toLocaleString('default', { month: 'short' }),
      income: monthIncome,
      expenses: monthExpenses,
      balance: monthIncome - monthExpenses,
    };
  });

  // Category breakdown
  const categoryData = expenseCategories.map(category => {
    const amount = transactions
      .filter(t => t.type === 'expense' && t.category === category && new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: category, value: amount };
  }).filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <FaDollarSign className="text-green-500" />
            Finance Tracker
          </h1>
          <p className="text-[var(--text-secondary)]">
            Track your income, expenses, and savings goals
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={() => {
              setEditingGoal(null);
              setGoalForm({ name: '', targetAmount: '', targetDate: '' });
              setShowGoalModal(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary flex items-center gap-2"
          >
            <FaPiggyBank />
            New Goal
          </motion.button>
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          transition={{ delay: 0.1 }}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 md:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">Balance</span>
            <FaDollarSign className={balance >= 0 ? 'text-green-500' : 'text-red-500'} />
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${balance.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Overview Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 md:p-6"
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <FaChartLine />
            Monthly Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Expense Categories Chart */}
        {categoryData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5 md:p-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Expense Categories
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Savings Goals */}
      {savingsGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <FaPiggyBank className="text-yellow-500" />
            Savings Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {savingsGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-5 md:p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setGoalForm({
                            name: goal.name,
                            targetAmount: goal.targetAmount,
                            targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
                          });
                          setShowGoalModal(true);
                        }}
                        className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
                      <span>Progress</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                  {goal.targetDate && (
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Recent Transactions
        </h2>
        <div className="card p-4 md:p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <FaDollarSign className="text-6xl text-[var(--text-tertiary)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">No transactions yet</p>
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
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)]">
                          {transaction.category}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {transaction.description || 'No description'}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`font-semibold ${
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
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
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

      {/* Transaction Modal */}
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

      {/* Goal Modal */}
      {showGoalModal && (
        <GoalModal
          isOpen={showGoalModal}
          onClose={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
          }}
          onSave={handleAddGoal}
          form={goalForm}
          setForm={setGoalForm}
          isEditing={!!editingGoal}
        />
      )}
    </div>
  );
};

// Transaction Modal Component
const TransactionModal = ({ isOpen, onClose, onSave, form, setForm, expenseCategories, incomeCategories, isEditing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card p-6 md:p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          {isEditing ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="input-field"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Category
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
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">
              {isEditing ? 'Update' : 'Add'} Transaction
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Goal Modal Component
const GoalModal = ({ isOpen, onClose, onSave, form, setForm, isEditing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card p-6 md:p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          {isEditing ? 'Edit Savings Goal' : 'New Savings Goal'}
        </h2>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Goal Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Emergency Fund"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Target Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              className="input-field"
              placeholder="5000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">
              {isEditing ? 'Update' : 'Create'} Goal
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default FinanceTracker;

