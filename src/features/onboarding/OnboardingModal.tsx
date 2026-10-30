import React, { useState } from 'react';
import { Award, Compass, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.tsx';
import { Button } from '../../components/ui/Button.tsx';
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>('beginner');

  const handleFinish = () => {
    const startingRating = STARTING_RATINGS[selectedLevel];
    updateStorageProfile(selectedLevel, startingRating);
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
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1E2420]/10 text-xs text-[#6B726D]">
          <span>ধাপ {toBanglaNumeral(step)} / {toBanglaNumeral(3)}</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-colors ${
                  step === s ? 'bg-[#1F6F50]' : s < step ? 'bg-[#1F6F50]/40' : 'bg-[#1E2420]/15'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 text-center py-3">
            <div className="w-16 h-16 mx-auto bg-[#E6F2EC] text-[#1F6F50] rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              👑
            </div>
            <h3 className="text-xl font-bold text-[#1E2420]">{bn.onboarding.step1Title}</h3>
            <p className="text-sm text-[#6B726D] leading-relaxed max-w-md mx-auto">
              {bn.onboarding.step1Desc}
            </p>
            <div className="pt-4 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {bn.onboarding.btnNext}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Experience Level */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-lg font-bold text-[#1E2420]">{bn.onboarding.step2Title}</h3>
              <p className="text-xs text-[#6B726D] mt-1">{bn.onboarding.step2Desc}</p>
            </div>

            <div className="space-y-2.5">
              {levels.map((lvl) => {
                const isSelected = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 touch-target ${
                      isSelected
                        ? 'border-[#1F6F50] bg-[#E6F2EC] shadow-sm'
                        : 'border-[#1E2420]/15 bg-[#FFFDF8] hover:bg-[#F4EFE4]'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#1F6F50] bg-[#1F6F50] text-[#FFFDF8]'
                          : 'border-[#6B726D] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#1E2420]">{lvl.title}</span>
                        <span className="text-xs font-mono text-[#1F6F50] font-medium">
                          রেটিং: {lvl.rating}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B726D] mt-1 leading-normal">{lvl.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="ghost"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                {bn.onboarding.btnBack}
              </Button>
              <Button
                onClick={() => setStep(3)}
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {bn.onboarding.btnNext}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: How Review Works */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-[#1E2420]">{bn.onboarding.step3Title}</h3>
              <p className="text-xs text-[#6B726D] mt-1">{bn.onboarding.step3Desc}</p>
            </div>

            <div className="space-y-3 bg-[#F4EFE4]/60 p-4 rounded-xl border border-[#1E2420]/10">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#E6F2EC] text-[#1F6F50] rounded-lg shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1E2420]">{bn.onboarding.step3Point1}</p>
                  <p className="text-xs text-[#6B726D]">লেভেল ১ থেকে ১০ পর্যন্ত আপনার সুবিধামতো গতিতে খেলুন।</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#FDF6E9] text-[#B87D1B] rounded-lg shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1E2420]">{bn.onboarding.step3Point2}</p>
                  <p className="text-xs text-[#6B726D]">অসাবধানতা ও ভুল চালগুলোর বাংলা ব্যাখ্যা ও সঠিক চালের দিকনির্দেশনা।</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#E6F2EC] text-[#1F6F50] rounded-lg shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1E2420]">{bn.onboarding.step3Point3}</p>
                  <p className="text-xs text-[#6B726D]">প্রতিটি খেলার নির্ভুলতা ও এলো (Elo) রেটিং স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="ghost"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                {bn.onboarding.btnBack}
              </Button>
              <Button
                onClick={handleFinish}
                variant="primary"
                rightIcon={<Sparkles className="w-4 h-4" />}
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
