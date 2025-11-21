import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTasks, FaBullseye, FaChevronDown, FaCheck } from 'react-icons/fa';
import { tasksAPI, goalsAPI } from '../../services/api';

/**
 * Task/Goal Selector Component
 * Allows users to select a task or goal to focus on
 */
const TaskSelector = ({ selectedTaskId, selectedGoalId, onTaskSelect, onGoalSelect, className = '' }) => {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'goals'
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, goalsRes] = await Promise.all([
        tasksAPI.getAll().catch(() => ({ data: [] })),
        goalsAPI.getAll().catch(() => ({ data: [] })),
      ]);
      
      // Filter for active/incomplete tasks and goals
      const activeTasks = (tasksRes.data || []).filter(
        task => !task.completed && task.status !== 'completed'
      );
      const activeGoals = (goalsRes.data || []).filter(
        goal => goal.progress < 100
      );
      
      setTasks(activeTasks);
      setGoals(activeGoals);
    } catch (error) {
      console.error('Error loading tasks/goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedTask = tasks.find(t => t._id === selectedTaskId);
  const selectedGoal = goals.find(g => g._id === selectedGoalId);

  return (
    <div className={`relative ${className}`}>
      {/* Compact view */}
      <motion.div
        className="card p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedTask ? (
              <>
                <FaTasks className="text-[var(--accent-primary)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--text-primary)] truncate">
                    {selectedTask.title}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Task</div>
                </div>
              </>
            ) : selectedGoal ? (
              <>
                <FaBullseye className="text-[var(--accent-primary)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--text-primary)] truncate">
                    {selectedGoal.title}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Goal • {selectedGoal.progress}% complete
                  </div>
                </div>
              </>
            ) : (
              <>
                <FaTasks className="text-[var(--text-tertiary)] flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-[var(--text-secondary)]">No task selected</div>
                  <div className="text-xs text-[var(--text-tertiary)]">Tap to select</div>
                </div>
              </>
            )}
          </div>
          <FaChevronDown className={`text-[var(--text-tertiary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </motion.div>

      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 mt-2 card p-4 z-10 max-h-96 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'tasks'
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FaTasks className="inline mr-2" />
                Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'goals'
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FaBullseye className="inline mr-2" />
                Goals ({goals.length})
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="text-center py-8 text-[var(--text-secondary)]">Loading...</div>
              ) : activeTab === 'tasks' ? (
                tasks.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                    No active tasks available
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        onTaskSelect(null);
                        onGoalSelect(null);
                        setIsExpanded(false);
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        !selectedTaskId && !selectedGoalId
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                          : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                      }`}
                    >
                      <div className="font-medium text-[var(--text-primary)]">No task</div>
                      <div className="text-xs text-[var(--text-secondary)]">Focus without a specific task</div>
                    </button>
                    {tasks.map((task) => (
                      <button
                        key={task._id}
                        onClick={() => {
                          onTaskSelect(task._id);
                          onGoalSelect(null);
                          setIsExpanded(false);
                        }}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          selectedTaskId === task._id
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                            : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[var(--text-primary)] truncate">
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                                {task.description}
                              </div>
                            )}
                          </div>
                          {selectedTaskId === task._id && (
                            <FaCheck className="text-[var(--accent-primary)] ml-2 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                goals.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                    No active goals available
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        onTaskSelect(null);
                        onGoalSelect(null);
                        setIsExpanded(false);
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        !selectedTaskId && !selectedGoalId
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                          : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                      }`}
                    >
                      <div className="font-medium text-[var(--text-primary)]">No goal</div>
                      <div className="text-xs text-[var(--text-secondary)]">Focus without a specific goal</div>
                    </button>
                    {goals.map((goal) => (
                      <button
                        key={goal._id}
                        onClick={() => {
                          onGoalSelect(goal._id);
                          onTaskSelect(null);
                          setIsExpanded(false);
                        }}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          selectedGoalId === goal._id
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                            : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[var(--text-primary)] truncate">
                              {goal.title}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] mt-1">
                              {goal.progress}% complete
                            </div>
                          </div>
                          {selectedGoalId === goal._id && (
                            <FaCheck className="text-[var(--accent-primary)] ml-2 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskSelector;

