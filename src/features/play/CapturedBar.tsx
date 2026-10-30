import React from 'react';
import { PieceSymbol } from 'chess.js';
import { toBanglaNumeral } from '../../i18n/bn.ts';

export interface CapturedBarProps {
  color: 'white' | 'black';
  playerName: string;
  isTurn: boolean;
  capturedPieces: PieceSymbol[];
  advantage: number; // positive = advantage for this player
  isThinking?: boolean;
}

const PIECE_UNICODE: Record<PieceSymbol, { white: string; black: string }> = {
  p: { white: '♙', black: '♟' },
  n: { white: '♘', black: '♞' },
  b: { white: '♗', black: '♝' },
  r: { white: '♖', black: '♜' },
  q: { white: '♕', black: '♛' },
  k: { white: '♔', black: '♚' },
};

export const CapturedBar: React.FC<CapturedBarProps> = ({
  color,
  playerName,
  isTurn,
  capturedPieces,
  advantage,
  isThinking = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
        isTurn
          ? 'bg-[#E6F2EC] border border-[#1F6F50]/30 shadow-xs'
          : 'bg-[#F4EFE4]/60 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full border ${
            color === 'white'
              ? 'bg-[#FFFDF8] border-[#1E2420]/40'
              : 'bg-[#1E2420] border-[#1E2420]'
          }`}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-[#1E2420]">{playerName}</span>
        {isThinking && (
          <span className="text-xs text-[#1F6F50] animate-pulse font-medium">
            (ভাবছে...)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Captured piece glyphs */}
        <div className="flex items-center text-sm tracking-tight text-[#1E2420]/80">
          {capturedPieces.map((piece, idx) => (
            <span key={idx} className="inline-block select-none -ml-0.5 first:ml-0">
              {color === 'white' ? PIECE_UNICODE[piece].black : PIECE_UNICODE[piece].white}
            </span>
          ))}
        </div>

        {/* Advantage score */}
        {advantage > 0 && (
          <span className="text-xs font-mono font-bold text-[#1F6F50] bg-[#FFFDF8] px-1.5 py-0.5 rounded border border-[#1F6F50]/20">
            +{toBanglaNumeral(advantage)}
          </span>
        )}
      </div>
    </div>
  );
};
