import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
}) => {
  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-[#43A047] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#E53935] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#1F6F50] shrink-0" />,
  };

  const borderMap = {
    success: 'border-[#43A047]/30 bg-[#FFFDF8]',
    error: 'border-[#E53935]/30 bg-[#FFFDF8]',
    info: 'border-[#1F6F50]/30 bg-[#FFFDF8]',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 py-3 px-4 rounded-xl border shadow-lg max-w-sm text-sm text-[#1E2420] transition-all animate-in slide-in-from-bottom-2 ${borderMap[type]}`}
    >
      {iconMap[type]}
      <p className="flex-1 font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[#6B726D] hover:text-[#1E2420] p-1 rounded transition-colors cursor-pointer touch-target flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
