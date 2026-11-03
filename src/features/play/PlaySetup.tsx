import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import { getBotRating } from '../../domain/rating.ts';

export interface PlaySetupProps {
  botLevel: number;
  onBotLevelChange: (lvl: number) => void;
  color: 'white' | 'black' | 'random';
  onColorChange: (c: 'white' | 'black' | 'random') => void;
  onStartGame: () => void;
}

export const PlaySetup: React.FC<PlaySetupProps> = ({
  botLevel,
  onBotLevelChange,
  color,
  onColorChange,
  onStartGame,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-md mx-auto my-6 p-6 space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-2 rounded-xl border border-border">
        <button
          type="button"
          className="py-2 px-2 text-xs font-bold rounded-lg bg-primary text-primary-fg shadow-xs flex items-center justify-center gap-1.5 cursor-default"
        >
          <span>🤖 বটের সাথে ম্যাচ</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/solo')}
          className="py-2 px-2 text-xs font-medium rounded-lg text-muted hover:text-fg hover:bg-surface flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-target"
        >
          <span>👤 নিজে একা খেলো</span>
          <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-bold">সীমাহীন</span>
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-fg">{bn.play.setupTitle}</h2>
        <p className="text-sm text-muted mt-1">{bn.home.startPlaySub}</p>
      </div>

      {/* Bot level slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="bot-level" className="font-semibold text-sm text-fg">
            {bn.play.botLevel}: {toBanglaNumeral(botLevel)}
          </label>
          <span className="text-xs font-mono font-medium text-primary bg-primary-soft px-2 py-0.5 rounded-full">
            আনুমানিক রেটিং: {toBanglaNumeral(getBotRating(botLevel))}
          </span>
        </div>
        <input
          id="bot-level"
          type="range"
          min="1"
          max="10"
          step="1"
          value={botLevel}
          onChange={(e) => onBotLevelChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[11px] text-muted font-mono">
          <span>লেভেল ১ (সহজ)</span>
          <span>লেভেল ৫ (মাঝারি)</span>
          <span>লেভেল ১০ (চ্যালেঞ্জ)</span>
        </div>
      </div>

      {/* Color selection */}
      <div className="space-y-2">
        <label className="font-semibold text-sm text-fg block">
          {bn.play.chooseColor}
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'white', label: bn.play.colorWhite, icon: '♔' },
            { id: 'random', label: bn.play.colorRandom, icon: '☯' },
            { id: 'black', label: bn.play.colorBlack, icon: '♚' },
          ].map((item) => {
            const isSelected = color === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onColorChange(item.id as 'white' | 'black' | 'random')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer touch-target ${
                  isSelected
                    ? 'border-primary bg-primary-soft text-primary font-semibold shadow-xs'
                    : 'border-border bg-surface hover:bg-surface-2 text-fg'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={onStartGame}
        variant="primary"
        size="lg"
        className="w-full"
        leftIcon={<Play className="w-5 h-5 fill-current" />}
      >
        {bn.play.startGame}
      </Button>
    </Card>
  );
};
