import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown, FaCalendarAlt } from 'react-icons/fa';
import { subDays, startOfDay, endOfDay, format, startOfMonth, endOfMonth, 
  startOfYear, endOfYear, subMonths, subYears } from 'date-fns';
import { formatCurrency } from '../utils/currencyFormatter';

const CashFlowBars = ({ transactions = [], baseCurrency = 'USD', period = '30days' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [barAnimation, setBarAnimation] = useState(false);

  // Time period options
  const periodOptions = [
    { value: '30days', label: 'Past 30 Days', days: 30 },
    { value: '3months', label: 'Past 3 Months', days: 90 },
    { value: '6months', label: 'Past 6 Months', days: 180 },
    { value: '1year', label: 'Past 1 Year', days: 365 },
    { value: 'all', label: 'All Time', days: null },
  ];

  // Calculate income and expenses for selected period
  const { income, expenses, netCashFlow } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { income: 0, expenses: 0, netCashFlow: 0 };
    }

    const now = new Date();
    let startDate = new Date();

    // Determine start date based on period
    const periodOption = periodOptions.find(p => p.value === selectedPeriod);
    if (periodOption) {
      if (periodOption.days === null) {
        // All time
        startDate = new Date(0); // Beginning of time
      } else {
        startDate = subDays(now, periodOption.days);
      }
    } else {
      startDate = subDays(now, 30); // Default to 30 days
    }

    startDate = startOfDay(startDate);
    const endDate = endOfDay(now);

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const net = totalIncome - totalExpenses;

    return {
      income: totalIncome,
      expenses: totalExpenses,
      netCashFlow: net,
    };
  }, [transactions, selectedPeriod]);

  // Trigger animation when values change
  useEffect(() => {
    setBarAnimation(false);
    setTimeout(() => setBarAnimation(true), 50);
  }, [income, expenses, selectedPeriod]);

  // Calculate bar heights (proportional to the larger value)
  const maxValue = Math.max(income, expenses, Math.abs(netCashFlow)) || 1;
  const incomeHeight = (income / maxValue) * 100;
  const expenseHeight = (expenses / maxValue) * 100;
  const netHeight = (Math.abs(netCashFlow) / maxValue) * 100;

  // Determine if net is positive or negative
  const isPositive = netCashFlow >= 0;

  return (
    <div className="card p-6 rounded-2xl">
      {/* Header with Period Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Cash Flow
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Income vs Expenses Overview
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${
                  selectedPeriod === option.value
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                }
              `}
              aria-pressed={selectedPeriod === option.value}
              aria-label={`View ${option.label}`}
            >
              {option.label.split(' ')[0]} {/* Show first word only for space */}
            </button>
          ))}
        </div>
      </div>

      {/* Bars Container */}
      <div className="space-y-8">
        {/* Income and Expense Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <FaArrowUp className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Income</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(income, baseCurrency)}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative h-16 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: barAnimation ? `${incomeHeight}%` : 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {income > 0 && (
                  <span className="text-sm font-semibold text-[var(--text-primary)] z-10">
                    {((income / maxValue) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Expense Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FaArrowDown className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Expenses</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(expenses, baseCurrency)}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative h-16 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: barAnimation ? `${expenseHeight}%` : 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-red-600 rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {expenses > 0 && (
                  <span className="text-sm font-semibold text-[var(--text-primary)] z-10">
                    {((expenses / maxValue) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="pt-6 border-t border-[var(--border-color)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isPositive 
                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                    : 'bg-orange-100 dark:bg-orange-900/30'
                  }
                `}>
                  <FaCalendarAlt className={isPositive ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'} />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Net Cash Flow</p>
                  <p className={`text-2xl font-bold ${
                    isPositive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {isPositive ? '+' : ''}{formatCurrency(netCashFlow, baseCurrency)}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative h-12 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: barAnimation ? `${netHeight}%` : 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className={`
                  absolute inset-y-0 left-0 rounded-lg
                  ${isPositive 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-orange-500 to-orange-600'
                  }
                `}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {netCashFlow !== 0 && (
                  <span className="text-sm font-semibold text-[var(--text-primary)] z-10">
                    {isPositive ? 'Surplus' : 'Deficit'} • {((Math.abs(netCashFlow) / maxValue) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowBars;

