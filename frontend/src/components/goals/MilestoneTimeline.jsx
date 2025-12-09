import { useState, useMemo, useEffect } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';
import { FaFlagCheckered, FaCheckCircle, FaRegCircle, FaTasks, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MILESTONE_BLUEPRINT = [
  {
    id: 'clarify',
    title: 'Clarify outcome',
    tip: 'Define success metrics, done criteria and constraints.',
  },
  {
    id: 'build',
    title: 'Build momentum',
    tip: 'Ship weekly deliverables and remove blockers early.',
  },
  {
    id: 'stress',
    title: 'Stress-test & refine',
    tip: 'Validate assumptions, gather feedback, adjust scope.',
  },
  {
    id: 'launch',
    title: 'Launch + sustain',
    tip: 'Finalize, celebrate, and schedule follow-up habits.',
  },
];

const getGoalId = (goal) => goal?._id || goal?.id || goal?.goalId;

const buildMilestonePlan = (goal) => {
  if (!goal) {
    return MILESTONE_BLUEPRINT.map((phase, index) => ({
      ...phase,
      targetDate: addDays(new Date(), (index + 1) * 14),
    }));
  }
  const today = new Date();
  const deadline = goal.deadline ? new Date(goal.deadline) : addDays(today, 90);
  const totalDays = Math.max(14, differenceInDays(deadline, today));

  return MILESTONE_BLUEPRINT.map((phase, index) => {
    const targetDate = addDays(today, Math.round(((index + 1) / MILESTONE_BLUEPRINT.length) * totalDays));
    return {
      ...phase,
      targetDate,
    };
  });
};

const MilestoneTimeline = ({ goals = [], tasks = [] }) => {
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const [selectedGoalId, setSelectedGoalId] = useState(() => {
    if (safeGoals.length > 0 && safeGoals[0]) {
      return getGoalId(safeGoals[0]) || null;
    }
    return null;
  });

  const [milestoneProgress, setMilestoneProgress] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = window.localStorage.getItem('goal-milestone-progress');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('goal-milestone-progress', JSON.stringify(milestoneProgress));
    } catch (error) {
      // ignore storage failures
    }
  }, [milestoneProgress]);

  useEffect(() => {
    if (!selectedGoalId && safeGoals.length > 0 && safeGoals[0]) {
      const firstGoalId = getGoalId(safeGoals[0]);
      if (firstGoalId) {
        setSelectedGoalId(firstGoalId);
      }
    }
  }, [safeGoals, selectedGoalId]);

  if (safeGoals.length === 0) {
    return (
      <div className="bg-neutral-900 border border-white/5 rounded-xl p-5 text-center shadow-inner shadow-black/40">
        <FaFlagCheckered className="text-3xl text-purple-400 mx-auto mb-3" />
        <p className="text-sm text-white/60">Create a goal to unlock milestone planning.</p>
      </div>
    );
  }

  const selectedGoal =
    safeGoals.find((goal) => getGoalId(goal)?.toString() === selectedGoalId?.toString()) || safeGoals[0] || null;

  const milestonePlan = useMemo(() => buildMilestonePlan(selectedGoal), [selectedGoal]);

  const linkedTasks = useMemo(() => {
    if (!selectedGoal) return [];
    return safeTasks
      .filter((task) => {
        if (!task) return false;
        const taskGoalId = task.goalId?._id || task.goalId;
        return taskGoalId?.toString() === getGoalId(selectedGoal)?.toString();
      })
      .sort((a, b) => {
        const dateA = new Date(a.dueDate || a.createdAt || 0);
        const dateB = new Date(b.dueDate || b.createdAt || 0);
        return dateA - dateB;
      });
  }, [safeTasks, selectedGoal]);

  const actionableTasks = linkedTasks.filter((task) => task.status !== 'completed').slice(0, 3);

  const completedMilestones = selectedGoalId
    ? milestonePlan.filter((phase) => milestoneProgress[selectedGoalId]?.[phase.id]).length
    : 0;
  const milestoneCompletion =
    milestonePlan.length === 0 ? 0 : Math.round((completedMilestones / milestonePlan.length) * 100);

  const daysRemaining = selectedGoal?.deadline
    ? Math.max(0, differenceInDays(new Date(selectedGoal.deadline), new Date()))
    : '∞';

  const toggleMilestone = (milestoneId) => {
    if (!selectedGoalId) return;
    setMilestoneProgress((prev) => {
      const next = { ...prev };
      const current = { ...(next[selectedGoalId] || {}) };
      current[milestoneId] = !current[milestoneId];
      next[selectedGoalId] = current;
      return next;
    });
  };

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-xl p-5 shadow-inner shadow-black/40 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">Milestone Progress</p>
          <h3 className="text-base font-semibold text-white/90">{selectedGoal?.title || 'No goal selected'}</h3>
        </div>
        <select
          value={selectedGoalId || getGoalId(selectedGoal) || ''}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/90 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 hover:bg-white/10 transition-colors"
        >
          {safeGoals.map((goal) => {
            const goalId = getGoalId(goal);
            if (!goalId) return null;
            return (
              <option key={goalId} value={goalId}>
                {goal?.title || 'Untitled Goal'}
              </option>
            );
          })}
        </select>
      </div>

      {/* Completion Stats */}
      <div className="rounded-lg bg-white/5 border border-white/10 p-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-white/50 mb-0.5">Milestones complete</p>
          <p className="text-lg font-bold text-white/90">{milestoneCompletion}%</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/50 mb-0.5">Days left</p>
          <p className="text-base font-semibold text-white/90">
            {daysRemaining === '∞' ? 'Open' : `${daysRemaining}d`}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-0">
        {milestonePlan.map((phase, index) => {
          const isComplete = milestoneProgress[selectedGoalId]?.[phase.id];
          const isLast = index === milestonePlan.length - 1;

          return (
            <div key={phase.id} className="relative flex gap-3">
              {/* Vertical Line */}
              {!isLast && (
                <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-white/10" />
              )}

              {/* Circle Indicator */}
              <div className="flex-shrink-0 relative z-10 mt-0.5">
                <button
                  onClick={() => toggleMilestone(phase.id)}
                  className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isComplete
                      ? 'bg-gradient-to-r from-purple-600/80 to-blue-600/80'
                      : 'bg-white/5 border border-white/20 hover:border-purple-500/50'
                  }`}
                >
                  {isComplete ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  ) : null}
                </button>
              </div>

              {/* Milestone Card */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`flex-1 rounded-lg border px-3 py-2 mb-3 transition-all duration-200 ${
                  isComplete
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-white/10 bg-white/5 hover:border-purple-500/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-semibold text-white/90">
                        {index + 1}. {phase.title}
                      </p>
                      {isComplete && (
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-purple-500/20 text-purple-300 rounded-full">
                          Done
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/60 leading-snug">{phase.tip}</p>
                  </div>
                  <span className="text-[10px] text-white/40 flex-shrink-0">
                    {format(phase.targetDate, 'MMM d')}
                  </span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Next Moves */}
      <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <FaTasks className="text-purple-400 text-xs" />
          <p className="font-semibold text-white/90 text-xs">Next Moves</p>
        </div>
        {actionableTasks.length > 0 ? (
          <div className="space-y-1.5">
            {actionableTasks.map((task) => {
              if (!task || !task._id) return null;
              return (
                <div
                  key={task._id}
                  className="flex items-center gap-1.5 text-xs group hover:bg-white/5 rounded px-1.5 py-1 transition-colors"
                >
                  <FaArrowRight className="text-purple-400/60 group-hover:text-purple-400 text-[10px] flex-shrink-0 transition-colors" />
                  <p className="text-white/70 truncate flex-1">{task.title || 'Untitled Task'}</p>
                  {task.dueDate && (
                    <span className="text-[10px] text-white/40 flex-shrink-0">
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-white/50 leading-snug">
            Break this milestone into 2–3 tasks and link them to <strong className="text-white/70">{selectedGoal?.title || 'this goal'}</strong>.
          </p>
        )}
      </div>
    </div>
  );
};

export default MilestoneTimeline;

