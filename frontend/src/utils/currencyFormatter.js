// Currency formatting and conversion utilities
// Supports multiple currencies with proper formatting

// Currency configuration
export const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', decimalPlaces: 2 },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', decimalPlaces: 2 },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound', decimalPlaces: 2 },
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee', decimalPlaces: 2 },
  CAD: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar', decimalPlaces: 2 },
  AUD: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar', decimalPlaces: 2 },
  JPY: { symbol: '¥', code: 'JPY', name: 'Japanese Yen', decimalPlaces: 0 },
};

// Mock exchange rates (in production, fetch from API like exchangeratesapi.io)
// Rates are relative to USD as base
const MOCK_EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.15,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149.50,
};

// Cache for exchange rates
let exchangeRatesCache = null;
let exchangeRatesCacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch exchange rates (mock implementation - replace with real API)
 */
export const fetchExchangeRates = async () => {
  // Check cache first
  if (exchangeRatesCache && exchangeRatesCacheTime) {
    const cacheAge = Date.now() - exchangeRatesCacheTime;
    if (cacheAge < CACHE_DURATION) {
      return exchangeRatesCache;
    }
  }

  try {
    // In production, replace with real API call
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    // const data = await response.json();
    // exchangeRatesCache = data.rates;
    
    // For now, use mock rates with slight randomization to simulate real API
    const rates = { ...MOCK_EXCHANGE_RATES };
    
    // Add small random variation (±2%) to simulate real-world fluctuations
    Object.keys(rates).forEach(key => {
      if (key !== 'USD') {
        const variation = 1 + (Math.random() * 0.04 - 0.02); // -2% to +2%
        rates[key] = rates[key] * variation;
      }
    });

    exchangeRatesCache = rates;
    exchangeRatesCacheTime = Date.now();
    
    // Store in localStorage as fallback
    try {
      localStorage.setItem('exchangeRates', JSON.stringify({
        rates: exchangeRatesCache,
        timestamp: exchangeRatesCacheTime,
      }));
    } catch (e) {
      // localStorage might be disabled
    }

    return exchangeRatesCache;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Try to load from localStorage as fallback
    try {
      const cached = localStorage.getItem('exchangeRates');
      if (cached) {
        const { rates, timestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        if (cacheAge < CACHE_DURATION * 24) { // Accept 24-hour old cache
          exchangeRatesCache = rates;
          exchangeRatesCacheTime = timestamp;
          return rates;
        }
      }
    } catch (e) {
      // localStorage parse error
    }

    // Fallback to mock rates if API fails
    return MOCK_EXCHANGE_RATES;
  }
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;

  const rates = await fetchExchangeRates();
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / (rates[fromCurrency] || 1);
  const convertedAmount = usdAmount * (rates[toCurrency] || 1);

  return convertedAmount;
};

/**
 * Format currency amount with proper symbol and locale formatting
 */
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  const currencyConfig = CURRENCIES[currency] || CURRENCIES.USD;
  const { 
    showSymbol = true, 
    useLocale = true,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  // Ensure decimal places are valid (between 0 and 20)
  const defaultDecimalPlaces = Math.max(0, Math.min(20, currencyConfig.decimalPlaces || 2));
  
  // Validate and clamp fraction digits to valid range (0-20)
  const minDigits = minimumFractionDigits !== undefined 
    ? Math.max(0, Math.min(20, Math.floor(minimumFractionDigits) || 0))
    : defaultDecimalPlaces;
  
  const maxDigits = maximumFractionDigits !== undefined
    ? Math.max(0, Math.min(20, Math.floor(maximumFractionDigits) || 0))
    : defaultDecimalPlaces;

  // Ensure minDigits <= maxDigits
  const finalMinDigits = Math.min(minDigits, maxDigits);
  const finalMaxDigits = Math.max(minDigits, maxDigits);

  const formattedAmount = useLocale
    ? new Intl.NumberFormat('en-US', {
        minimumFractionDigits: finalMinDigits,
        maximumFractionDigits: finalMaxDigits,
        style: 'decimal',
      }).format(amount)
    : amount.toFixed(defaultDecimalPlaces);

  if (showSymbol) {
    // For currencies with prefix symbols
    if (['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'].includes(currency)) {
      return `${currencyConfig.symbol}${formattedAmount}`;
    }
    // For currencies with suffix symbols (if any)
    return `${formattedAmount} ${currencyConfig.symbol}`;
  }

  return formattedAmount;
};

/**
 * Format currency with conversion (if needed)
 */
export const formatCurrencyWithConversion = async (
  amount,
  fromCurrency,
  toCurrency,
  options = {}
) => {
  if (fromCurrency === toCurrency) {
    return formatCurrency(amount, toCurrency, options);
  }

  const convertedAmount = await convertCurrency(amount, fromCurrency, toCurrency);
  return formatCurrency(convertedAmount, toCurrency, options);
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency = 'USD') => {
  return CURRENCIES[currency]?.symbol || CURRENCIES.USD.symbol;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value, currency = 'USD') => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;

  // Remove currency symbols and formatting
  const cleaned = value
    .replace(/[^\d.-]/g, '')
    .replace(/,/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

