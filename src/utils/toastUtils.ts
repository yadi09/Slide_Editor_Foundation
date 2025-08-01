import toast from 'react-hot-toast'

export const showToast = {
  // Success notifications
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '14px',
      },
    })
  },

  // Error notifications
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#ef4444',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '14px',
      },
    })
  },

  // Warning notifications
  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-center',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '14px',
      },
    })
  },

  // Info notifications
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-center',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '14px',
      },
    })
  },


} 