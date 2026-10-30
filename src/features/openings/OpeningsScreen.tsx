import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, ArrowLeft, Trophy } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ProgressBar } from '../../components/ui/ProgressBar.tsx';
import { OPENINGS_DATA, ChessOpening } from '../../domain/openings.ts';
import { OpeningLessonView } from './OpeningLessonView.tsx';
import { OpeningPracticeView } from './OpeningPracticeView.tsx';
import { getStorageData, getTotalOpeningsProgress, OpeningProgressRecord } from '../../storage/index.ts';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';

export const OpeningsScreen: React.FC = () => {
  const [selectedOpening, setSelectedOpening] = useState<ChessOpening | null>(null);
  const [activeTab, setActiveTab] = useState<'lesson' | 'practice'>('lesson');
  const [progressMap, setProgressMap] = useState<Record<string, OpeningProgressRecord>>({});

  const refreshProgress = () => {
    const data = getStorageData();
    setProgressMap(data.openingProgress || {});
  };

  useEffect(() => {
    refreshProgress();
  }, [selectedOpening]);

  const totalProgress = getTotalOpeningsProgress(OPENINGS_DATA.length);

  // If an opening is selected, display detailed Lesson or Practice mode
  if (selectedOpening) {
    const opProgress = progressMap[selectedOpening.id];

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Navigation Breadcrumb & Opening Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1E2420]/10">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSelectedOpening(null)}
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              তালিকা
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1E2420]">
                  {selectedOpening.nameBn}
                </h1>
                <span className="text-xs font-mono bg-[#E6F2EC] text-[#1F6F50] px-2 py-0.5 rounded-full font-medium">
                  {selectedOpening.eco}
                </span>
              </div>
              <p className="text-xs text-[#6B726D] mt-0.5">
                {selectedOpening.name} · {selectedOpening.forColorBn} পক্ষের ওপেনিং · {selectedOpening.difficultyBn}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F4EFE4] rounded-xl self-start sm:self-auto border border-[#1E2420]/10">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer touch-target ${
                activeTab === 'lesson'
                  ? 'bg-[#1F6F50] text-[#FFFDF8] shadow-xs'
                  : 'text-[#1E2420]/75 hover:text-[#1E2420]'
              }`}
            >
              {bn.openings.lessonTab}
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer touch-target ${
                activeTab === 'practice'
                  ? 'bg-[#1F6F50] text-[#FFFDF8] shadow-xs'
                  : 'text-[#1E2420]/75 hover:text-[#1E2420]'
              }`}
            >
              {bn.openings.practiceTab}
              {opProgress?.practiceScore ? ` (${toBanglaNumeral(opProgress.practiceScore)}%)` : ''}
            </button>
          </div>
        </div>

        {/* Active View */}
        {activeTab === 'lesson' ? (
          <OpeningLessonView
            opening={selectedOpening}
            onSwitchToPractice={() => setActiveTab('practice')}
          />
        ) : (
          <OpeningPracticeView
            opening={selectedOpening}
            onSwitchToLesson={() => setActiveTab('lesson')}
          />
        )}
      </div>
    );
  }

  // Catalog View: List of 8 Openings
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header and Total Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E2420]/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2420] tracking-tight">
            {bn.openings.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B726D] mt-1 max-w-xl">
            {bn.openings.subtitle}
          </p>
        </div>

        {/* Progress Card */}
        <div className="w-full sm:w-64 bg-[#F4EFE4]/60 p-3.5 rounded-xl border border-[#1E2420]/10">
          <ProgressBar
            current={totalProgress.completedCount}
            total={totalProgress.totalCount}
            label="পাঠ সম্পন্ন"
          />
        </div>
      </div>

      {/* Grid of 8 Openings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPENINGS_DATA.map((op) => {
          const prog = progressMap[op.id];
          const isDone = prog?.completedLesson;

          const difficultyColor =
            op.difficulty === 'beginner'
              ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#43A047]/20'
              : op.difficulty === 'intermediate'
              ? 'bg-[#FFF8E1] text-[#C47D00] border-[#F9A825]/20'
              : 'bg-[#FFEBEE] text-[#C62828] border-[#E53935]/20';

          return (
            <Card
              key={op.id}
              variant={isDone ? 'highlight' : 'surface'}
              className="p-4 sm:p-5 flex flex-col justify-between hover:border-[#1F6F50]/40 transition-all cursor-pointer group touch-target"
              onClick={() => {
                setSelectedOpening(op);
                setActiveTab('lesson');
              }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-[#1E2420] group-hover:text-[#1F6F50] transition-colors">
                      {op.nameBn}
                    </h3>
                    <span className="text-xs text-[#6B726D] block">
                      {op.name} · {op.eco}
                    </span>
                  </div>

                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#43A047]/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>সম্পন্ন</span>
                    </span>
                  ) : (
                    <span className="text-xs text-[#6B726D]">
                      {toBanglaNumeral(op.moves.length)} চাল
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#1E2420]/80 leading-relaxed line-clamp-2">
                  {op.mainIdeaLines[0]}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className={`px-2 py-0.5 rounded-full border font-medium ${difficultyColor}`}>
                    {op.difficultyBn}
                  </span>
                  <span className="bg-[#F4EFE4] text-[#1E2420]/80 px-2 py-0.5 rounded-full border border-[#1E2420]/10">
                    ঘুঁটি: {op.forColorBn}
                  </span>
                  {prog?.practiceScore ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-[#1F6F50] bg-[#E6F2EC] px-2 py-0.5 rounded-full">
                      <Trophy className="w-3 h-3 text-[#E0A43A]" />
                      <span>{toBanglaNumeral(prog.practiceScore)}%</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-[#1F6F50] font-semibold border-t border-[#1E2420]/10 mt-3">
                <span>পাঠ ও অনুশীলন শুরু করুন</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
