import mongoose from 'mongoose';

const gratitudeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  entries: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 3 && v.every(entry => entry.trim().length > 0);
      },
      message: 'Must provide exactly 3 non-empty gratitude entries',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one entry per user per day
gratitudeSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save hook to normalize date to midnight UTC
gratitudeSchema.pre('save', function(next) {
  if (this.isModified('date')) {
    const date = new Date(this.date);
    date.setUTCHours(0, 0, 0, 0);
    this.date = date;
  }
  this.updatedAt = Date.now();
  next();
});

// Method to get date as YYYY-MM-DD string
gratitudeSchema.methods.getDateString = function() {
  const date = new Date(this.date);
  return date.toISOString().split('T')[0];
};

export default mongoose.model('Gratitude', gratitudeSchema);

