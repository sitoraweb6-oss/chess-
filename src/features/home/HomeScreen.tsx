import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, BookOpen, Puzzle, Trophy, History } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import { getStorageData, StorageData, GameRecord, getTotalOpeningsProgress } from '../../storage/index.ts';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StorageData>(getStorageData());

  useEffect(() => {
    setData(getStorageData());
  }, []);

  const openingsProgress = getTotalOpeningsProgress(8);

  // Time-based greeting
  const hour = new Date().getHours();
  let greeting: string = bn.home.greetingMorning;
  if (hour >= 12 && hour < 17) {
    greeting = bn.home.greetingAfternoon;
  } else if (hour >= 17) {
    greeting = bn.home.greetingEvening;
  }

  const lastGame: GameRecord | undefined = data.games[0];

  // Calculate average accuracy
  const analyzedGames = data.games.filter((g) => g.accuracy > 0);
  const avgAccuracy =
    analyzedGames.length > 0
      ? Math.round(
          analyzedGames.reduce((acc, g) => acc + g.accuracy, 0) / analyzedGames.length
        )
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Hero Welcome & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2420] tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-[#6B726D] mt-1">
            {bn.tagline}
          </p>
        </div>

        {/* Primary CTA */}
        <Button
          onClick={() => navigate('/play')}
          variant="primary"
          size="lg"
          className="shadow-md"
          leftIcon={<Play className="w-5 h-5 fill-current" />}
        >
          {bn.home.startPlayCTA}
        </Button>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card variant="surface" className="text-center p-3 sm:p-4">
          <span className="text-xs text-[#6B726D] block">{bn.home.currentRating}</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#1F6F50] mt-1 block">
            {toBanglaNumeral(data.rating)}
          </span>
        </Card>

        <Card variant="surface" className="text-center p-3 sm:p-4">
          <span className="text-xs text-[#6B726D] block">{bn.home.gamesPlayed}</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#1E2420] mt-1 block">
            {toBanglaNumeral(data.games.length)}
          </span>
        </Card>

        <Card variant="surface" className="text-center p-3 sm:p-4">
          <span className="text-xs text-[#6B726D] block">{bn.home.accuracyAvg}</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#E0A43A] mt-1 block">
            {avgAccuracy > 0 ? `${toBanglaNumeral(avgAccuracy)}%` : '—'}
          </span>
        </Card>
      </div>

      {/* Last Game Banner */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[#1E2420] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#E0A43A]" />
          <span>{bn.home.lastGame}</span>
        </h2>

        {lastGame ? (
          <Card variant="highlight" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  quality={
                    lastGame.result === 'win'
                      ? 'good'
                      : lastGame.result === 'loss'
                      ? 'blunder'
                      : 'inaccuracy'
                  }
                >
                  {lastGame.result === 'win'
                    ? bn.home.resultWin
                    : lastGame.result === 'loss'
                    ? bn.home.resultLoss
                    : bn.home.resultDraw}
                </Badge>
                <span className="text-sm font-semibold text-[#1E2420]">
                  বটের বিরুদ্ধে (লেভেল {toBanglaNumeral(lastGame.botLevel)})
                </span>
              </div>
              <p className="text-xs text-[#6B726D]">
                {lastGame.resultReason} · {toBanglaNumeral(lastGame.movesCount)} চাল
                {lastGame.accuracy > 0 && ` · নির্ভুলতা ${toBanglaNumeral(lastGame.accuracy)}%`}
              </p>
            </div>

            <Button
              onClick={() => navigate(`/review/${lastGame.id}`)}
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 fill-current" />}
            >
              {bn.home.viewReview}
            </Button>
          </Card>
        ) : (
          <EmptyState
            title="এখনও কোনো খেলা নেই"
            description={bn.home.noGamesYet}
            actionLabel={bn.home.startPlayCTA}
            onAction={() => navigate('/play')}
          />
        )}
      </div>

      {/* Learning & Practice Modules (Placeholders with Soon badge) */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-bold text-[#1E2420]">
          {bn.home.featuresTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Openings feature card with live progress */}
          <Card
            variant="surface"
            className="hover:border-[#1F6F50]/40 hover:shadow-card transition-all p-4 sm:p-5 space-y-3 cursor-pointer group"
            onClick={() => navigate('/openings')}
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-[#E6F2EC] text-[#1F6F50] rounded-xl group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              {openingsProgress.completedCount > 0 ? (
                <span className="text-xs font-semibold text-[#1F6F50] bg-[#E6F2EC] px-2.5 py-1 rounded-full border border-[#1F6F50]/20">
                  {toBanglaNumeral(openingsProgress.completedCount)} / ৮ সম্পন্ন
                </span>
              ) : (
                <span className="text-xs font-semibold text-[#1F6F50] bg-[#E6F2EC] px-2.5 py-1 rounded-full">
                  ৮টি ওপেনিং
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-[#1E2420] text-base group-hover:text-[#1F6F50] transition-colors">
                {bn.home.featureOpenings}
              </h3>
              <p className="text-xs text-[#6B726D] mt-1 leading-normal">
                {bn.home.featureOpeningsDesc}
              </p>
            </div>
            {openingsProgress.completedCount > 0 && (
              <div className="w-full bg-[#F4EFE4] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1F6F50] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(openingsProgress.completedCount / 8) * 100}%`,
                  }}
                />
              </div>
            )}
          </Card>

          {/* Tactics Puzzles feature placeholder */}
          <Card
            variant="surface"
            className="opacity-80 hover:opacity-100 transition-opacity p-4 sm:p-5 space-y-3 cursor-pointer"
            onClick={() => navigate('/puzzles')}
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-[#FDF6E9] text-[#B87D1B] rounded-xl">
                <Puzzle className="w-6 h-6" />
              </div>
              <Badge variant="accent">
                {bn.home.comingSoonBadge}
              </Badge>
            </div>
            <div>
              <h3 className="font-bold text-[#1E2420] text-base">
                {bn.home.featurePuzzles}
              </h3>
              <p className="text-xs text-[#6B726D] mt-1 leading-normal">
                {bn.home.featurePuzzlesDesc}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Games History */}
      {data.games.length > 1 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-lg font-bold text-[#1E2420] flex items-center gap-2">
            <History className="w-5 h-5 text-[#6B726D]" />
            <span>{bn.home.gameHistory}</span>
          </h2>

          <div className="space-y-2">
            {data.games.slice(1, 6).map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(`/review/${g.id}`)}
                className="flex items-center justify-between p-3 bg-[#FFFDF8] hover:bg-[#F4EFE4] rounded-xl border border-[#1E2420]/10 transition-colors cursor-pointer touch-target"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    quality={
                      g.result === 'win'
                        ? 'good'
                        : g.result === 'loss'
                        ? 'blunder'
                        : 'inaccuracy'
                    }
                  >
                    {g.result === 'win'
                      ? bn.home.resultWin
                      : g.result === 'loss'
                      ? bn.home.resultLoss
                      : bn.home.resultDraw}
                  </Badge>
                  <span className="text-xs sm:text-sm font-semibold text-[#1E2420]">
                    বট (লেভেল {toBanglaNumeral(g.botLevel)}) · {toBanglaNumeral(g.movesCount)} চাল
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {g.accuracy > 0 && (
                    <span className="text-xs font-mono font-medium text-[#1F6F50] bg-[#E6F2EC] px-2 py-0.5 rounded-full">
                      {toBanglaNumeral(g.accuracy)}%
                    </span>
                  )}
                  <span className="text-xs text-[#1F6F50] font-medium hidden sm:inline">
                    {bn.home.viewReview} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
