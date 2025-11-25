import { Suspense, lazy } from 'react';
import { Skeleton } from '../components/Skeleton';

const Challenges = lazy(() => import('../components/Challenges'));

const ChallengesPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Suspense fallback={<Skeleton />}>
        <Challenges />
      </Suspense>
    </div>
  );
};

export default ChallengesPage;

