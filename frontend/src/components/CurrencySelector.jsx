import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaGlobe } from 'react-icons/fa';
import { CURRENCIES, getCurrencySymbol } from '../utils/currencyFormatter';

const CurrencySelector = ({ 
  value, 
  onChange, 
  className = '',
  size = 'md' // 'sm' | 'md' | 'lg'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(value || 'USD');

  useEffect(() => {
    setSelectedCurrency(value || 'USD');
  }, [value]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5',
  };

  const handleSelect = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    onChange?.(currencyCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.currency-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedCurrencyInfo = CURRENCIES[selectedCurrency] || CURRENCIES.USD;

  return (
    <div className={`relative currency-selector ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2
          ${sizeClasses[size]}
          rounded-lg
          bg-[var(--bg-secondary)]
          border border-[var(--border-color)]
          text-[var(--text-primary)]
          hover:border-[var(--accent-primary)]/50
          focus:outline-none
          focus:ring-2
          focus:ring-[var(--accent-primary)]/30
          transition-all
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`Currency selector. Current currency: ${selectedCurrencyInfo.name}`}
        `}
      >
        <FaGlobe className="text-[var(--text-secondary)]" />
        <span className="font-medium">
          {selectedCurrencyInfo.symbol} {selectedCurrency}
        </span>
        <FaChevronDown 
          className={`text-[var(--text-secondary)] text-xs transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.ul
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="listbox"
              className={`
                absolute top-full mt-2 right-0 z-20
                bg-[var(--bg-secondary)]
                border border-[var(--border-color)]
                rounded-lg
                shadow-lg
                min-w-[200px]
                max-h-64
                overflow-y-auto
                focus:outline-none
              `}
            >
              {Object.values(CURRENCIES).map((currency) => (
                <li key={currency.code} role="option">
                  <button
                    onClick={() => handleSelect(currency.code)}
                    className={`
                      w-full text-left px-4 py-2.5
                      flex items-center justify-between
                      text-sm
                      transition-colors
                      ${
                        selectedCurrency === currency.code
                          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                      }
                    `}
                    aria-selected={selectedCurrency === currency.code}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-base">{currency.symbol}</span>
                      <div>
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {currency.name}
                        </div>
                      </div>
                    </div>
                    {selectedCurrency === currency.code && (
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                    )}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySelector;

