import { DashboardTeam } from './DashboardViews';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';

const TeamPage = ({
  onAddFriend,
  onRemoveFriend,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onCancelFriendRequest,
}) => {
  const { friends, friendRequests, sentFriendRequests, leaderboard } = useDataStore();
  const { user } = useAuthStore();

  return (
    <DashboardTeam
      friends={friends}
      friendRequests={friendRequests}
      sentFriendRequests={sentFriendRequests}
      leaderboard={leaderboard}
      onAddFriend={onAddFriend}
      onRemoveFriend={onRemoveFriend}
      onAcceptFriendRequest={onAcceptFriendRequest}
      onDeclineFriendRequest={onDeclineFriendRequest}
      onCancelFriendRequest={onCancelFriendRequest}
      currentUser={user}
    />
  );
};

export default TeamPage;

