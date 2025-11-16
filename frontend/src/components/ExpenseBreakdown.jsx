import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatCurrency } from '../utils/currencyFormatter';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Category icons and colors
const CATEGORY_CONFIG = {
  'Food & Dining': { 
    icon: '🍔', 
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'Transportation': { 
    icon: '🚗', 
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  'Shopping': { 
    icon: '🛍️', 
    color: 'bg-pink-500',
    lightColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
  'Entertainment': { 
    icon: '🎬', 
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  'Bills & Utilities': { 
    icon: '💡', 
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  'Health & Fitness': { 
    icon: '💊', 
    color: 'bg-red-500',
    lightColor: 'bg-red-100 dark:bg-red-900/30',
  },
  'Education': { 
    icon: '📚', 
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  'Travel': { 
    icon: '✈️', 
    color: 'bg-cyan-500',
    lightColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  'Gifts & Donations': { 
    icon: '🎁', 
    color: 'bg-green-500',
    lightColor: 'bg-green-100 dark:bg-green-900/30',
  },
  'Housing': { 
    icon: '🏠', 
    color: 'bg-teal-500',
    lightColor: 'bg-teal-100 dark:bg-teal-900/30',
  },
  'Other': { 
    icon: '📦', 
    color: 'bg-gray-500',
    lightColor: 'bg-gray-100 dark:bg-gray-900/30',
  },
};

const ExpenseBreakdown = ({ 
  transactions = [], 
  baseCurrency = 'USD',
  compareWithLastMonth = true 
}) => {
  // Calculate current month expenses by category
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        transactionDate >= startOfCurrentMonth &&
        transactionDate <= endOfCurrentMonth
      );
    });

    const categoryTotals = {};
    currentMonthTransactions.forEach(t => {
      const category = t.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (t.amount || 0);
    });

    return categoryTotals;
  }, [transactions]);

  // Calculate last month expenses by category (for comparison)
  const lastMonthData = useMemo(() => {
    if (!compareWithLastMonth) return {};

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const startOfLastMonth = startOfMonth(lastMonth);
    const endOfLastMonth = endOfMonth(lastMonth);

    const lastMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        transactionDate >= startOfLastMonth &&
        transactionDate <= endOfLastMonth
      );
    });

    const categoryTotals = {};
    lastMonthTransactions.forEach(t => {
      const category = t.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (t.amount || 0);
    });

    return categoryTotals;
  }, [transactions, compareWithLastMonth]);

  // Calculate percentage change and prepare display data
  const breakdownData = useMemo(() => {
    const categories = new Set([
      ...Object.keys(currentMonthData),
      ...Object.keys(lastMonthData),
    ]);

    return Array.from(categories)
      .map(category => {
        const current = currentMonthData[category] || 0;
        const last = lastMonthData[category] || 0;
        
        let percentageChange = 0;
        if (last > 0) {
          percentageChange = ((current - last) / last) * 100;
        } else if (current > 0) {
          percentageChange = 100; // New category
        }

        return {
          category,
          current,
          last,
          percentageChange,
          isIncrease: percentageChange > 0,
        };
      })
      .filter(item => item.current > 0) // Only show categories with current month expenses
      .sort((a, b) => b.current - a.current); // Sort by amount (highest first)
  }, [currentMonthData, lastMonthData]);

  const totalCurrent = useMemo(() => {
    return Object.values(currentMonthData).reduce((sum, amount) => sum + amount, 0);
  }, [currentMonthData]);

  return (
    <div className="card p-6 rounded-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
          Expenses Breakdown
        </h2>
        {compareWithLastMonth && (
          <p className="text-sm text-[var(--text-secondary)]">
            *Compare to last month
          </p>
        )}
      </div>

      {/* Category Grid */}
      {breakdownData.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-[var(--text-secondary)] mb-2">No expenses this month</p>
          <p className="text-sm text-[var(--text-tertiary)]">
            Start tracking your expenses to see breakdowns
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {breakdownData.map((item, index) => {
            const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG['Other'];
            const percentageOfTotal = totalCurrent > 0 
              ? (item.current / totalCurrent) * 100 
              : 0;

            return (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] transition-colors cursor-pointer group"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${config.lightColor}`}>
                      {config.icon}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)] text-sm">
                        {item.category}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {percentageOfTotal.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <p className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  {formatCurrency(item.current, baseCurrency)}
                </p>

                {/* Percentage Change */}
                {compareWithLastMonth && item.last > 0 && (
                  <div className={`
                    flex items-center gap-1 text-xs font-medium
                    ${item.isIncrease 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                    }
                  `}>
                    {item.isIncrease ? (
                      <FaArrowUp className="text-xs" />
                    ) : (
                      <FaArrowDown className="text-xs" />
                    )}
                    <span>
                      {Math.abs(item.percentageChange).toFixed(0)}%
                    </span>
                    {item.isIncrease ? '↑' : '↓'}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-3 w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentageOfTotal}%` }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className={`h-full ${config.color} rounded-full`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Total Summary */}
      {breakdownData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Total Expenses This Month
            </span>
            <span className="text-xl font-bold text-[var(--text-primary)]">
              {formatCurrency(totalCurrent, baseCurrency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseBreakdown;

