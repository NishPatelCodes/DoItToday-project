import express from 'express';
import Finance from '../models/Finance.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Setup account information
router.post('/setup', authenticate, async (req, res) => {
  try {
    const { accountType, accountName, initialBalance, currency, bankName, accountNumber } = req.body;
    
    let finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      finance = new Finance({
        userId: req.user._id,
        transactions: [],
        savingsGoals: [],
        monthlyBudget: {
          income: 0,
          expenses: 0,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      });
    }

    // Parse initialBalance to number
    const parsedInitialBalance = parseFloat(initialBalance) || 0;

    // Update account info
    finance.accountInfo = {
      accountType: accountType || 'checking',
      accountName: accountName || 'Primary Account',
      initialBalance: parsedInitialBalance,
      currency: currency || 'USD',
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      isSetupComplete: true,
      setupDate: new Date(),
    };

    // Add initial balance to history
    finance.balanceHistory.push({
      date: new Date(),
      balance: parsedInitialBalance,
    });

    finance.updatedAt = new Date();
    await finance.save();

    res.json(finance);
  } catch (error) {
    console.error('Error setting up finance account:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update account information
router.put('/account', authenticate, async (req, res) => {
  try {
    const finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      return res.status(404).json({ message: 'Finance data not found' });
    }

    finance.accountInfo = {
      ...finance.accountInfo,
      ...req.body,
      isSetupComplete: true,
    };

    finance.updatedAt = new Date();
    await finance.save();

    res.json(finance);
  } catch (error) {
    console.error('Error updating account info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get finance data for user
router.get('/', authenticate, async (req, res) => {
  try {
    let finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      // Create finance document if it doesn't exist
      finance = new Finance({
        userId: req.user._id,
        transactions: [],
        savingsGoals: [],
        monthlyBudget: {
          income: 0,
          expenses: 0,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
        accountInfo: {
          isSetupComplete: false,
        },
      });
      await finance.save();
    }

    res.json(finance);
  } catch (error) {
    console.error('Error fetching finance data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add transaction
router.post('/transactions', authenticate, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    // Validate required fields
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type. Must be "income" or "expense"' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Category is required' });
    }

    // Parse and validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a valid number greater than 0' });
    }

    let finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      finance = new Finance({
        userId: req.user._id,
        transactions: [],
        savingsGoals: [],
        monthlyBudget: {
          income: 0,
          expenses: 0,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      });
    }

    const transaction = {
      type,
      category: category.trim(),
      amount: parsedAmount, // Use parsed amount
      description: description ? description.trim() : '',
      date: date ? new Date(date) : new Date(),
    };

    finance.transactions.push(transaction);
    
    // Update monthly budget
    const transactionDate = new Date(transaction.date);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    if (transactionDate.getMonth() + 1 === currentMonth && transactionDate.getFullYear() === currentYear) {
      if (type === 'income') {
        finance.monthlyBudget.income += amount;
      } else {
        finance.monthlyBudget.expenses += amount;
      }
    }

    // Calculate current balance and add to history (once per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if we already have a balance entry for today
    const todayHistory = finance.balanceHistory.find(
      entry => entry.date.toISOString().split('T')[0] === todayStr
    );

    if (!todayHistory) {
      // Calculate current balance
      const initialBalance = finance.accountInfo?.initialBalance || 0;
      const totalIncome = finance.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = finance.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const currentBalance = initialBalance + totalIncome - totalExpenses;

      finance.balanceHistory.push({
        date: new Date(),
        balance: currentBalance,
      });

      // Keep only last 365 days of history
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      finance.balanceHistory = finance.balanceHistory.filter(
        entry => entry.date >= oneYearAgo
      );
    }

    finance.updatedAt = new Date();
    await finance.save();

    res.status(201).json(finance);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update transaction
router.put('/transactions/:id', authenticate, async (req, res) => {
  try {
    const finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      return res.status(404).json({ message: 'Finance data not found' });
    }

    const transaction = finance.transactions.id(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Validate and prepare update data
    const updateData = {};
    
    if (req.body.type !== undefined) {
      if (!['income', 'expense'].includes(req.body.type)) {
        return res.status(400).json({ message: 'Invalid transaction type. Must be "income" or "expense"' });
      }
      updateData.type = req.body.type;
    }

    if (req.body.category !== undefined) {
      if (!req.body.category || !req.body.category.trim()) {
        return res.status(400).json({ message: 'Category is required' });
      }
      updateData.category = req.body.category.trim();
    }

    if (req.body.amount !== undefined) {
      const parsedAmount = parseFloat(req.body.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a valid number greater than 0' });
      }
      updateData.amount = parsedAmount;
    }

    if (req.body.description !== undefined) {
      updateData.description = req.body.description ? req.body.description.trim() : '';
    }

    if (req.body.date !== undefined) {
      updateData.date = req.body.date ? new Date(req.body.date) : new Date();
    }

    // Update transaction
    Object.assign(transaction, updateData);
    
    // Recalculate balance history
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const todayHistory = finance.balanceHistory.find(
      entry => entry.date.toISOString().split('T')[0] === todayStr
    );

    if (!todayHistory) {
      const initialBalance = finance.accountInfo?.initialBalance || 0;
      const totalIncome = finance.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = finance.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const currentBalance = initialBalance + totalIncome - totalExpenses;

      finance.balanceHistory.push({
        date: new Date(),
        balance: currentBalance,
      });

      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      finance.balanceHistory = finance.balanceHistory.filter(
        entry => entry.date >= oneYearAgo
      );
    }
    
    finance.updatedAt = new Date();
    await finance.save();

    res.json(finance);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete transaction
router.delete('/transactions/:id', authenticate, async (req, res) => {
  try {
    const finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      return res.status(404).json({ message: 'Finance data not found' });
    }

    const transaction = finance.transactions.id(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update monthly budget before deleting
    const transactionDate = new Date(transaction.date);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    if (transactionDate.getMonth() + 1 === currentMonth && transactionDate.getFullYear() === currentYear) {
      if (transaction.type === 'income') {
        finance.monthlyBudget.income = Math.max(0, finance.monthlyBudget.income - transaction.amount);
      } else {
        finance.monthlyBudget.expenses = Math.max(0, finance.monthlyBudget.expenses - transaction.amount);
      }
    }

    finance.transactions.pull(req.params.id);
    
    // Recalculate balance history after deletion
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const todayHistory = finance.balanceHistory.find(
      entry => entry.date.toISOString().split('T')[0] === todayStr
    );

    if (!todayHistory) {
      const initialBalance = finance.accountInfo?.initialBalance || 0;
      const totalIncome = finance.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = finance.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const currentBalance = initialBalance + totalIncome - totalExpenses;

      finance.balanceHistory.push({
        date: new Date(),
        balance: currentBalance,
      });

      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      finance.balanceHistory = finance.balanceHistory.filter(
        entry => entry.date >= oneYearAgo
      );
    }
    
    finance.updatedAt = new Date();
    await finance.save();

    res.json(finance);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add savings goal
router.post('/savings-goals', authenticate, async (req, res) => {
  try {
    const { name, targetAmount, targetDate } = req.body;

    let finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      finance = new Finance({
        userId: req.user._id,
        transactions: [],
        savingsGoals: [],
        monthlyBudget: {
          income: 0,
          expenses: 0,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      });
    }

    const savingsGoal = {
      name,
      targetAmount,
      currentAmount: 0,
      targetDate: targetDate ? new Date(targetDate) : null,
      status: 'active',
    };

    finance.savingsGoals.push(savingsGoal);
    finance.updatedAt = new Date();
    await finance.save();

    res.status(201).json(finance);
  } catch (error) {
    console.error('Error adding savings goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update savings goal
router.put('/savings-goals/:id', authenticate, async (req, res) => {
  try {
    const finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      return res.status(404).json({ message: 'Finance data not found' });
    }

    const goal = finance.savingsGoals.id(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    Object.assign(goal, req.body);
    
    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'completed';
    }

    finance.updatedAt = new Date();
    await finance.save();

    res.json(finance);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete savings goal
router.delete('/savings-goals/:id', authenticate, async (req, res) => {
  try {
    const finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      return res.status(404).json({ message: 'Finance data not found' });
    }

    finance.savingsGoals.pull(req.params.id);
    finance.updatedAt = new Date();
    await finance.save();

    res.json(finance);
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update monthly budget
router.put('/monthly-budget', authenticate, async (req, res) => {
  try {
    const { income, expenses } = req.body;

    let finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      finance = new Finance({
        userId: req.user._id,
        transactions: [],
        savingsGoals: [],
        monthlyBudget: {
          income: income || 0,
          expenses: expenses || 0,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      });
    } else {
      finance.monthlyBudget.income = income || finance.monthlyBudget.income;
      finance.monthlyBudget.expenses = expenses || finance.monthlyBudget.expenses;
      finance.monthlyBudget.month = new Date().getMonth() + 1;
      finance.monthlyBudget.year = new Date().getFullYear();
    }

    finance.updatedAt = new Date();
    await finance.save();

    res.json(finance);
  } catch (error) {
    console.error('Error updating monthly budget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get monthly statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const finance = await Finance.findOne({ userId: req.user._id });

    if (!finance) {
      return res.json({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        savingsGoals: [],
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalIncome = finance.getTotalIncome(startOfMonth, endOfMonth);
    const totalExpenses = finance.getTotalExpenses(startOfMonth, endOfMonth);
    const balance = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      balance,
      savingsGoals: finance.savingsGoals || [],
      monthlyBudget: finance.monthlyBudget || {},
    });
  } catch (error) {
    console.error('Error fetching finance stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

