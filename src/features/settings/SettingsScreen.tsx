import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, Palette, Trash2, Check, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Toast } from '../../components/ui/Toast.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import {
  getStorageData,
  updateUserSettings,
  resetAllStorage,
  UserSettings,
} from '../../storage/index.ts';

export const SettingsScreen: React.FC = () => {
  const [data, setData] = useState(getStorageData());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleSound = () => {
    const updated = updateUserSettings({ sound: !data.settings.sound });
    setData(updated);
    setToastMessage(bn.settings.savedSuccess);
  };

  const handleToggleLegalMoves = () => {
    const updated = updateUserSettings({ showLegalMoves: !data.settings.showLegalMoves });
    setData(updated);
    setToastMessage(bn.settings.savedSuccess);
  };

  const handleChangeTheme = (boardTheme: UserSettings['boardTheme']) => {
    const updated = updateUserSettings({ boardTheme });
    setData(updated);
    setToastMessage(bn.settings.savedSuccess);
  };

  const handleResetData = () => {
    const fresh = resetAllStorage();
    setData(fresh);
    setShowResetConfirm(false);
    setToastMessage('সকল তথ্য সফলভাবে মুছে প্রাথমিক অবস্থায় ফিরিয়ে আনা হয়েছে।');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="pb-2 border-b border-[#1E2420]/10">
        <h1 className="text-2xl font-bold text-[#1E2420]">{bn.settings.title}</h1>
        <p className="text-xs sm:text-sm text-[#6B726D] mt-1">
          শব্দ, ডিসপ্লে ও তথ্য ব্যবস্থাপনা নিয়ন্ত্রণ করুন।
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card variant="surface-2" className="p-4 sm:p-5 flex items-center justify-between">
        <div>
          <span className="text-xs text-[#6B726D] block">আপনার বর্তমান প্রোফাইল</span>
          <span className="text-base font-bold text-[#1E2420] capitalize">
            {data.profile.level === 'beginner'
              ? 'নতুন (Beginner)'
              : data.profile.level === 'intermediate'
              ? 'কিছুটা খেলি (Casual)'
              : 'নিয়মিত খেলি (Club)'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#6B726D] block">{bn.home.currentRating}</span>
          <span className="text-xl font-bold font-mono text-[#1F6F50]">
            {toBanglaNumeral(data.rating)}
          </span>
        </div>
      </Card>

      {/* Preferences List */}
      <Card className="p-4 sm:p-5 space-y-5">
        {/* Sound FX Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#E6F2EC] text-[#1F6F50] rounded-xl shrink-0 mt-0.5">
              {data.settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-semibold text-sm text-[#1E2420] block">
                {bn.settings.sound}
              </span>
              <span className="text-xs text-[#6B726D]">
                {bn.settings.soundDesc}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleSound}
            aria-checked={data.settings.sound}
            role="switch"
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer touch-target ${
              data.settings.sound ? 'bg-[#1F6F50] justify-end' : 'bg-[#1E2420]/20 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
          </button>
        </div>

        <div className="h-px bg-[#1E2420]/10" />

        {/* Legal Moves Dots Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#E6F2EC] text-[#1F6F50] rounded-xl shrink-0 mt-0.5">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-sm text-[#1E2420] block">
                {bn.settings.showLegalMoves}
              </span>
              <span className="text-xs text-[#6B726D]">
                {bn.settings.showLegalMovesDesc}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleLegalMoves}
            aria-checked={data.settings.showLegalMoves}
            role="switch"
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer touch-target ${
              data.settings.showLegalMoves ? 'bg-[#1F6F50] justify-end' : 'bg-[#1E2420]/20 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
          </button>
        </div>

        <div className="h-px bg-[#1E2420]/10" />

        {/* Board Theme Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#1F6F50]" />
            <span className="font-semibold text-sm text-[#1E2420]">
              {bn.settings.boardTheme}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {[
              { id: 'classic', label: bn.settings.themes.classic, light: '#EEEED2', dark: '#769656' },
              { id: 'wood', label: bn.settings.themes.wood, light: '#F0D9B5', dark: '#B58863' },
              { id: 'green', label: bn.settings.themes.green, light: '#DEE3E6', dark: '#8CA1A5' },
            ].map((th) => {
              const isSelected = data.settings.boardTheme === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => handleChangeTheme(th.id as UserSettings['boardTheme'])}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer touch-target ${
                    isSelected
                      ? 'border-[#1F6F50] bg-[#E6F2EC] shadow-xs'
                      : 'border-[#1E2420]/15 bg-[#FFFDF8] hover:bg-[#F4EFE4]'
                  }`}
                >
                  <div className="flex h-5 rounded overflow-hidden border border-[#1E2420]/20 mb-2">
                    <div className="w-1/2 h-full" style={{ backgroundColor: th.light }} />
                    <div className="w-1/2 h-full" style={{ backgroundColor: th.dark }} />
                  </div>
                  <span className="font-semibold text-[#1E2420] block">{th.label}</span>
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
            <h3 className="text-sm font-bold text-[#C62828] flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              <span>{bn.settings.dangerZone}</span>
            </h3>
            <p className="text-xs text-[#6B726D] mt-0.5">
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
          <p className="text-sm text-[#6B726D]">{bn.settings.resetConfirm}</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-[#1E2420] hover:bg-[#F4EFE4] rounded-lg cursor-pointer touch-target"
            >
              {bn.ui.cancel}
            </button>
            <button
              onClick={handleResetData}
              className="px-4 py-2 text-sm font-semibold text-[#FFFDF8] bg-[#E53935] hover:bg-[#C62828] rounded-xl cursor-pointer touch-target"
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
