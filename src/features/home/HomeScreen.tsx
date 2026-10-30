import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Sparkles,
  BookOpen,
  Puzzle,
  Trophy,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import {
  getStorageData,
  StorageData,
  GameRecord,
  getDuePersonalPuzzles,
} from '../../storage/index.ts';
import { isProvisionalRating, getBotRating } from '../../domain/rating.ts';
import { buildWeaknessProfile, getSuggestedOpening } from '../../domain/profile.ts';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StorageData>(getStorageData());

  useEffect(() => {
    setData(getStorageData());
  }, []);

  // Time-based greeting
  const hour = new Date().getHours();
  let greeting: string = bn.home.greetingMorning;
  if (hour >= 12 && hour < 17) {
    greeting = bn.home.greetingAfternoon;
  } else if (hour >= 17) {
    greeting = bn.home.greetingEvening;
  }

  // Games count this week
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const gamesThisWeek = data.games.filter(
    (g) => new Date(g.date).getTime() >= oneWeekAgo
  ).length;

  // Trend indicator based on recent rating history
  const recentRatings = data.ratingHistory.slice(-5);
  let trendType: 'up' | 'stable' | 'down' = 'stable';
  if (recentRatings.length >= 2) {
    const netChange = recentRatings[recentRatings.length - 1].rating - recentRatings[0].rating;
    if (netChange >= 20) trendType = 'up';
    else if (netChange <= -20) trendType = 'down';
  }

  const isProvisional = isProvisionalRating(data.games.length);

  // Weakness Profile & Suggestions
  const weaknessProfile = buildWeaknessProfile(data.games);
  const primaryWeakness = weaknessProfile.topWeaknesses[0];

  // Most played color
  const whiteGames = data.games.filter((g) => g.userColor === 'white').length;
  const favoriteColor = whiteGames >= data.games.length - whiteGames ? 'white' : 'black';
  const suggestedOpening = getSuggestedOpening(data.rating, favoriteColor);

  // Due personal puzzles count
  const duePuzzles = getDuePersonalPuzzles();
  const duePuzzlesCount = duePuzzles.length;

  // Recommended bot level based on current rating
  // 400-600 -> Lvl 2, 600-800 -> Lvl 3, 800-1000 -> Lvl 4, etc.
  const recommendedBotLevel = Math.max(1, Math.min(8, Math.round((data.rating - 200) / 200)));
  const recommendedBotRating = getBotRating(recommendedBotLevel);

  const lastGame: GameRecord | undefined = data.games[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Hero Welcome & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2420] dark:text-[#EDE8DE] tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-[#6B726D] dark:text-[#A0ABA4] mt-1">
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
          {bn.home.card4Action}
        </Button>
      </div>

      {/* Progress Strip: Rating, Provisional Badge, Games this week, Trend */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Rating Card */}
        <Card variant="surface" className="text-center p-3 sm:p-4">
          <span className="text-xs text-[#6B726D] block">{bn.home.currentRating}</span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#1F6F50] dark:text-[#E6F2EC]">
              {toBanglaNumeral(data.rating)}
            </span>
            {isProvisional && (
              <Badge variant="accent" size="sm">
                {bn.home.provisionalBadge}
              </Badge>
            )}
          </div>
        </Card>

        {/* Games this week Card */}
        <Card variant="surface" className="text-center p-3 sm:p-4">
          <span className="text-xs text-[#6B726D] block">{bn.home.gamesThisWeek}</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#1E2420] dark:text-[#EDE8DE] mt-1 block">
            {toBanglaNumeral(gamesThisWeek)}
          </span>
        </Card>

        {/* Trend Card */}
        <Card variant="surface" className="text-center p-3 sm:p-4 flex flex-col justify-center items-center">
          <span className="text-xs text-[#6B726D] block">খেলার ধারা</span>
          <div className="flex items-center gap-1 mt-1 font-medium text-xs sm:text-sm">
            {trendType === 'up' && (
              <>
                <TrendingUp className="w-4 h-4 text-[#43A047]" />
                <span className="text-[#43A047]">{bn.home.trendUp}</span>
              </>
            )}
            {trendType === 'stable' && (
              <>
                <Minus className="w-4 h-4 text-[#E0A43A]" />
                <span className="text-[#E0A43A]">{bn.home.trendStable}</span>
              </>
            )}
            {trendType === 'down' && (
              <>
                <TrendingDown className="w-4 h-4 text-[#FB8C00]" />
                <span className="text-[#FB8C00]">{bn.home.trendDown}</span>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* "আজকের পাঠ" Personal Coach Header */}
      <div className="space-y-1 pt-1">
        <h2 className="text-xl font-bold text-[#1E2420] dark:text-[#EDE8DE] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#1F6F50]" />
          <span>{bn.home.todaysLessonTitle}</span>
        </h2>
        <p className="text-xs text-[#6B726D] dark:text-[#A0ABA4]">
          {bn.home.todaysLessonSubtitle}
        </p>
      </div>

      {/* 4 Personal Coach Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Top Weakness Practice */}
        <Card variant="surface" className="p-4 sm:p-5 flex flex-col justify-between space-y-3 border-l-4 border-l-[#E53935] shadow-card">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#E53935] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{bn.home.card1Title}</span>
              </span>
              {primaryWeakness && primaryWeakness.count > 0 && (
                <Badge variant="mistake" size="sm">
                  {toBanglaNumeral(primaryWeakness.count)} বার হয়েছে
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-base text-[#1E2420] dark:text-[#EDE8DE]">
              {primaryWeakness ? primaryWeakness.titleBn : 'ঘুঁটির নিরাপত্তা বজায় রাখা'}
            </h3>
            <p className="text-xs text-[#6B726D] dark:text-[#A0ABA4] leading-relaxed">
              {primaryWeakness ? primaryWeakness.tipBn : 'চাল দেওয়ার আগে নিশ্চিত হয়ে নাও কোনো ঘুঁটি অরক্ষিত থেকে যাচ্ছে কি না।'}
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/puzzles')}
              variant="secondary"
              size="sm"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {bn.home.card1Action}
            </Button>
          </div>
        </Card>

        {/* Card 2: "তোমার ভুল থেকে শেখো" Personal Puzzles */}
        <Card variant="surface" className="p-4 sm:p-5 flex flex-col justify-between space-y-3 border-l-4 border-l-[#E0A43A] shadow-card">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#B87D1B] flex items-center gap-1.5">
                <Puzzle className="w-4 h-4" />
                <span>{bn.home.card2Title}</span>
              </span>
              <Badge variant="accent" size="sm">
                স্পেসড রিপিটিশন
              </Badge>
            </div>
            <h3 className="font-bold text-base text-[#1E2420] dark:text-[#EDE8DE]">
              {duePuzzlesCount > 0
                ? bn.home.card2DescReady.replace('{count}', toBanglaNumeral(duePuzzlesCount))
                : bn.home.card2DescEmpty}
            </h3>
            <p className="text-xs text-[#6B726D] dark:text-[#A0ABA4] leading-relaxed">
              তোমার বাস্তব খেলার ব্লান্ডার ও ভুল চালগুলো এখানে সংরক্ষিত হয়েছে, যাতে একই ভুল দ্বিতীয়বার না হয়।
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/puzzles')}
              variant="secondary"
              size="sm"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {bn.home.card2Action}
            </Button>
          </div>
        </Card>

        {/* Card 3: Suggested Opening */}
        <Card variant="surface" className="p-4 sm:p-5 flex flex-col justify-between space-y-3 border-l-4 border-l-[#1F6F50] shadow-card">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1F6F50] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{bn.home.card3Title}</span>
              </span>
              <Badge variant="primary" size="sm">
                {favoriteColor === 'white' ? 'সাদা পক্ষ' : 'কালো পক্ষ'}
              </Badge>
            </div>
            <h3 className="font-bold text-base text-[#1E2420] dark:text-[#EDE8DE]">
              {suggestedOpening.nameBn}
            </h3>
            <p className="text-xs text-[#6B726D] dark:text-[#A0ABA4] leading-relaxed">
              {suggestedOpening.reasonBn}
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/openings')}
              variant="secondary"
              size="sm"
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {bn.home.card3Action}
            </Button>
          </div>
        </Card>

        {/* Card 4: Quick Bot Game */}
        <Card variant="surface" className="p-4 sm:p-5 flex flex-col justify-between space-y-3 border-l-4 border-l-[#1E88E5] shadow-card">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E88E5] flex items-center gap-1.5">
                <Play className="w-4 h-4" />
                <span>{bn.home.card4Title}</span>
              </span>
              <Badge variant="good" size="sm">
                লেভেল {toBanglaNumeral(recommendedBotLevel)}
              </Badge>
            </div>
            <h3 className="font-bold text-base text-[#1E2420] dark:text-[#EDE8DE]">
              {bn.home.card4BotDesc
                .replace('{level}', toBanglaNumeral(recommendedBotLevel))
                .replace('{rating}', toBanglaNumeral(recommendedBotRating))}
            </h3>
            <p className="text-xs text-[#6B726D] dark:text-[#A0ABA4] leading-relaxed">
              তোমার বর্তমান রেটিং ও দক্ষতার সাথে সবচেয়ে মানানসই প্রতিপক্ষের সাথে আত্মবিশ্বাস বৃদ্ধির ম্যাচ খেলো।
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/play')}
              variant="primary"
              size="sm"
              className="w-full shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {bn.home.card4Action}
            </Button>
          </div>
        </Card>
      </div>

      {/* Last Game Banner */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-bold text-[#1E2420] dark:text-[#EDE8DE] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#E0A43A]" />
          <span>{bn.home.lastGame}</span>
        </h2>

        {lastGame ? (
          <Card variant="highlight" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    lastGame.result === 'win'
                      ? 'good'
                      : lastGame.result === 'loss'
                      ? 'mistake'
                      : 'accent'
                  }
                >
                  {lastGame.result === 'win'
                    ? bn.home.resultWin
                    : lastGame.result === 'loss'
                    ? bn.home.resultLoss
                    : bn.home.resultDraw}
                </Badge>
                <span className="text-xs text-[#6B726D]">
                  {new Date(lastGame.date).toLocaleDateString('bn-BD', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                {lastGame.isPlacement && (
                  <Badge variant="accent" size="sm">
                    মূল্যায়ন ম্যাচ
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#1E2420] dark:text-[#EDE8DE]">
                বট লেভেল {toBanglaNumeral(lastGame.botLevel)} · {lastGame.resultReason} ·{' '}
                {toBanglaNumeral(lastGame.movesCount)} চাল
              </p>
            </div>

            <Button
              onClick={() => navigate(`/review/${lastGame.id}`)}
              variant="secondary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {bn.home.viewReview}
            </Button>
          </Card>
        ) : (
          <Card variant="surface" className="p-6 text-center text-xs text-[#6B726D]">
            {bn.home.noGamesYet}
          </Card>
        )}
      </div>

      {/* Game History List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1E2420] dark:text-[#EDE8DE] flex items-center gap-2">
            <History className="w-5 h-5 text-[#1F6F50]" />
            <span>{bn.home.gameHistory}</span>
          </h2>
          <span className="text-xs font-mono text-[#6B726D]">
            সর্বশেষ {toBanglaNumeral(data.games.length)} টি খেলা
          </span>
        </div>

        {data.games.length === 0 ? (
          <EmptyState
            title={bn.home.emptyHistory}
            description="বটের সাথে একটি নতুন খেলা খেলে আপনার প্রথম পর্যালোচনা তৈরি করুন।"
            actionLabel={bn.home.card4Action}
            onAction={() => navigate('/play')}
          />
        ) : (
          <div className="space-y-2">
            {data.games.map((g) => (
              <Card
                key={g.id}
                variant="surface"
                className="p-3 sm:p-4 flex items-center justify-between hover:bg-[#F4EFE4]/60 dark:hover:bg-[#1A231E]/60 transition-colors cursor-pointer"
                onClick={() => navigate(`/review/${g.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      g.result === 'win'
                        ? 'bg-[#43A047]'
                        : g.result === 'loss'
                        ? 'bg-[#E53935]'
                        : 'bg-[#E0A43A]'
                    }`}
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-[#1E2420] dark:text-[#EDE8DE] block">
                      বট লেভেল {toBanglaNumeral(g.botLevel)} ({g.userColor === 'white' ? 'সাদা' : 'কালো'})
                    </span>
                    <span className="text-[11px] text-[#6B726D]">
                      {g.resultReason} · {toBanglaNumeral(g.movesCount)} চাল
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {g.accuracy > 0 && (
                    <span className="text-xs font-mono font-medium text-[#1F6F50] dark:text-[#E6F2EC]">
                      {toBanglaNumeral(g.accuracy)}% নির্ভুল
                    </span>
                  )}
                  <Button variant="ghost" size="sm" className="p-1">
                    <ArrowRight className="w-4 h-4 text-[#6B726D]" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
