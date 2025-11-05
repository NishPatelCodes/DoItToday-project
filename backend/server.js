import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import goalRoutes from './routes/goals.js';
import friendRoutes from './routes/friends.js';
import analyticsRoutes from './routes/analytics.js';
import habitRoutes from './routes/habits.js';
import focusRoutes from './routes/focus.js';
import reactionRoutes from './routes/reactions.js';
import smartPlannerRoutes from './routes/smartPlanner.js';
import oauthRoutes from './routes/oauth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://*.vercel.app',
      'https://*.netlify.app'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // Handle wildcard patterns
        const pattern = allowed.replace('*', '.*');
        const regex = new RegExp(`^https://${pattern}$`);
        return regex.test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      // Log for debugging
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(null, true); // Allow all for now - change to callback(new Error('Not allowed')) for strict
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', oauthRoutes); // OAuth routes (no /api prefix for OAuth callbacks)
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
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    console.error('⚠️  Please set MONGODB_URI in your Render environment variables');
    console.error('   Example: mongodb+srv://username:password@cluster.mongodb.net/dbname');
    process.exit(1);
  }
  
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.error('⚠️  Make sure your MONGODB_URI is correct and MongoDB Atlas allows connections');
      console.error('   Check: MongoDB Atlas → Network Access → IP Whitelist (allow all: 0.0.0.0/0)');
    });
});

export default app;

