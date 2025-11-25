import { DashboardGoals } from './DashboardViews';
import { useDataStore } from '../store/dataStore';

const GoalsPage = ({
  onUpdateGoalProgress,
  onDeleteGoal,
  onEditGoal,
  setIsGoalModalOpen,
  setEditingGoal,
}) => {
  const { goals, tasks } = useDataStore();

  return (
    <DashboardGoals
      goals={goals}
      tasks={tasks}
      onUpdateGoalProgress={onUpdateGoalProgress}
      onDeleteGoal={onDeleteGoal}
      onEditGoal={onEditGoal}
      setIsGoalModalOpen={setIsGoalModalOpen}
      setEditingGoal={setEditingGoal}
      hideHeader={false}
    />
  );
};

export default GoalsPage;

