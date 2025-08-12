export const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // Simple console notification - in a real app you'd use a toast library
  console.log(`[${type.toUpperCase()}]`, message);
  
  // You can integrate with libraries like react-hot-toast, react-toastify, etc.
  // Example with react-hot-toast:
  // import toast from 'react-hot-toast';
  // if (type === 'success') toast.success(message);
  // if (type === 'error') toast.error(message);
  // if (type === 'info') toast(message);
};

export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  const message = error?.response?.data?.error?.message || error?.message || defaultMessage;
  showNotification(message, 'error');
  return message;
};