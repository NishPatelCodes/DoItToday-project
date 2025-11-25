import { Suspense, lazy } from 'react';
import { Skeleton } from '../components/Skeleton';

const GratitudeJournal = lazy(() => import('../components/GratitudeJournal'));

const GratitudePage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Suspense fallback={<Skeleton />}>
        <GratitudeJournal />
      </Suspense>
    </div>
  );
};

export default GratitudePage;

