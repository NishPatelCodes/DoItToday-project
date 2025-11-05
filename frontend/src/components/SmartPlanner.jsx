import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { smartPlannerAPI } from '../services/api';

const SmartPlanner = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const response = await smartPlannerAPI.suggest();
      setSuggestions(response.data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent"></div>
        <p className="text-[var(--text-secondary)] mt-4">Analyzing your tasks...</p>
      </div>
    );
  }

  if (!suggestions || suggestions.recommendedOrder.length === 0) {
    return (
      <div className="card p-6 text-center">
        <FaStar className="text-4xl text-[var(--accent-primary)] mx-auto mb-4" />
        <p className="text-[var(--text-primary)] text-lg mb-2">No tasks to plan</p>
        <p className="text-[var(--text-secondary)] text-sm">Add some tasks to get AI-powered scheduling suggestions!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <FaStar className="text-xl text-[var(--accent-primary)]" />
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">AI Smart Planner</h2>
      </div>

      {/* Insights */}
      {suggestions.insights && suggestions.insights.length > 0 && (
        <div className="mb-6 space-y-2">
          {suggestions.insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg flex items-start gap-2 ${
                insight.type === 'urgent'
                  ? 'bg-red-50 border border-red-200'
                  : insight.type === 'warning'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              {insight.type === 'urgent' ? (
                <FaExclamationTriangle className="text-red-600 mt-1" />
              ) : insight.type === 'warning' ? (
                <FaInfoCircle className="text-yellow-600 mt-1" />
              ) : (
                <FaInfoCircle className="text-blue-600 mt-1" />
              )}
              <p className="text-[var(--text-primary)] text-sm flex-1">{insight.message}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recommended Order */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-600" />
          Recommended Task Order
        </h3>
        <div className="space-y-2">
          {suggestions.recommendedOrder.slice(0, 10).map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-1">{task.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <span className={`px-2 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </span>
                    {task.daysUntilDue !== undefined && task.daysUntilDue <= 7 && (
                      <span className={task.daysUntilDue < 0 ? 'text-red-600' : 'text-yellow-600'}>
                        {task.daysUntilDue < 0 
                          ? `${Math.abs(task.daysUntilDue)} days overdue` 
                          : `${task.daysUntilDue} days left`}
                      </span>
                    )}
                    <span className="text-[var(--accent-primary)]">Score: {task.score}/6</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <button
        onClick={loadSuggestions}
        className="btn-secondary w-full mt-6"
      >
        Refresh Suggestions
      </button>
    </motion.div>
  );
};

export default SmartPlanner;

