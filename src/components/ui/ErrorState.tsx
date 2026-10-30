import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button.tsx';
import { bn } from '../../i18n/bn.ts';

export interface ErrorStateProps {
  title?: string;
  message: string;
  technicalDetails?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = bn.ui.errorTitle,
  message,
  technicalDetails,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-6 text-center bg-[#FFEBEE]/60 rounded-xl border border-[#E53935]/25 my-4"
    >
      <div className="p-3 mb-3 text-[#E53935] bg-[#FFCDD2]/60 rounded-full">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-[#C62828] mb-1">{title}</h3>
      <p className="text-sm text-[#1E2420]/80 max-w-sm mb-3 leading-relaxed">{message}</p>

      {technicalDetails && (
        <div className="w-full max-w-md bg-white/80 p-2.5 rounded-lg border border-[#E53935]/20 text-left mb-4 text-xs font-mono text-[#C62828] break-all select-all">
          <span className="font-bold block text-[10px] text-[#6B726D] uppercase mb-0.5">
            কারিগরি কারণ (Technical reason):
          </span>
          {technicalDetails}
        </div>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          isLoading={isRetrying}
          variant="primary"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          {bn.ui.engineRetry}
        </Button>
      )}
    </div>
  );
};
