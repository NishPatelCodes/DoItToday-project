import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTarget, FaExclamationTriangle, FaCheckCircle, FaEdit } from 'react-icons/fa';
import { formatCurrency } from '../utils/currencyFormatter';
import { startOfMonth, endOfMonth } from 'date-fns';

const BudgetTracker = ({ 
  transactions = [], 
  monthlyBudget = { income: 0, expenses: 0 },
  baseCurrency = 'USD',
  onEditBudget
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Calculate current month actuals
  const currentMonthActuals = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
    });

    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return { income, expenses };
  }, [transactions]);

  const budgetIncome = monthlyBudget.income || 0;
  const budgetExpenses = monthlyBudget.expenses || 0;
  const actualIncome = currentMonthActuals.income;
  const actualExpenses = currentMonthActuals.expenses;

  // Calculate percentages
  const incomeProgress = budgetIncome > 0 
    ? Math.min((actualIncome / budgetIncome) * 100, 100) 
    : 0;
  const expenseProgress = budgetExpenses > 0 
    ? Math.min((actualExpenses / budgetExpenses) * 100, 100) 
    : 0;

  // Determine status
  const isOverBudget = expenseProgress > 100;
  const isUnderBudget = expenseProgress < 80;
  const isOnTrack = expenseProgress >= 80 && expenseProgress <= 100;

  // Calculate remaining budget
  const remainingBudget = Math.max(0, budgetExpenses - actualExpenses);
  const overBudget = Math.max(0, actualExpenses - budgetExpenses);

  return (
    <div className="card p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Budget Tracker
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            This Month's Budget vs Actual
          </p>
        </div>
        {onEditBudget && (
          <button
            onClick={onEditBudget}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors rounded-lg hover:bg-[var(--bg-tertiary)]"
            aria-label="Edit budget"
          >
            <FaEdit className="text-sm" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Income Budget */}
        {budgetIncome > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTarget className="text-green-500 text-sm" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Income Budget
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {formatCurrency(actualIncome, baseCurrency)} / {formatCurrency(budgetIncome, baseCurrency)}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {incomeProgress.toFixed(0)}% achieved
                </p>
              </div>
            </div>
            <div className="relative h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${incomeProgress}%` }}
                transition={{ duration: 0.8 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Expense Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaTarget className={`text-sm ${
                isOverBudget 
                  ? 'text-red-500' 
                  : isOnTrack 
                  ? 'text-yellow-500' 
                  : 'text-green-500'
              }`} />
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                Expense Budget
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {formatCurrency(actualExpenses, baseCurrency)} / {formatCurrency(budgetExpenses, baseCurrency)}
              </p>
              <p className={`text-xs font-medium ${
                isOverBudget 
                  ? 'text-red-600 dark:text-red-400' 
                  : isOnTrack 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {expenseProgress.toFixed(0)}% used
                {isOverBudget && ` (${formatCurrency(overBudget, baseCurrency)} over)`}
              </p>
            </div>
          </div>
          <div className="relative h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(expenseProgress, 100)}%` }}
              transition={{ duration: 0.8 }}
              className={`absolute inset-y-0 left-0 rounded-full ${
                isOverBudget 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : isOnTrack 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                  : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}
            />
            {/* Over-budget indicator */}
            {isOverBudget && expenseProgress > 100 && (
              <div className="absolute inset-y-0 right-0 w-2 bg-red-600" />
            )}
          </div>
        </div>

        {/* Status Alert */}
        {isOverBudget && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <FaExclamationTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                Over Budget Warning
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                You've exceeded your expense budget by {formatCurrency(overBudget, baseCurrency)} this month.
              </p>
            </div>
          </motion.div>
        )}

        {isOnTrack && !isOverBudget && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
          >
            <FaTarget className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                On Track
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                You're on track with your budget. Keep monitoring your spending.
              </p>
            </div>
          </motion.div>
        )}

        {isUnderBudget && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          >
            <FaCheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                Under Budget
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Great job! You're well within your budget with {formatCurrency(remainingBudget, baseCurrency)} remaining.
              </p>
            </div>
          </motion.div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Remaining Budget</p>
            <p className={`text-lg font-bold ${
              remainingBudget > 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(remainingBudget, baseCurrency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Net Cash Flow</p>
            <p className={`text-lg font-bold ${
              (actualIncome - actualExpenses) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(actualIncome - actualExpenses, baseCurrency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;

