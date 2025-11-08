import { motion } from 'framer-motion';

export const Skeleton = ({ className = '', width, height, rounded = 'md' }) => {
  return (
    <div
      className={`bg-[var(--bg-tertiary)] animate-pulse ${className}`}
      style={{ width, height, borderRadius: rounded === 'md' ? '0.5rem' : rounded === 'lg' ? '0.75rem' : '0.25rem' }}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="card p-4 md:p-6">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
      <Skeleton width="100%" height={60} />
    </div>
  );
};

export const TaskCardSkeleton = () => {
  return (
    <div className="card p-3 mb-2">
      <div className="flex items-start gap-3">
        <Skeleton width={28} height={28} rounded="full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width="40%" height={20} />
            <Skeleton width={60} height={20} rounded="md" />
          </div>
          <Skeleton width="80%" height={16} />
          <Skeleton width="50%" height={14} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={32} height={32} rounded="md" />
          <Skeleton width={32} height={32} rounded="md" />
        </div>
      </div>
    </div>
  );
};

export const GoalCardSkeleton = () => {
  return (
    <div className="card p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="50%" height={24} />
          <Skeleton width={60} height={24} rounded="md" />
        </div>
        <Skeleton width="100%" height={8} rounded="full" />
        <div className="flex items-center justify-between">
          <Skeleton width="30%" height={16} />
          <Skeleton width="20%" height={16} />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;

