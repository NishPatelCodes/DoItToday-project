// Utility function for class merging (similar to clsx)
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

