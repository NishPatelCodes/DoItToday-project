import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import goalRoutes from './routes/goals.js';
import friendRoutes from './routes/friends.js';
import analyticsRoutes from './routes/analytics.js';
import habitRoutes from './routes/habits.js';
import focusRoutes from './routes/focus.js';
import reactionRoutes from './routes/reactions.js';
import smartPlannerRoutes from './routes/smartPlanner.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://*.vercel.app',
    'https://*.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/smart-planner', smartPlannerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server first, then connect to MongoDB
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Connect to MongoDB
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doittoday')
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.error('⚠️  Make sure MongoDB is running and the connection string is correct');
      console.error('   Default: mongodb://localhost:27017/doittoday');
    });
});

export default app;

