import { motion } from 'framer-motion';

const RankFrame = ({ rank, children, size = 'default' }) => {
  // Clamp rank between 1 and 10
  const displayRank = Math.min(Math.max(rank || 11, 1), 10);
  
  // Size classes
  const sizeClasses = {
    small: 'w-12 h-12',
    default: 'w-20 h-20 md:w-24 md:h-24',
    large: 'w-32 h-32',
  };
  
  const frameSize = sizeClasses[size] || sizeClasses.default;
  
  // Frame gradient classes and styles for each rank (1-10)
  const getFrameConfig = (rankNum) => {
    switch (rankNum) {
      case 1:
        // Gold Crown Frame - Rank 1
        return {
          gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
          shadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
          borderWidth: 4,
        };
      case 2:
        // Silver Frame - Rank 2
        return {
          gradient: 'from-gray-300 via-gray-400 to-gray-500',
          shadow: '0 0 15px rgba(192, 192, 192, 0.5), 0 0 30px rgba(192, 192, 192, 0.2)',
          borderWidth: 4,
        };
      case 3:
        // Bronze Frame - Rank 3
        return {
          gradient: 'from-orange-600 via-orange-700 to-orange-800',
          shadow: '0 0 15px rgba(205, 127, 50, 0.5), 0 0 30px rgba(205, 127, 50, 0.2)',
          borderWidth: 4,
        };
      case 4:
        // Diamond Blue Frame - Rank 4
        return {
          gradient: 'from-blue-400 via-blue-500 to-blue-600',
          shadow: '0 0 12px rgba(0, 191, 255, 0.4), 0 0 24px rgba(0, 191, 255, 0.2)',
          borderWidth: 3,
        };
      case 5:
        // Emerald Green Frame - Rank 5
        return {
          gradient: 'from-green-400 via-green-500 to-green-600',
          shadow: '0 0 12px rgba(80, 200, 120, 0.4), 0 0 24px rgba(80, 200, 120, 0.2)',
          borderWidth: 3,
        };
      case 6:
        // Ruby Red Frame - Rank 6
        return {
          gradient: 'from-red-400 via-red-500 to-red-600',
          shadow: '0 0 12px rgba(255, 68, 68, 0.4), 0 0 24px rgba(255, 68, 68, 0.2)',
          borderWidth: 3,
        };
      case 7:
        // Amethyst Purple Frame - Rank 7
        return {
          gradient: 'from-purple-400 via-purple-500 to-purple-600',
          shadow: '0 0 12px rgba(153, 102, 204, 0.4), 0 0 24px rgba(153, 102, 204, 0.2)',
          borderWidth: 3,
        };
      case 8:
        // Topaz Orange Frame - Rank 8
        return {
          gradient: 'from-orange-400 via-orange-500 to-orange-600',
          shadow: '0 0 10px rgba(255, 140, 0, 0.35), 0 0 20px rgba(255, 140, 0, 0.15)',
          borderWidth: 3,
        };
      case 9:
        // Sapphire Cyan Frame - Rank 9
        return {
          gradient: 'from-cyan-400 via-cyan-500 to-cyan-600',
          shadow: '0 0 10px rgba(0, 206, 209, 0.35), 0 0 20px rgba(0, 206, 209, 0.15)',
          borderWidth: 3,
        };
      case 10:
        // Opal Rainbow Frame - Rank 10
        return {
          gradient: 'from-pink-400 via-purple-400 via-blue-400 to-cyan-400',
          shadow: '0 0 10px rgba(255, 107, 107, 0.3), 0 0 20px rgba(78, 205, 196, 0.2)',
          borderWidth: 3,
        };
      default:
        // Default frame for ranks > 10 or no rank
        return {
          gradient: 'from-gray-300 to-gray-400',
          shadow: '0 0 5px rgba(0, 0, 0, 0.1)',
          borderWidth: 2,
        };
    }
  };

  const frameConfig = getFrameConfig(displayRank);
  
  // Special decorations for top 3 ranks
  const getTopRankDecoration = () => {
    if (displayRank === 1) {
      return (
        <>
          {/* Crown decoration */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-400 text-xl md:text-2xl animate-pulse z-30">
            👑
          </div>
          {/* Sparkles */}
          <div className="absolute -top-1 -right-1 text-yellow-300 text-xs animate-ping z-30">✨</div>
          <div className="absolute -bottom-1 -left-1 text-yellow-300 text-xs animate-ping z-30" style={{ animationDelay: '0.5s' }}>✨</div>
        </>
      );
    }
    if (displayRank === 2) {
      return (
        <div className="absolute -top-1 -right-1 text-gray-300 text-xs animate-pulse z-30">⭐</div>
      );
    }
    if (displayRank === 3) {
      return (
        <div className="absolute -top-1 -right-1 text-orange-300 text-xs animate-pulse z-30">⭐</div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="relative inline-block"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outer frame with gradient border effect */}
      <div
        className={`${frameSize} rounded-full bg-gradient-to-br ${frameConfig.gradient} flex items-center justify-center`}
        style={{
          boxShadow: frameConfig.shadow,
          padding: `${frameConfig.borderWidth}px`,
        }}
      >
        {/* Inner container for avatar */}
        <div className="w-full h-full rounded-full overflow-hidden relative bg-[var(--bg-primary)]">
          <div className="w-full h-full rounded-full overflow-hidden relative z-10">
            {children}
          </div>
        </div>
        
        {/* Rank decorations */}
        {getTopRankDecoration()}
        
        {/* Rank badge for top 3 */}
        {displayRank <= 3 && (
          <div
            className={`absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-xs font-bold text-white z-20 ${
              displayRank === 1
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                : displayRank === 2
                ? 'bg-gradient-to-r from-gray-300 to-gray-500'
                : 'bg-gradient-to-r from-orange-400 to-orange-600'
            }`}
            style={{ fontSize: size === 'small' ? '8px' : '10px' }}
          >
            #{displayRank}
          </div>
        )}
      </div>
      
      {/* Animated ring for top ranks */}
      {displayRank <= 3 && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `2px solid ${displayRank === 1 ? '#FFD700' : displayRank === 2 ? '#C0C0C0' : '#CD7F32'}`,
            opacity: 0.5,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
};

export default RankFrame;
