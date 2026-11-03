import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Check } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import {
  SOLO_ENGINE_ELO_PRESETS,
  getEloBrainTitleBn,
  getEloTierDescriptionBn,
} from '../../domain/rating.ts';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';

export interface SoloBrainModalProps {
  isOpen: boolean;
  currentElo: number;
  onSelectElo: (elo: number) => void;
  onClose: () => void;
}

export const SoloBrainModal: React.FC<SoloBrainModalProps> = ({
  isOpen,
  currentElo,
  onSelectElo,
  onClose,
}) => {
  const [selectedElo, setSelectedElo] = useState<number>(currentElo);

  useEffect(() => {
    setSelectedElo(currentElo);
  }, [currentElo, isOpen]);

  const handleApply = () => {
    onSelectElo(selectedElo);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bn.solo.engineBrainModalTitle}
      maxWidth="md"
    >
      <div className="space-y-5 py-1">
        <p className="text-xs sm:text-sm text-muted">
          {bn.solo.engineBrainModalDesc}
        </p>

        {/* Current Selected ELO Spotlight Card */}
        <div className="p-4 rounded-xl bg-primary-soft/60 border border-primary/25 space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl" aria-hidden="true">🧠</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-primary">
              {toBanglaNumeral(selectedElo)}
              {selectedElo >= 2000 ? '+' : ''} এলো (Elo)
            </span>
          </div>

          <Badge variant="primary" size="md">
            {getEloBrainTitleBn(selectedElo)}
          </Badge>

          <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed pt-1">
            {getEloTierDescriptionBn(selectedElo)}
          </p>
        </div>

        {/* Preset ELO Pills */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-fg block">
            জনপ্রিয় ব্রেন লেভেল প্রিসেট:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SOLO_ENGINE_ELO_PRESETS.map((preset) => {
              const isSelected = selectedElo === preset.elo;
              return (
                <button
                  key={preset.elo}
                  type="button"
                  onClick={() => setSelectedElo(preset.elo)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer touch-target flex flex-col justify-between gap-1 relative ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-fg shadow-sm ring-2 ring-primary/30'
                      : 'border-border bg-surface hover:bg-surface-2 text-fg'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono font-bold text-sm">
                      {preset.labelBn}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-primary-fg/80' : 'text-muted'
                    }`}
                  >
                    {preset.tierBn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine Tuning Slider */}
        <div className="space-y-2 pt-1 border-t border-border">
          <div className="flex items-center justify-between text-xs font-semibold text-fg">
            <span>{bn.solo.customEloLabel}:</span>
            <span className="font-mono text-primary font-bold">
              {toBanglaNumeral(selectedElo)} এলো
            </span>
          </div>

          <input
            type="range"
            min="800"
            max="2600"
            step="50"
            value={selectedElo}
            onChange={(e) => setSelectedElo(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <div className="flex justify-between text-[11px] text-muted font-mono">
            <span>৮০০ (সহজ)</span>
            <span>১৫০০ (ক্লাব)</span>
            <span>২০০০+ (মাস্টার)</span>
            <span>২৬০০ (সর্বোচ্চ)</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg hover:bg-surface-2 text-fg transition-colors cursor-pointer touch-target"
          >
            {bn.ui.cancel}
          </button>
          <Button
            onClick={handleApply}
            variant="primary"
            size="md"
            className="shadow-sm font-semibold"
          >
            {bn.ui.save}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
