/**
 * Product Mockup Component
 * 
 * Creates CSS-based mockups of the actual DoItToday dashboard
 * These match the real UI design and don't require external images
 */

import { motion } from 'framer-motion';
import { FaTasks, FaBullseye, FaFire, FaChartLine, FaCheckCircle } from 'react-icons/fa';

export const DashboardMockup = () => {
  return (
    <div className="w-full h-full bg-[var(--bg-primary)] p-6 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          Welcome back, User!
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Here's your productivity overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <FaTasks className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Pending</p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">5</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FaBullseye className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Active Goals</p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">3</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <FaFire className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Streak</p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">12</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <FaChartLine className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Level</p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded border-2 border-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                Complete project proposal
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">High Priority • Due today</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded border-2 border-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                Review team feedback
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Medium Priority • Tomorrow</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] opacity-60">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-green-500 border-2 border-green-500 mt-0.5 flex-shrink-0 flex items-center justify-center">
              <FaCheckCircle className="text-white text-xs" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--text-primary)] line-through mb-1">
                Morning workout
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TaskManagementMockup = () => {
  return (
    <div className="w-full h-full bg-[var(--bg-primary)] p-6 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            Tasks
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage your daily tasks
          </p>
        </div>
        <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium">
          + New Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium">
          All
        </button>
        <button className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg text-sm font-medium border border-[var(--border-color)]">
          Pending
        </button>
        <button className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg text-sm font-medium border border-[var(--border-color)]">
          Completed
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {[
          { title: 'Design new landing page', priority: 'High', due: 'Today', borderColor: 'border-red-500', bgColor: 'bg-red-500/10', textColor: 'text-red-600' },
          { title: 'Write blog post about productivity', priority: 'Medium', due: 'Tomorrow', borderColor: 'border-yellow-500', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-600' },
          { title: 'Team meeting preparation', priority: 'High', due: 'Today', borderColor: 'border-red-500', bgColor: 'bg-red-500/10', textColor: 'text-red-600' },
          { title: 'Update project documentation', priority: 'Low', due: 'This week', borderColor: 'border-blue-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-600' },
        ].map((task, idx) => (
          <div key={idx} className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded border-2 ${task.borderColor} mt-0.5 flex-shrink-0`} />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  {task.title}
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${task.bgColor} ${task.textColor}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{task.due}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MobileDashboardMockup = () => {
  return (
    <div className="w-full h-full bg-[var(--bg-primary)] p-4 overflow-hidden relative">
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">Today</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
          U
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Tasks</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">5</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Streak</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">12 🔥</p>
        </div>
      </div>

      {/* Quick Task */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border-color)] mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded border-2 border-indigo-500" />
          <h3 className="text-sm font-medium text-[var(--text-primary)] flex-1">
            Complete morning routine
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-600">
            High
          </span>
          <span className="text-xs text-[var(--text-secondary)]">Due today</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--text-secondary)]">Today's Progress</span>
          <span className="text-xs font-medium text-[var(--text-primary)]">60%</span>
        </div>
        <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '60%' }} />
        </div>
      </div>

      {/* Bottom Nav Hint */}
      <div className="mt-auto pt-4 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-around">
          <div className="w-6 h-6 rounded bg-[var(--accent-primary)]/20" />
          <div className="w-6 h-6 rounded bg-[var(--bg-tertiary)]" />
          <div className="w-6 h-6 rounded bg-[var(--bg-tertiary)]" />
          <div className="w-6 h-6 rounded bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    </div>
  );
};

