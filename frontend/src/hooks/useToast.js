import toast from 'react-hot-toast';

export const useToast = () => {
  return {
    success: (message, options) => {
      return toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        },
        ...options,
      });
    },
    error: (message, options) => {
      return toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        },
        ...options,
      });
    },
    loading: (message, options) => {
      return toast.loading(message, {
        position: 'top-right',
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        },
        ...options,
      });
    },
    info: (message, options) => {
      return toast(message, {
        duration: 3000,
        position: 'top-right',
        icon: 'ℹ️',
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        },
        ...options,
      });
    },
    promise: (promise, messages) => {
      return toast.promise(promise, messages, {
        position: 'top-right',
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        },
      });
    },
    dismiss: (toastId) => {
      toast.dismiss(toastId);
    },
  };
};

export default useToast;

