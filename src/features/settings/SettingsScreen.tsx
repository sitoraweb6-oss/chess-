import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Eye,
  Palette,
  Trash2,
  Check,
  Sun,
  Moon,
  FileText,
  Clock,
  Hash,
  Sparkles,
} from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Toast } from '../../components/ui/Toast.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import {
  getStorageData,
  updateUserSettings,
  resetAllStorage,
  UserSettings,
} from '../../storage/index.ts';
import {
  BOARD_THEMES,
  ANIMATION_SPEEDS,
  applyAppTheme,
  getBoardTheme,
} from '../../utils/theme.ts';
import { playMoveSound } from '../../utils/sound.ts';

export const SettingsScreen: React.FC = () => {
  const [data, setData] = useState(getStorageData());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleSound = () => {
    const nextVal = !data.settings.sound;
    const updated = updateUserSettings({ sound: nextVal });
    setData(updated);
    if (nextVal) playMoveSound(true);
    setToastMessage(bn.settings.savedSuccess);
  };

  const handleToggleLegalMoves = () => {
    const updated = updateUserSettings({ showLegalMoves: !data.settings.showLegalMoves });
    setData(updated);
    setToastMessage(bn.settings.savedSuccess);
  };

  const handleToggleCoordinates = () => {
    const updated = updateUserSettings({ showCoordinates: !data.settings.showCoordinates });
    setData(updated);
    setToastMessage(bn.settings.savedSuccess);
  };

  const handleChangeAppTheme = (appTheme: UserSettings['appTheme']) => {
    const updated = updateUserSettings({ appTheme });
    setData(updated);
    applyAppTheme(appTheme);
    setToastMessage(bn.settings.savedSuccess);
  };

  const handleChangeBoardTheme = (boardTheme: UserSettings['boardTheme']) => {
    const updated = updateUserSettings({ boardTheme });
    setData(updated);
    if (data.settings.sound) {
      playMoveSound(false);
    }
    setToastMessage(bn.settings.savedSuccess);
  };

  const handleChangeAnimationSpeed = (animationSpeed: UserSettings['animationSpeed']) => {
    const updated = updateUserSettings({ animationSpeed });
    setData(updated);
    setToastMessage(bn.settings.savedSuccess);
  };

  const handleResetData = () => {
    const fresh = resetAllStorage();
    setData(fresh);
    applyAppTheme('light');
    setShowResetConfirm(false);
    setToastMessage('সকল তথ্য সফলভাবে মুছে প্রাথমিক অবস্থায় ফিরিয়ে আনা হয়েছে।');
  };

  const currentBoardColors = getBoardTheme(data.settings.boardTheme);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="pb-3 border-b border-app">
        <h1 className="text-2xl font-bold text-app">{bn.settings.title}</h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          থিম, রঙ, শব্দ এবং বোর্ডের প্রদর্শন কাস্টমাইজ করুন।
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card variant="surface-2" className="p-4 sm:p-5 flex items-center justify-between">
        <div>
          <span className="text-xs text-muted block">আপনার বর্তমান প্রোফাইল</span>
          <span className="text-base font-bold text-app capitalize">
            {data.profile.level === 'beginner'
              ? 'নতুন (Beginner)'
              : data.profile.level === 'intermediate'
              ? 'কিছুটা খেলি (Casual)'
              : 'নিয়মিত খেলি (Club)'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted block">{bn.home.currentRating}</span>
          <span className="text-xl font-bold font-mono text-primary-themed">
            {toBanglaNumeral(data.rating)}
          </span>
        </div>
      </Card>

      {/* Live Preview Board */}
      <Card variant="surface" className="p-4 sm:p-5 space-y-3 shadow-card">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-app flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary-themed" />
            <span>{bn.settings.livePreviewTitle}</span>
          </span>
          <Badge variant="neutral" size="sm">
            {currentBoardColors.nameBn}
          </Badge>
        </div>

        <div
          className="w-full max-w-[280px] mx-auto aspect-square rounded-xl overflow-hidden shadow-card border border-app select-none transition-colors"
          style={{ backgroundColor: currentBoardColors.light }}
        >
          <Chessboard
            key={`preview-${data.settings.boardTheme}-${data.settings.showCoordinates}-${data.settings.animationSpeed}`}
            options={{
              position: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
              boardOrientation: 'white',
              darkSquareStyle: { backgroundColor: currentBoardColors.dark },
              lightSquareStyle: { backgroundColor: currentBoardColors.light },
              darkSquareNotationStyle: { color: currentBoardColors.light },
              lightSquareNotationStyle: { color: currentBoardColors.dark },
              showNotation: data.settings.showCoordinates,
              allowDragging: false,
              animationDurationInMs: ANIMATION_SPEEDS[data.settings.animationSpeed] || 200,
            }}
          />
        </div>
      </Card>

      {/* App Theme Selection (Light, Dark, Paper) */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary-themed" />
            <span className="font-semibold text-sm text-app">
              {bn.settings.appTheme}
            </span>
          </div>
          <span className="text-xs text-muted">৩টি থিম মোড</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'light' as const,
              label: bn.settings.appThemes.light,
              desc: 'স্বাভাবিক ক্লাসিক ক্রিম থিম',
              icon: Sun,
              cardBg: '#FFFFFF',
              borderPreview: '#E2E8F0',
              accentColor: '#1F6F50',
            },
            {
              id: 'dark' as const,
              label: bn.settings.appThemes.dark,
              desc: 'চোখের জন্য শান্ত ডার্ক মোড',
              icon: Moon,
              cardBg: '#18221D',
              borderPreview: '#2EA87B',
              accentColor: '#2EA87B',
            },
            {
              id: 'paper' as const,
              label: bn.settings.appThemes.paper,
              desc: 'ভিন্টেজ বই ও সেপিয়া পার্চমেন্ট',
              icon: FileText,
              cardBg: '#FAF6F0',
              borderPreview: '#E0D5C3',
              accentColor: '#2A664A',
            },
          ].map((th) => {
            const isSelected = data.settings.appTheme === th.id;
            const IconComponent = th.icon;
            return (
              <button
                key={th.id}
                onClick={() => handleChangeAppTheme(th.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer touch-target flex flex-col gap-2.5 relative ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 bg-primary-soft shadow-xs'
                    : 'border-app hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-xs"
                    style={{ backgroundColor: th.cardBg, borderColor: th.borderPreview }}
                  >
                    <IconComponent className="w-4 h-4" style={{ color: th.accentColor }} />
                  </div>
                  {isSelected && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-sm text-app block">{th.label}</span>
                  <span className="text-[11px] text-muted block mt-0.5">{th.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Board Theme Selection (6 styles) */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary-themed" />
            <span className="font-semibold text-sm text-app">
              {bn.settings.boardTheme}
            </span>
          </div>
          <Badge variant="primary" size="sm">
            ৬টি শৈলী
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.keys(BOARD_THEMES) as UserSettings['boardTheme'][]).map((themeKey) => {
            const th = BOARD_THEMES[themeKey];
            const isSelected = data.settings.boardTheme === themeKey;
            return (
              <button
                key={themeKey}
                onClick={() => handleChangeBoardTheme(themeKey)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer touch-target flex flex-col gap-2 relative ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 bg-primary-soft shadow-xs'
                    : 'border-app hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  {/* 2x2 Chessboard square swatch */}
                  <div className="grid grid-cols-2 w-9 h-9 rounded-md overflow-hidden border border-black/15 shadow-xs shrink-0">
                    <div style={{ backgroundColor: th.light }} />
                    <div style={{ backgroundColor: th.dark }} />
                    <div style={{ backgroundColor: th.dark }} />
                    <div style={{ backgroundColor: th.light }} />
                  </div>
                  {isSelected && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <span className="font-semibold text-xs text-app block truncate">{th.nameBn}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Preferences List: Audio, Coordinates, Legal moves, Speed */}
      <Card className="p-4 sm:p-5 space-y-5">
        {/* Sound FX Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-soft text-primary-themed rounded-xl shrink-0 mt-0.5">
              {data.settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-semibold text-sm text-app block">
                {bn.settings.sound}
              </span>
              <span className="text-xs text-muted">
                {bn.settings.soundDesc}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleSound}
            aria-checked={data.settings.sound}
            role="switch"
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer touch-target ${
              data.settings.sound ? 'bg-primary justify-end' : 'bg-surface-3 border border-app justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
          </button>
        </div>

        <div className="h-px bg-app-border-subtle" />

        {/* Show Coordinates Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-soft text-primary-themed rounded-xl shrink-0 mt-0.5">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-sm text-app block">
                {bn.settings.showCoordinates}
              </span>
              <span className="text-xs text-muted">
                {bn.settings.showCoordinatesDesc}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleCoordinates}
            aria-checked={data.settings.showCoordinates}
            role="switch"
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer touch-target ${
              data.settings.showCoordinates ? 'bg-primary justify-end' : 'bg-surface-3 border border-app justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
          </button>
        </div>

        <div className="h-px bg-app-border-subtle" />

        {/* Legal Moves Dots Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-soft text-primary-themed rounded-xl shrink-0 mt-0.5">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-sm text-app block">
                {bn.settings.showLegalMoves}
              </span>
              <span className="text-xs text-muted">
                {bn.settings.showLegalMovesDesc}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleLegalMoves}
            aria-checked={data.settings.showLegalMoves}
            role="switch"
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer touch-target ${
              data.settings.showLegalMoves ? 'bg-primary justify-end' : 'bg-surface-3 border border-app justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
          </button>
        </div>

        <div className="h-px bg-app-border-subtle" />

        {/* Animation Speed Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-themed" />
            <span className="font-semibold text-sm text-app">
              {bn.settings.animationSpeed}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { id: 'fast', label: bn.settings.animationSpeeds.fast },
              { id: 'normal', label: bn.settings.animationSpeeds.normal },
              { id: 'slow', label: bn.settings.animationSpeeds.slow },
            ].map((sp) => {
              const isSelected = data.settings.animationSpeed === sp.id;
              return (
                <button
                  key={sp.id}
                  onClick={() => handleChangeAnimationSpeed(sp.id as UserSettings['animationSpeed'])}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary-soft text-primary-themed font-bold shadow-xs'
                      : 'border-app text-muted hover:bg-surface-2'
                  }`}
                >
                  {sp.label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Danger Zone: Reset All Storage */}
      <Card variant="surface" className="p-4 sm:p-5 border-[#E53935]/20 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#E53935] flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              <span>{bn.settings.dangerZone}</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              সকল খেলা, রেটিং ইতিহাস ও সেটিংস প্রাথমিক অবস্থায় নিয়ে যাবে।
            </p>
          </div>
          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="danger"
            size="sm"
          >
            {bn.settings.resetBtn}
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="রেকর্ড রিসেট নিশ্চিতকরণ"
        maxWidth="sm"
      >
        <div className="py-2 space-y-4">
          <p className="text-sm text-muted">{bn.settings.resetConfirm}</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-app hover:bg-surface-2 rounded-lg cursor-pointer touch-target"
            >
              {bn.ui.cancel}
            </button>
            <button
              onClick={handleResetData}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#E53935] hover:bg-[#C62828] rounded-xl cursor-pointer touch-target"
            >
              {bn.settings.resetBtn}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast alert */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
