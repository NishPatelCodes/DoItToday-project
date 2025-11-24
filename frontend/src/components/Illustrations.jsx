import { motion } from 'framer-motion';

/**
 * Reusable Illustration Components
 * Lightweight SVG illustrations for empty states and user guidance
 */

// Empty Tasks Illustration
export const EmptyTasksIllustration = ({ className = "w-48 h-48 mx-auto mb-4" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="var(--accent-primary)" fillOpacity="0.1" />
      
      {/* Clipboard/Notepad */}
      <rect x="70" y="50" width="60" height="80" rx="4" fill="var(--bg-secondary)" stroke="var(--accent-primary)" strokeWidth="2" />
      <line x1="80" y1="70" x2="120" y2="70" stroke="var(--accent-primary)" strokeWidth="2" strokeOpacity="0.3" />
      <line x1="80" y1="85" x2="120" y2="85" stroke="var(--accent-primary)" strokeWidth="2" strokeOpacity="0.3" />
      <line x1="80" y1="100" x2="110" y2="100" stroke="var(--accent-primary)" strokeWidth="2" strokeOpacity="0.3" />
      
      {/* Checkmark circle */}
      <circle cx="85" cy="65" r="8" fill="var(--accent-primary)" fillOpacity="0.2" />
      <path d="M82 65 L84.5 67.5 L88 64" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Plus icon */}
      <circle cx="150" cy="120" r="20" fill="var(--accent-primary)" />
      <line x1="150" y1="110" x2="150" y2="130" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <line x1="140" y1="120" x2="160" y2="120" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </motion.div>
);

// Empty Goals Illustration
export const EmptyGoalsIllustration = ({ className = "w-48 h-48 mx-auto mb-4" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="var(--accent-primary)" fillOpacity="0.1" />
      
      {/* Target/Bullseye */}
      <circle cx="100" cy="100" r="50" stroke="var(--accent-primary)" strokeWidth="3" fill="none" />
      <circle cx="100" cy="100" r="35" stroke="var(--accent-primary)" strokeWidth="2" fill="none" />
      <circle cx="100" cy="100" r="20" fill="var(--accent-primary)" />
      
      {/* Arrow */}
      <path d="M100 30 L100 70 M100 30 L90 40 M100 30 L110 40" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Sparkles */}
      <circle cx="60" cy="60" r="3" fill="var(--accent-primary)" fillOpacity="0.6" />
      <circle cx="140" cy="60" r="3" fill="var(--accent-primary)" fillOpacity="0.6" />
      <circle cx="60" cy="140" r="3" fill="var(--accent-primary)" fillOpacity="0.6" />
      <circle cx="140" cy="140" r="3" fill="var(--accent-primary)" fillOpacity="0.6" />
    </svg>
  </motion.div>
);

// Empty Calendar Illustration
export const EmptyCalendarIllustration = ({ className = "w-40 h-40 mx-auto mb-4" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="var(--accent-primary)" fillOpacity="0.1" />
      
      {/* Calendar */}
      <rect x="60" y="60" width="80" height="90" rx="4" fill="var(--bg-secondary)" stroke="var(--accent-primary)" strokeWidth="2" />
      
      {/* Calendar header */}
      <rect x="60" y="60" width="80" height="25" fill="var(--accent-primary)" fillOpacity="0.2" />
      <line x1="100" y1="60" x2="100" y2="85" stroke="var(--accent-primary)" strokeWidth="1" />
      
      {/* Calendar grid */}
      <line x1="70" y1="100" x2="130" y2="100" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="70" y1="115" x2="130" y2="115" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="70" y1="130" x2="130" y2="130" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="85" y1="85" x2="85" y2="150" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="100" y1="85" x2="100" y2="150" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="115" y1="85" x2="115" y2="150" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
      
      {/* Plus icon */}
      <circle cx="150" cy="120" r="15" fill="var(--accent-primary)" />
      <line x1="150" y1="112" x2="150" y2="128" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="142" y1="120" x2="158" y2="120" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </motion.div>
);

// No Search Results Illustration
export const NoSearchResultsIllustration = ({ className = "w-40 h-40 mx-auto mb-4" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="var(--accent-primary)" fillOpacity="0.1" />
      
      {/* Magnifying glass */}
      <circle cx="90" cy="90" r="30" stroke="var(--accent-primary)" strokeWidth="3" fill="none" />
      <line x1="110" y1="110" x2="130" y2="130" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" />
      
      {/* Question mark */}
      <text x="100" y="100" fontSize="40" fill="var(--text-tertiary)" textAnchor="middle" dominantBaseline="middle" fontFamily="Arial" fontWeight="bold">?</text>
    </svg>
  </motion.div>
);

// Welcome/Getting Started Illustration
export const WelcomeIllustration = ({ className = "w-56 h-56 mx-auto mb-4" }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className={className}
  >
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill="var(--accent-primary)" fillOpacity="0.1" />
      
      {/* Person/User */}
      <circle cx="100" cy="80" r="25" fill="var(--accent-primary)" fillOpacity="0.3" />
      <path d="M 60 140 Q 60 120 100 120 Q 140 120 140 140" stroke="var(--accent-primary)" strokeWidth="3" fill="none" />
      
      {/* Sparkles around */}
      <circle cx="50" cy="50" r="4" fill="var(--accent-primary)" fillOpacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="150" cy="50" r="4" fill="var(--accent-primary)" fillOpacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="150" r="4" fill="var(--accent-primary)" fillOpacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="150" cy="150" r="4" fill="var(--accent-primary)" fillOpacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="1.5s" repeatCount="indefinite" />
      </circle>
      
      {/* Welcome text indicator */}
      <path d="M 100 50 L 100 40 M 95 45 L 100 40 L 105 45" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </motion.div>
);

// Empty Friends Illustration
export const EmptyFriendsIllustration = ({ className = "w-48 h-48 mx-auto mb-4" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="var(--accent-primary)" fillOpacity="0.1" />
      
      {/* Two people/users */}
      <circle cx="80" cy="80" r="20" fill="var(--accent-primary)" fillOpacity="0.3" />
      <path d="M 50 130 Q 50 110 80 110 Q 110 110 110 130" stroke="var(--accent-primary)" strokeWidth="3" fill="none" />
      
      <circle cx="120" cy="80" r="20" fill="var(--accent-primary)" fillOpacity="0.3" />
      <path d="M 90 130 Q 90 110 120 110 Q 150 110 150 130" stroke="var(--accent-primary)" strokeWidth="3" fill="none" />
      
      {/* Connection line */}
      <line x1="100" y1="80" x2="100" y2="100" stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Plus icon */}
      <circle cx="100" cy="120" r="15" fill="var(--accent-primary)" />
      <line x1="100" y1="112" x2="100" y2="128" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="92" y1="120" x2="108" y2="120" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </motion.div>
);

// Empty Challenges Illustration
export const EmptyChallengesIllustration = ({ className = "w-48 h-48 mx-auto mb-4" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="var(--accent-primary)" fillOpacity="0.1" />
      
      {/* Trophy */}
      <path d="M 80 120 L 80 100 L 70 100 L 70 90 L 90 90 L 90 100 L 110 100 L 110 90 L 130 90 L 130 100 L 120 100 L 120 120 Z" 
            fill="var(--accent-primary)" fillOpacity="0.3" stroke="var(--accent-primary)" strokeWidth="2" />
      <circle cx="100" cy="95" r="8" fill="var(--accent-primary)" />
      
      {/* Flame */}
      <path d="M 100 60 Q 95 70 100 80 Q 105 70 100 60" fill="var(--accent-primary)" />
      
      {/* Stars */}
      <path d="M 60 70 L 62 75 L 67 75 L 63 78 L 65 83 L 60 80 L 55 83 L 57 78 L 53 75 L 58 75 Z" 
            fill="var(--accent-primary)" fillOpacity="0.6" />
      <path d="M 140 70 L 142 75 L 147 75 L 143 78 L 145 83 L 140 80 L 135 83 L 137 78 L 133 75 L 138 75 Z" 
            fill="var(--accent-primary)" fillOpacity="0.6" />
    </svg>
  </motion.div>
);

// Animal Illustrations - Cute productivity mascots
export const CatWorkingIllustration = ({ className = "w-24 h-24" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Cat head */}
      <circle cx="50" cy="45" r="20" fill="var(--text-tertiary)" fillOpacity="0.15" />
      {/* Cat ears */}
      <path d="M 35 30 L 40 20 L 45 30 Z" fill="var(--text-tertiary)" fillOpacity="0.15" />
      <path d="M 55 30 L 60 20 L 65 30 Z" fill="var(--text-tertiary)" fillOpacity="0.15" />
      {/* Cat eyes */}
      <circle cx="45" cy="42" r="2" fill="var(--text-secondary)" />
      <circle cx="55" cy="42" r="2" fill="var(--text-secondary)" />
      {/* Cat nose */}
      <path d="M 50 48 L 48 52 L 52 52 Z" fill="var(--text-secondary)" fillOpacity="0.6" />
      {/* Laptop */}
      <rect x="30" y="65" width="40" height="25" rx="2" fill="var(--bg-tertiary)" stroke="var(--border-color)" strokeWidth="1.5" />
      <rect x="32" y="67" width="36" height="18" rx="1" fill="var(--accent-primary)" fillOpacity="0.1" />
      <line x1="35" y1="72" x2="65" y2="72" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="35" y1="78" x2="55" y2="78" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  </motion.div>
);

export const SquirrelChecklistIllustration = ({ className = "w-24 h-24" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Squirrel body */}
      <ellipse cx="50" cy="60" rx="18" ry="25" fill="var(--text-tertiary)" fillOpacity="0.15" />
      {/* Squirrel head */}
      <circle cx="50" cy="35" r="15" fill="var(--text-tertiary)" fillOpacity="0.15" />
      {/* Squirrel ears */}
      <circle cx="42" cy="28" r="5" fill="var(--text-tertiary)" fillOpacity="0.15" />
      <circle cx="58" cy="28" r="5" fill="var(--text-tertiary)" fillOpacity="0.15" />
      {/* Squirrel tail */}
      <ellipse cx="70" cy="65" rx="12" ry="20" fill="var(--text-tertiary)" fillOpacity="0.15" />
      {/* Eyes */}
      <circle cx="46" cy="33" r="2" fill="var(--text-secondary)" />
      <circle cx="54" cy="33" r="2" fill="var(--text-secondary)" />
      {/* Checklist */}
      <rect x="20" y="50" width="25" height="30" rx="2" fill="var(--bg-tertiary)" stroke="var(--border-color)" strokeWidth="1.5" />
      <line x1="25" y1="58" x2="40" y2="58" stroke="var(--accent-primary)" strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="27" cy="66" r="2" fill="var(--accent-primary)" fillOpacity="0.3" />
      <line x1="25" y1="70" x2="40" y2="70" stroke="var(--accent-primary)" strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="27" cy="78" r="2" fill="var(--accent-primary)" fillOpacity="0.3" />
    </svg>
  </motion.div>
);

export const FoxReadingIllustration = ({ className = "w-24 h-24" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Fox head */}
      <path d="M 50 30 Q 40 25 35 35 Q 30 40 35 50 Q 40 60 50 55 Q 60 60 65 50 Q 70 40 65 35 Q 60 25 50 30" 
            fill="var(--text-tertiary)" fillOpacity="0.15" />
      {/* Fox ears */}
      <path d="M 40 25 L 38 15 L 42 20 Z" fill="var(--text-tertiary)" fillOpacity="0.15" />
      <path d="M 60 25 L 62 15 L 58 20 Z" fill="var(--text-tertiary)" fillOpacity="0.15" />
      {/* Eyes */}
      <circle cx="46" cy="40" r="2" fill="var(--text-secondary)" />
      <circle cx="54" cy="40" r="2" fill="var(--text-secondary)" />
      {/* Nose */}
      <circle cx="50" cy="48" r="1.5" fill="var(--text-secondary)" fillOpacity="0.6" />
      {/* Book */}
      <rect x="25" y="60" width="30" height="25" rx="1" fill="var(--bg-tertiary)" stroke="var(--border-color)" strokeWidth="1.5" />
      <line x1="28" y1="68" x2="50" y2="68" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="28" y1="73" x2="48" y2="73" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="28" y1="78" x2="45" y2="78" stroke="var(--accent-primary)" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  </motion.div>
);

