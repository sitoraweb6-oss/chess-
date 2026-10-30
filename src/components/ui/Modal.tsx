import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { bn } from '../../i18n/bn.ts';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || bn.appName}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidthClasses[maxWidth]} bg-surface rounded-xl border border-border shadow-xl p-5 sm:p-6 transition-all transform scale-100 max-h-[90vh] overflow-y-auto text-fg`}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          {title ? (
            <h2 className="text-xl font-bold text-fg">{title}</h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            aria-label={bn.ui.close}
            className="p-1.5 text-muted hover:text-fg hover:bg-surface-2 rounded-lg transition-colors cursor-pointer touch-target flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
