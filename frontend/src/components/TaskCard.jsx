import { motion } from 'framer-motion';
import { FaCheckCircle, FaCircle, FaTrash, FaEdit, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';

const TaskCard = ({ task, onToggle, onDelete, onEdit }) => {
  const isCompleted = task.status === 'completed';
  const priorityColors = {
    low: 'bg-green-100 text-green-700 border border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    high: 'bg-red-100 text-red-700 border border-red-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`card p-3 mb-2 ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task._id)}
          className={`mt-1 transition-all duration-200 ${
            isCompleted ? 'text-green-600' : 'text-[var(--text-tertiary)] hover:text-green-600'
          }`}
        >
          {isCompleted ? (
            <FaCheckCircle className="text-xl" />
          ) : (
            <FaCircle className="text-xl" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-medium text-[var(--text-primary)] ${
                isCompleted ? 'line-through text-[var(--text-secondary)]' : ''
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <FaClock className="text-xs" />
                <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
              </div>
            )}
            {task.isShared && (
              <span className="text-[var(--accent-primary)] font-medium">Shared</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <FaEdit />
            </button>
          )}
          <button
            onClick={() => onDelete(task._id)}
            className="p-2 text-[var(--text-tertiary)] hover:text-red-600 transition-colors"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;

