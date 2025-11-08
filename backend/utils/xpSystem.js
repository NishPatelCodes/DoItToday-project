/**
 * Centralized XP and Level System
 * This ensures consistent XP/level calculations across the entire application
 */

/**
 * Calculate level from total XP
 * Formula: Level = floor(sqrt(XP / 100)) + 1
 * This creates a progressive leveling system where:
 * - Level 1: 0-99 XP (100 XP needed)
 * - Level 2: 100-399 XP (300 XP needed, total 400)
 * - Level 3: 400-899 XP (500 XP needed, total 900)
 * - Level 4: 900-1599 XP (700 XP needed, total 1600)
 * - And so on...
 * 
 * Alternative simpler formula: Level = floor(XP / 100) + 1
 * - Level 1: 0-99 XP
 * - Level 2: 100-199 XP
 * - Level 3: 200-299 XP
 * This is simpler and more predictable
 */
export const calculateLevelFromXP = (xp) => {
  if (!xp || xp < 0) return 1;
  return Math.floor(xp / 100) + 1;
};

/**
 * Calculate XP needed for a specific level
 */
export const getXPForLevel = (level) => {
  if (level <= 1) return 0;
  return (level - 1) * 100;
};

/**
 * Calculate XP needed for next level
 */
export const getXPForNextLevel = (currentLevel) => {
  return currentLevel * 100;
};

/**
 * Calculate current level progress (XP within current level)
 */
export const getCurrentLevelXP = (xp, level) => {
  const xpForCurrentLevel = getXPForLevel(level);
  return xp - xpForCurrentLevel;
};

/**
 * Calculate progress percentage to next level
 */
export const getLevelProgress = (xp, level) => {
  const currentLevelXP = getCurrentLevelXP(xp, level);
  const xpNeededForNext = getXPForNextLevel(level);
  return Math.min(100, (currentLevelXP / xpNeededForNext) * 100);
};

/**
 * Award XP to user and update level
 * This ensures level is always calculated from XP
 */
export const awardXP = async (user, xpAmount, reason = '') => {
  if (!user || xpAmount <= 0) return { xpGained: 0, levelUp: false, newLevel: user?.level || 1 };
  
  const oldXP = user.xp || 0;
  const oldLevel = calculateLevelFromXP(oldXP);
  user.xp = oldXP + xpAmount;
  const newLevel = calculateLevelFromXP(user.xp);
  const levelUp = newLevel > oldLevel;
  
  // Update level to match calculated level
  user.level = newLevel;
  
  await user.save();
  
  return {
    xpGained: xpAmount,
    levelUp,
    newLevel,
    oldLevel,
    oldXP,
    totalXP: user.xp,
    reason
  };
};

/**
 * Deduct XP from user and update level
 */
export const deductXP = async (user, xpAmount, reason = '') => {
  if (!user || xpAmount <= 0) return { xpLost: 0, levelDown: false, newLevel: user?.level || 1 };
  
  const oldLevel = calculateLevelFromXP(user.xp || 0);
  user.xp = Math.max(0, (user.xp || 0) - xpAmount);
  const newLevel = calculateLevelFromXP(user.xp);
  const levelDown = newLevel < oldLevel;
  
  // Update level to match calculated level
  user.level = newLevel;
  
  await user.save();
  
  return {
    xpLost: xpAmount,
    levelDown,
    newLevel,
    oldLevel,
    totalXP: user.xp,
    reason
  };
};

/**
 * Recalculate level from XP (for fixing inconsistencies)
 */
export const recalculateLevel = async (user) => {
  if (!user) return;
  
  const calculatedLevel = calculateLevelFromXP(user.xp || 0);
  const levelChanged = user.level !== calculatedLevel;
  
  user.level = calculatedLevel;
  await user.save();
  
  return {
    oldLevel: user.level,
    newLevel: calculatedLevel,
    levelChanged,
    xp: user.xp
  };
};

/**
 * XP Rewards Configuration
 */
export const XP_REWARDS = {
  // Task completion (base XP, multipliers apply)
  TASK_LOW: 5,
  TASK_MEDIUM: 10,
  TASK_HIGH: 20,
  
  // Habit completion
  HABIT_COMPLETION: 5,
  HABIT_STREAK_BONUS: 2, // Bonus per day of streak (capped at 10)
  
  // Focus sessions
  FOCUS_SESSION: 10,
  FOCUS_SESSION_LONG: 20, // 25+ minutes
  
  // Goals
  GOAL_COMPLETION: 50,
  GOAL_MILESTONE: 10, // Every 25% progress
  
  // Gratitude
  GRATITUDE_ENTRY: 5,
  GRATITUDE_STREAK_BONUS: 3, // Bonus for daily gratitude streak
  
  // Streak bonuses
  STREAK_7_DAYS: 25,
  STREAK_30_DAYS: 100,
  STREAK_100_DAYS: 500,
  
  // Daily bonuses
  DAILY_LOGIN: 5,
  FIRST_TASK_OF_DAY: 10,
  ALL_TASKS_COMPLETE: 25,
};

/**
 * Calculate streak bonus multiplier
 */
export const getStreakMultiplier = (streak) => {
  if (streak >= 100) return 1.5; // 50% bonus
  if (streak >= 30) return 1.3; // 30% bonus
  if (streak >= 7) return 1.2; // 20% bonus
  return 1.0; // No bonus
};

/**
 * Calculate XP with streak bonus
 */
export const calculateXPWithBonus = (baseXP, streak = 0) => {
  const multiplier = getStreakMultiplier(streak);
  return Math.floor(baseXP * multiplier);
};

/**
 * Get XP breakdown for display
 */
export const getXPBreakdown = (xpAmount, streak = 0) => {
  const multiplier = getStreakMultiplier(streak);
  const baseXP = Math.floor(xpAmount / multiplier);
  const bonusXP = xpAmount - baseXP;
  
  return {
    baseXP,
    bonusXP,
    multiplier: multiplier.toFixed(1),
    totalXP: xpAmount
  };
};

export default {
  calculateLevelFromXP,
  getXPForLevel,
  getXPForNextLevel,
  getCurrentLevelXP,
  getLevelProgress,
  awardXP,
  deductXP,
  recalculateLevel,
  XP_REWARDS,
  getStreakMultiplier,
  calculateXPWithBonus,
  getXPBreakdown,
};

