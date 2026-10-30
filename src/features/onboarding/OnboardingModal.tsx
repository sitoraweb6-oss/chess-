import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft, Play } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import { UserLevel, updateStorageProfile } from '../../storage/index.ts';
import { STARTING_RATINGS } from '../../domain/rating.ts';

export interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>('beginner');

  const handleStartPlacement = () => {
    updateStorageProfile('beginner', 600, false);
    onComplete();
    navigate('/play?mode=placement');
  };

  const handleFinishManual = () => {
    const startingRating = STARTING_RATINGS[selectedLevel];
    updateStorageProfile(selectedLevel, startingRating, true);
    onComplete();
  };

  const levels: { id: UserLevel; title: string; desc: string; rating: string }[] = [
    {
      id: 'beginner',
      title: bn.onboarding.levels.beginner.title,
      desc: bn.onboarding.levels.beginner.desc,
      rating: bn.onboarding.levels.beginner.rating,
    },
    {
      id: 'intermediate',
      title: bn.onboarding.levels.intermediate.title,
      desc: bn.onboarding.levels.intermediate.desc,
      rating: bn.onboarding.levels.intermediate.rating,
    },
    {
      id: 'advanced',
      title: bn.onboarding.levels.advanced.title,
      desc: bn.onboarding.levels.advanced.desc,
      rating: bn.onboarding.levels.advanced.rating,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={bn.appName} maxWidth="md">
      <div className="py-2">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-5 pb-2 border-b border-border text-xs text-muted">
          <span>ধাপ {toBanglaNumeral(step)} / {toBanglaNumeral(2)}</span>
          <div className="flex gap-1.5">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-colors ${
                  step === s ? 'bg-primary' : s < step ? 'bg-primary/40' : 'bg-surface-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 mx-auto bg-primary-soft text-primary rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              👑
            </div>
            <h3 className="text-xl font-bold text-fg">{bn.onboarding.step1Title}</h3>
            <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
              {bn.onboarding.step1Desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left pt-2">
              <Card variant="surface-2" className="p-3 space-y-1">
                <span className="text-xs font-bold text-primary block">১. বুদ্ধিমান বট</span>
                <span className="text-xs text-muted">তোমার খেলার মানের সাথে মানিয়ে খেলবে।</span>
              </Card>
              <Card variant="surface-2" className="p-3 space-y-1">
                <span className="text-xs font-bold text-primary block">২. বাংলা রিভিউ</span>
                <span className="text-xs text-muted">ভুলের কারণ ও সঠিক চালের চমৎকার ব্যাখ্যা।</span>
              </Card>
              <Card variant="surface-2" className="p-3 space-y-1">
                <span className="text-xs font-bold text-primary block">৩. ভুলের পাজল</span>
                <span className="text-xs text-muted">নিজের ভুলগুলো থেকেই ব্যক্তিগত অনুশীলন।</span>
              </Card>
            </div>

            <div className="pt-3 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-md"
              >
                {bn.onboarding.btnNext}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Placement Game Choice */}
        {step === 2 && (
          <div className="space-y-5 py-2">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto bg-surface-2 text-accent rounded-2xl flex items-center justify-center text-2xl shadow-xs">
                🎯
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-fg">
                {bn.onboarding.placementPromptTitle}
              </h3>
              <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
                {bn.onboarding.placementPromptDesc}
              </p>
            </div>

            {/* Placement CTA Card */}
            <Card variant="highlight" className="p-4 sm:p-5 text-center space-y-3">
              <span className="text-xs font-medium text-primary block">
                ⚡ কোনো চাপ নেই — এটি একটি মজার বন্ধুত্বপূর্ণ খেলা
              </span>
              <Button
                onClick={handleStartPlacement}
                variant="primary"
                size="lg"
                className="w-full shadow-md py-3 text-base"
                leftIcon={<Play className="w-5 h-5 fill-current" />}
              >
                {bn.onboarding.btnPlayPlacement}
              </Button>
            </Card>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-xs text-muted">অথবা</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => setStep(3)}
                variant="secondary"
                size="md"
                className="w-full"
              >
                {bn.onboarding.btnSkipPlacement}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Manual Level Picker (if skipped) */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-lg font-bold text-fg">{bn.onboarding.step2Title}</h3>
              <p className="text-xs text-muted mt-1">{bn.onboarding.step2Desc}</p>
            </div>

            <div className="space-y-2.5">
              {levels.map((lvl) => {
                const isSelected = selectedLevel === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between touch-target ${
                      isSelected
                        ? 'border-primary bg-primary-soft shadow-xs'
                        : 'border-border hover:border-border/80 bg-surface'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-fg">
                          {lvl.title}
                        </span>
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary-soft text-primary">
                          রেটিং ~{lvl.rating}
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-snug">
                        {lvl.desc}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-fg'
                          : 'border-border'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="ghost"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                {bn.onboarding.btnBack}
              </Button>

              <Button
                onClick={handleFinishManual}
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-sm"
              >
                {bn.onboarding.btnStart}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
