import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaFire, FaTrophy, FaStar } from 'react-icons/fa';

const MotivationQuotes = memo(({ 
  completionRate, 
  totalCompleted, 
  streak = 0,
  className = '' 
}) => {
  const quote = useMemo(() => {
    // Determine quote based on metrics
    let quotes = [];
    
    // High completion rate quotes
    if (completionRate >= 90) {
      quotes.push({
        text: "Outstanding! You're a productivity powerhouse! 🚀",
        icon: FaTrophy,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
      });
    } else if (completionRate >= 75) {
      quotes.push({
        text: "Great job! You're staying on track and crushing your goals! 💪",
        icon: FaStar,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20"
      });
    } else if (completionRate >= 50) {
      quotes.push({
        text: "You're making progress! Keep pushing forward! 🌟",
        icon: FaLightbulb,
        color: "text-purple-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20"
      });
    } else {
      quotes.push({
        text: "Every task completed is a step toward success. You've got this! 💯",
        icon: FaFire,
        color: "text-orange-500",
        bgColor: "bg-orange-50 dark:bg-orange-900/20"
      });
    }

    // High total completed
    if (totalCompleted >= 50) {
      quotes.push({
        text: `Wow! ${totalCompleted} tasks completed! You're unstoppable! 🎉`,
        icon: FaTrophy,
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-900/20"
      });
    } else if (totalCompleted >= 20) {
      quotes.push({
        text: `Amazing progress! ${totalCompleted} tasks done and counting! 🔥`,
        icon: FaFire,
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-900/20"
      });
    }

    // Streak quotes
    if (streak >= 7) {
      quotes.push({
        text: `Incredible ${streak}-day streak! Consistency is your superpower! ⚡`,
        icon: FaFire,
        color: "text-orange-500",
        bgColor: "bg-orange-50 dark:bg-orange-900/20"
      });
    } else if (streak >= 3) {
      quotes.push({
        text: `${streak} days strong! Build that streak! 💪`,
        icon: FaStar,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20"
      });
    }

    // Default motivational quote
    if (quotes.length === 0) {
      quotes.push({
        text: "Every task you complete brings you closer to your goals. Keep going! 🌈",
        icon: FaLightbulb,
        color: "text-purple-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20"
      });
    }

    // Return random quote from matching quotes
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [completionRate, totalCompleted, streak]);

  const Icon = quote.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-4 ${quote.bgColor} border-l-4 ${quote.color.replace('text-', 'border-')} ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${quote.bgColor} flex items-center justify-center`}>
          <Icon className={`${quote.color} text-lg`} />
        </div>
        <p className="text-sm md:text-base font-medium text-[var(--text-primary)] flex-1">
          {quote.text}
        </p>
      </div>
    </motion.div>
  );
});

MotivationQuotes.displayName = 'MotivationQuotes';

export default MotivationQuotes;

