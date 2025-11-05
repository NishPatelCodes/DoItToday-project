import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

// Google OAuth Routes
router.get(
  '/google',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Google OAuth is not configured')}`);
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`, session: false }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with user data
      const params = new URLSearchParams({
        token,
        userId: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        streak: req.user.streak || 0,
        xp: req.user.xp || 0,
        level: req.user.level || 1,
        totalTasksCompleted: req.user.totalTasksCompleted || 0,
      });

      res.redirect(`${FRONTEND_URL}/auth/callback?${params.toString()}`);
    } catch (error) {
      res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Authentication failed')}`);
    }
  }
);

// Apple OAuth Routes
router.get(
  '/apple',
  (req, res, next) => {
    if (!process.env.APPLE_CLIENT_ID || !process.env.APPLE_TEAM_ID || !process.env.APPLE_KEY_ID) {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Apple OAuth is not configured')}`);
    }
    passport.authenticate('apple')(req, res, next);
  }
);

router.post(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: `${FRONTEND_URL}/login?error=apple_auth_failed`, session: false }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with user data
      const params = new URLSearchParams({
        token,
        userId: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        streak: req.user.streak || 0,
        xp: req.user.xp || 0,
        level: req.user.level || 1,
        totalTasksCompleted: req.user.totalTasksCompleted || 0,
      });

      res.redirect(`${FRONTEND_URL}/auth/callback?${params.toString()}`);
    } catch (error) {
      res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent('Authentication failed')}`);
    }
  }
);

export default router;

