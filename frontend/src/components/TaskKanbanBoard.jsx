import React, { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { useAuthStore } from '../store/authStore';


// Kanban Column Component
const KanbanColumn = memo(({ id, title, tasks, color, onToggle, onDelete, onEdit, isSelectMode, selectedTasks, onSelect, showLimit = false, limit = 5 }) => {
  const [showAll, setShowAll] = React.useState(false);
  const displayTasks = showLimit && !showAll ? tasks.slice(0, limit) : tasks;
  const hasMore = showLimit && tasks.length > limit;

  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className={`bg-[var(--bg-secondary)] border-b-2 ${color} pb-3 mb-4 rounded-t-lg p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              {tasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className={`space-y-2 ${displayTasks.length > 5 ? 'max-h-[700px] overflow-y-auto' : ''} px-2 pb-4`}>
        <AnimatePresence mode="popLayout">
          {displayTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isSelectMode={isSelectMode}
              isSelected={selectedTasks?.has(task._id)}
              onSelect={onSelect}
            />
          ))}
        </AnimatePresence>

        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-2 px-3 py-2 text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
          >
            {showAll ? `Show Less` : `Show All (${tasks.length - limit} more)`}
          </button>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-[var(--text-tertiary)]">
            <p className="text-sm">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

// Main Kanban Board Component
const TaskKanbanBoard = memo(({ 
  tasks, 
  onToggle, 
  onDelete, 
  onEdit, 
  onTaskMove,
  isSelectMode = false,
  selectedTasks = new Set(),
  onSelect,
  viewMode = 'kanban' // 'kanban' | 'list'
}) => {
  const { user } = useAuthStore();

  // Categorize tasks into columns (removed inProgress column)
  const { todo, dueSoon, completed } = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59);

    const todo = [];
    const dueSoon = [];
    const completed = [];

    tasks.forEach(task => {
      if (task.status === 'completed') {
        completed.push(task);
      } else if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate <= tomorrow) {
          dueSoon.push(task);
        } else {
          todo.push(task);
        }
      } else {
        // No due date - prioritize by priority and creation date
        if (task.priority === 'high') {
          todo.unshift(task); // High priority at top
        } else {
          todo.push(task);
        }
      }
    });

    // Sort each column
    const sortTasks = (taskList) => {
      return [...taskList].sort((a, b) => {
        // Sort by priority first (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
        if (priorityDiff !== 0) return priorityDiff;

        // Then by due date (sooner first)
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;

        // Finally by creation date (newer first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    };

    return {
      todo: sortTasks(todo),
      dueSoon: sortTasks(dueSoon),
      completed: sortTasks(completed),
    };
  }, [tasks]);


  if (viewMode === 'list') {
    // List view - only show pending tasks (not completed)
    const pendingTasks = tasks.filter(task => task.status !== 'completed');
    return (
      <div className="space-y-2">
        {pendingTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            isSelectMode={isSelectMode}
            isSelected={selectedTasks?.has(task._id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  // Kanban view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        <KanbanColumn
          id="todo"
          title="To Do"
          tasks={todo}
          color="border-blue-500"
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          isSelectMode={isSelectMode}
          selectedTasks={selectedTasks}
          onSelect={onSelect}
        />
        <KanbanColumn
          id="due-soon"
          title="Due Soon"
          tasks={dueSoon}
          color="border-orange-500"
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          isSelectMode={isSelectMode}
          selectedTasks={selectedTasks}
          onSelect={onSelect}
        />
        <KanbanColumn
          id="completed"
          title="Completed"
          tasks={completed}
          color="border-green-500"
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          isSelectMode={isSelectMode}
          selectedTasks={selectedTasks}
          onSelect={onSelect}
          showLimit={true}
          limit={5}
        />
      </div>
  );
});

TaskKanbanBoard.displayName = 'TaskKanbanBoard';

export default TaskKanbanBoard;
