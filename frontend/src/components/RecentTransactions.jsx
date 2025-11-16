import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown, FaChevronRight, FaEdit, FaTrash } from 'react-icons/fa';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { formatCurrency } from '../utils/currencyFormatter';

// Category icons mapping
const CATEGORY_ICONS = {
  // Expense categories
  'Food & Dining': { icon: '🍔', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  'Transportation': { icon: '🚗', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'Shopping': { icon: '🛍️', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  'Entertainment': { icon: '🎬', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  'Bills & Utilities': { icon: '💡', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  'Health & Fitness': { icon: '💊', bg: 'bg-red-100 dark:bg-red-900/30' },
  'Education': { icon: '📚', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  'Travel': { icon: '✈️', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  'Gifts & Donations': { icon: '🎁', bg: 'bg-green-100 dark:bg-green-900/30' },
  'Other': { icon: '📦', bg: 'bg-gray-100 dark:bg-gray-900/30' },
  // Income categories
  'Salary': { icon: '💰', bg: 'bg-green-100 dark:bg-green-900/30' },
  'Freelance': { icon: '💼', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'Investment': { icon: '📈', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  'Business': { icon: '🏢', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  'Gift': { icon: '🎁', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  'Rental': { icon: '🏠', bg: 'bg-teal-100 dark:bg-teal-900/30' },
};

const RecentTransactions = ({ 
  transactions = [], 
  baseCurrency = 'USD',
  onEdit,
  onDelete,
  onViewAll,
  limit = 4 
}) => {
  // Sort transactions by date (most recent first) and limit
  const sortedTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }, [transactions, limit]);

  // Format date for display
  const formatTransactionDate = (date) => {
    const transactionDate = new Date(date);
    if (isToday(transactionDate)) {
      return 'Today';
    }
    if (isYesterday(transactionDate)) {
      return 'Yesterday';
    }
    return format(transactionDate, 'MMM dd, yyyy');
  };

  // Get category icon and styling
  const getCategoryInfo = (category, type) => {
    const categoryKey = category || 'Other';
    const categoryInfo = CATEGORY_ICONS[categoryKey] || CATEGORY_ICONS['Other'];
    
    return {
      icon: categoryInfo.icon,
      bgClass: categoryInfo.bg,
      textClass: type === 'income' 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400',
    };
  };

  return (
    <div className="card p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Recent Transactions
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors flex items-center gap-1"
            aria-label="View all transactions"
          >
            View All
            <FaChevronRight className="text-xs" />
          </button>
        )}
      </div>

      {/* Transaction List */}
      {sortedTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
            <FaArrowDown className="text-2xl text-[var(--text-tertiary)]" />
          </div>
          <p className="text-[var(--text-secondary)] mb-2">No transactions yet</p>
          <p className="text-sm text-[var(--text-tertiary)]">
            Add your first transaction to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTransactions.map((transaction, index) => {
            const categoryInfo = getCategoryInfo(transaction.category, transaction.type);
            const isIncome = transaction.type === 'income';

            return (
              <motion.div
                key={transaction._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] transition-colors group"
              >
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0
                  ${categoryInfo.bgClass}
                `}>
                  {categoryInfo.icon}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {transaction.description || transaction.category}
                    </p>
                    {transaction.category && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                        {transaction.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <span>{formatTransactionDate(transaction.date)}</span>
                    {transaction.description && transaction.category && (
                      <span>•</span>
                    )}
                    {transaction.description && (
                      <span className="truncate">{transaction.description}</span>
                    )}
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex items-center gap-4">
                  <p className={`
                    text-lg font-bold
                    ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                  `}>
                    {isIncome ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount || 0), baseCurrency)}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors rounded-lg hover:bg-[var(--bg-secondary)]"
                        aria-label={`Edit transaction: ${transaction.description || transaction.category}`}
                      >
                        <FaEdit className="text-sm" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(transaction._id)}
                        className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors rounded-lg hover:bg-[var(--bg-secondary)]"
                        aria-label={`Delete transaction: ${transaction.description || transaction.category}`}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;

