import React from 'react';
import { PieceSymbol } from 'chess.js';
import { Modal } from '../../components/ui/Modal.tsx';
import { bn, PIECE_NAMES } from '../../i18n/bn.ts';

export interface PromotionModalProps {
  isOpen: boolean;
  color: 'white' | 'black';
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  color,
  onSelect,
  onCancel,
}) => {
  const pieces: { type: PieceSymbol; symbol: string }[] = [
    { type: 'q', symbol: color === 'white' ? '♕' : '♛' },
    { type: 'r', symbol: color === 'white' ? '♖' : '♜' },
    { type: 'b', symbol: color === 'white' ? '♗' : '♝' },
    { type: 'n', symbol: color === 'white' ? '♘' : '♞' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={bn.play.promotion.title}
      maxWidth="sm"
    >
      <div className="py-2 text-center">
        <p className="text-sm text-muted mb-4">
          {bn.play.promotion.choosePiece}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className="flex flex-col items-center justify-center p-3.5 bg-surface-2 hover:bg-primary-soft hover:border-primary border border-border rounded-xl transition-all cursor-pointer touch-target group"
            >
              <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">
                {p.symbol}
              </span>
              <span className="text-sm font-semibold text-fg group-hover:text-primary">
                {PIECE_NAMES[p.type]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};
