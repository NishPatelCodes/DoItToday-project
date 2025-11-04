import { motion } from 'framer-motion';
import { FaUser, FaTrash, FaTrophy, FaFire } from 'react-icons/fa';

const FriendStatus = ({ friend, onRemove, rank }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="card p-4 mb-3"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
            {friend.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {rank === 1 && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
              <FaTrophy className="text-yellow-900 text-xs" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[var(--text-primary)] truncate">{friend.name}</h4>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
              <FaFire className="text-orange-500" />
              <span>{friend.streak || 0} streak</span>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              {friend.totalTasksCompleted || 0} tasks
            </span>
          </div>
        </div>

        {onRemove && (
          <button
            onClick={() => onRemove(friend._id || friend.id)}
            className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
            title="Remove friend"
          >
            <FaTrash />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default FriendStatus;

