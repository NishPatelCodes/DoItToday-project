import { useState, useMemo, useEffect } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';
import { FaFlagCheckered, FaCheckCircle, FaRegCircle, FaTasks } from 'react-icons/fa';

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

const GoalMilestoneGuide = ({ goals = [], tasks = [] }) => {
  const [selectedGoalId, setSelectedGoalId] = useState(getGoalId(goals[0]) || null);
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
    if (!selectedGoalId && goals.length > 0) {
      const firstGoalId = getGoalId(goals[0]);
      if (firstGoalId) {
        setSelectedGoalId(firstGoalId);
      }
    }
  }, [goals, selectedGoalId]);

  if (goals.length === 0) {
    return (
      <div className="card p-6 text-center">
        <FaFlagCheckered className="text-3xl text-[var(--accent-primary)] mx-auto mb-3" />
        <p className="text-[var(--text-secondary)]">Create a goal to unlock milestone planning.</p>
      </div>
    );
  }

  const selectedGoal =
    goals.find((goal) => getGoalId(goal)?.toString() === selectedGoalId?.toString()) || goals[0];

  const milestonePlan = useMemo(() => buildMilestonePlan(selectedGoal), [selectedGoal]);

  const linkedTasks = useMemo(() => {
    if (!selectedGoal) return [];
    return tasks
      .filter((task) => {
        const taskGoalId = task.goalId?._id || task.goalId;
        return taskGoalId?.toString() === getGoalId(selectedGoal)?.toString();
      })
      .sort((a, b) => new Date(a.dueDate || a.createdAt || 0) - new Date(b.dueDate || b.createdAt || 0));
  }, [tasks, selectedGoal]);

  const actionableTasks = linkedTasks.filter((task) => task.status !== 'completed').slice(0, 3);

  const completedMilestones = milestonePlan.filter(
    (phase) => milestoneProgress[selectedGoalId]?.[phase.id]
  ).length;
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
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Milestone map</p>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{selectedGoal?.title}</h3>
        </div>
        <select
          value={selectedGoalId || getGoalId(selectedGoal)}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
        >
          {goals.map((goal) => (
            <option key={getGoalId(goal)} value={getGoalId(goal)}>
              {goal.title}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Milestones complete</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{milestoneCompletion}%</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1 text-right">Days left</p>
          <p className="text-xl font-semibold text-[var(--text-primary)] text-right">
            {daysRemaining === '∞' ? 'Open' : `${daysRemaining}d`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {milestonePlan.map((phase, index) => {
          const isComplete = milestoneProgress[selectedGoalId]?.[phase.id];
          return (
            <button
              key={phase.id}
              onClick={() => toggleMilestone(phase.id)}
              className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${
                isComplete
                  ? 'border-green-400/40 bg-green-50/50 dark:bg-green-900/10'
                  : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
              }`}
            >
              <div className="flex-shrink-0">
                {isComplete ? (
                  <FaCheckCircle className="text-green-500 text-lg" />
                ) : (
                  <FaRegCircle className="text-[var(--text-tertiary)] text-lg" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {index + 1}. {phase.title}
                  </p>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {format(phase.targetDate, 'MMM d')}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{phase.tip}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaTasks className="text-[var(--accent-primary)]" />
          <p className="font-semibold text-[var(--text-primary)] text-sm">Next moves</p>
        </div>
        {actionableTasks.length > 0 ? (
          <div className="space-y-2">
            {actionableTasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between text-sm">
                <p className="text-[var(--text-secondary)] truncate">{task.title}</p>
                {task.dueDate && (
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-tertiary)]">
            Break this milestone into 2–3 tasks and link them to <strong>{selectedGoal?.title}</strong>.
          </p>
        )}
      </div>
    </div>
  );
};

export default GoalMilestoneGuide;


