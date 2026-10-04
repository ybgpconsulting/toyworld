import React from 'react';
import { useToastStore } from '../../hooks/useToast';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />
};

const styles = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-yellow-50 border-yellow-200'
};

export const ToastProvider = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-[100] flex flex-col gap-2 w-[90vw] md:w-auto max-w-sm">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={clsx(
            'flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-top-4 fade-in duration-300',
            styles[toast.type]
          )}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
          <button 
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-black/5 rounded-full text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
