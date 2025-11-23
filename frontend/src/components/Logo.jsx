import { motion } from 'framer-motion';

const Logo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
      className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg`}
    >
      DIT
    </motion.div>
  );
};

export default Logo;

