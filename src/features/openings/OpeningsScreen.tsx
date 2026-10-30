import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, ArrowLeft, Trophy, Flame } from 'lucide-react';
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
  const [categoryFilter, setCategoryFilter] = useState<'opening' | 'gambit'>('opening');
  const [progressMap, setProgressMap] = useState<Record<string, OpeningProgressRecord>>({});

  const refreshProgress = () => {
    const data = getStorageData();
    setProgressMap(data.openingProgress || {});
  };

  useEffect(() => {
    refreshProgress();
  }, [selectedOpening]);

  const totalProgress = getTotalOpeningsProgress(OPENINGS_DATA.length);

  const displayedList = OPENINGS_DATA.filter((o) => o.category === categoryFilter);

  // If an opening is selected, display detailed Lesson or Practice mode
  if (selectedOpening) {
    const opProgress = progressMap[selectedOpening.id];

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Navigation Breadcrumb & Opening Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
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
                <h1 className="text-xl sm:text-2xl font-bold text-fg">
                  {selectedOpening.nameBn}
                </h1>
                <span className="text-xs font-mono bg-primary-soft text-primary px-2 py-0.5 rounded-full font-medium">
                  {selectedOpening.eco}
                </span>
                {selectedOpening.category === 'gambit' && (
                  <Badge variant="accent" size="sm">
                    গ্যাম্বিট
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                {selectedOpening.name} · {selectedOpening.forColorBn} পক্ষের ওপেনিং · {selectedOpening.difficultyBn}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-xl self-start sm:self-auto border border-border">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer touch-target ${
                activeTab === 'lesson'
                  ? 'bg-primary text-primary-fg shadow-xs'
                  : 'text-muted hover:text-fg'
              }`}
            >
              {bn.openings.lessonTab}
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer touch-target ${
                activeTab === 'practice'
                  ? 'bg-primary text-primary-fg shadow-xs'
                  : 'text-muted hover:text-fg'
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

  // Catalog View: List of 11 Openings + 7 Gambits (18 Total)
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header and Total Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">
            {bn.openings.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
            {bn.openings.subtitle}
          </p>
        </div>

        {/* Progress Card */}
        <div className="w-full sm:w-64 bg-surface-2/60 p-3.5 rounded-xl border border-border">
          <ProgressBar
            current={totalProgress.completedCount}
            total={totalProgress.totalCount}
            label="পাঠ সম্পন্ন"
          />
        </div>
      </div>

      {/* Category Tabs: Openings vs Gambits */}
      <div className="flex items-center gap-2 p-1 bg-surface-2 rounded-xl max-w-sm border border-border">
        <button
          onClick={() => setCategoryFilter('opening')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            categoryFilter === 'opening'
              ? 'bg-primary text-primary-fg shadow-xs'
              : 'text-muted hover:text-fg'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{bn.openings.openingsTab}</span>
        </button>
        <button
          onClick={() => setCategoryFilter('gambit')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            categoryFilter === 'gambit'
              ? 'bg-primary text-primary-fg shadow-xs'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Flame className="w-4 h-4 text-accent" />
          <span>{bn.openings.gambitsTab}</span>
        </button>
      </div>

      {/* Grid of Openings / Gambits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedList.map((op) => {
          const prog = progressMap[op.id];
          const isDone = prog?.completedLesson;

          const difficultyColor =
            op.difficulty === 'beginner'
              ? 'bg-success/15 text-success border-success/30'
              : op.difficulty === 'intermediate'
              ? 'bg-accent/15 text-accent border-accent/30'
              : 'bg-danger-soft text-danger border-danger/30';

          return (
            <Card
              key={op.id}
              variant={isDone ? 'highlight' : 'surface'}
              className="p-4 sm:p-5 flex flex-col justify-between hover:border-primary/40 transition-all cursor-pointer group touch-target"
              onClick={() => {
                setSelectedOpening(op);
                setActiveTab('lesson');
              }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-fg group-hover:text-primary transition-colors">
                      {op.nameBn}
                    </h3>
                    <span className="text-xs text-muted block">
                      {op.name} · {op.eco}
                    </span>
                  </div>

                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/15 px-2 py-0.5 rounded-full border border-success/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>সম্পন্ন</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted">
                      {toBanglaNumeral(op.moves.length)} চাল
                    </span>
                  )}
                </div>

                <p className="text-xs text-fg/80 leading-relaxed line-clamp-2">
                  {op.mainIdeaLines[0]}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className={`px-2 py-0.5 rounded-full border font-medium ${difficultyColor}`}>
                    {op.difficultyBn}
                  </span>
                  <span className="bg-surface-2 text-fg/80 px-2 py-0.5 rounded-full border border-border">
                    ঘুঁটি: {op.forColorBn}
                  </span>
                  {prog?.practiceScore ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                      <Trophy className="w-3 h-3 text-accent" />
                      <span>{toBanglaNumeral(prog.practiceScore)}%</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-primary font-semibold border-t border-border mt-3">
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
