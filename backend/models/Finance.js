import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Account information
  accountInfo: {
    accountType: {
      type: String,
      enum: ['checking', 'savings', 'credit', 'cash', 'investment', 'other'],
      default: 'checking',
    },
    accountName: {
      type: String,
      trim: true,
      default: 'Primary Account',
    },
    initialBalance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    isSetupComplete: {
      type: Boolean,
      default: false,
    },
    setupDate: {
      type: Date,
    },
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
      },
      category: {
        type: String,
        required: true,
        trim: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      description: {
        type: String,
        trim: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  savingsGoals: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      targetAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      currentAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
      targetDate: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['active', 'completed', 'paused'],
        default: 'active',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  monthlyBudget: {
    income: {
      type: Number,
      default: 0,
    },
    expenses: {
      type: Number,
      default: 0,
    },
    month: {
      type: Number,
      default: new Date().getMonth() + 1,
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
  },
  // Account balance history for trend tracking
  balanceHistory: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      balance: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate total income for a period
financeSchema.methods.getTotalIncome = function (startDate, endDate) {
  return this.transactions
    .filter(
      (t) =>
        t.type === 'income' &&
        t.date >= startDate &&
        t.date <= endDate
    )
    .reduce((sum, t) => sum + t.amount, 0);
};

// Calculate total expenses for a period
financeSchema.methods.getTotalExpenses = function (startDate, endDate) {
  return this.transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.date >= startDate &&
        t.date <= endDate
    )
    .reduce((sum, t) => sum + t.amount, 0);
};

// Calculate balance for a period
financeSchema.methods.getBalance = function (startDate, endDate) {
  return this.getTotalIncome(startDate, endDate) - this.getTotalExpenses(startDate, endDate);
};

// Update savings goal progress
financeSchema.methods.updateSavingsGoal = function (goalId, amount) {
  const goal = this.savingsGoals.id(goalId);
  if (goal) {
    goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'completed';
    }
  }
};

export default mongoose.model('Finance', financeSchema);

