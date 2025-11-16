import { useState, useMemo, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaTimes, FaSort } from 'react-icons/fa';
import { useDebounce } from '../hooks/useDebounce';

const TaskSearchFilter = memo(({ 
  tasks, 
  onFilterChange, 
  className = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority'); // priority, dueDate, createdAt

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Apply filters and search
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      filtered = filtered.filter(task => {
        if (!task.dueDate) return dateFilter === 'no-date';
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case 'overdue':
            return dueDate < now && task.status !== 'completed';
          case 'today':
            return dueDate.getTime() === now.getTime();
          case 'tomorrow':
            return dueDate.getTime() === tomorrow.getTime();
          case 'this-week':
            return dueDate >= now && dueDate <= nextWeek;
          case 'no-date':
            return false;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, debouncedSearch, priorityFilter, statusFilter, dateFilter, sortBy]);

  // Notify parent of filtered results
  useEffect(() => {
    if (onFilterChange) {
      // onFilterChange receives the filtered tasks
      onFilterChange(filteredTasks);
    }
  }, [filteredTasks, onFilterChange]);

  const clearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
    setSortBy('priority');
  };

  const hasActiveFilters = 
    searchQuery.trim() || 
    priorityFilter !== 'all' || 
    statusFilter !== 'all' || 
    dateFilter !== 'all';

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Close search when clicking outside on mobile
  useEffect(() => {
    if (isSearchOpen) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.search-container')) {
          setIsSearchOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchOpen]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Bar - Button on mobile, full bar on desktop */}
      <div className="relative search-container">
        {/* Mobile: Search Button */}
        {!isSearchOpen && (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-tertiary)] hover:border-[var(--accent-primary)] transition-all"
            aria-label="Open search"
          >
            <div className="flex items-center gap-2">
              <FaSearch className="text-[var(--text-tertiary)]" />
              <span className="text-sm">Search tasks...</span>
            </div>
          </button>
        )}

        {/* Mobile: Full Search when open */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden relative mb-2"
            >
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 transition-all"
                aria-label="Search tasks"
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close search"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop: Full Search Bar */}
        <div className="hidden md:block relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 transition-all"
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle and Sort */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]'
          }`}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <FaFilter />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
              Active
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <FaSort className="text-[var(--text-tertiary)]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 text-sm"
            aria-label="Sort by"
          >
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="createdAt">Sort by Created</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
            aria-label="Clear all filters"
          >
            <FaTimes className="text-xs" />
            <span>Clear</span>
          </button>
        )}

        <div className="ml-auto text-sm text-[var(--text-secondary)]">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 space-y-4">
              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Priority
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'high', 'medium', 'low'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setPriorityFilter(priority)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        priorityFilter === priority
                          ? priority === 'all'
                            ? 'bg-[var(--accent-primary)] text-white'
                            : priority === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-500'
                            : priority === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-2 border-yellow-500'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        statusFilter === status
                          ? status === 'all'
                            ? 'bg-[var(--accent-primary)] text-white'
                            : status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-2 border-orange-500'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Due Date
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'overdue', 'today', 'tomorrow', 'this-week', 'no-date'].map((date) => (
                    <button
                      key={date}
                      onClick={() => setDateFilter(date)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        dateFilter === date
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                      }`}
                    >
                      {date === 'no-date' ? 'No Date' : date.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TaskSearchFilter.displayName = 'TaskSearchFilter';

export default TaskSearchFilter;
