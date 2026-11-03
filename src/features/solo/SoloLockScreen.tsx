import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, ShieldCheck, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import { verifySoloPasscode, setSoloFeatureUnlocked } from '../../utils/security.ts';

interface SoloLockScreenProps {
  onUnlockSuccess: () => void;
}

export const SoloLockScreen: React.FC<SoloLockScreenProps> = ({ onUnlockSuccess }) => {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState<string>('');
  const [showPlain, setShowPlain] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcode.trim() || isVerifying) return;

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const isValid = await verifySoloPasscode(passcode);
      if (isValid) {
        setSoloFeatureUnlocked(true);
        onUnlockSuccess();
      } else {
        setErrorMessage(bn.solo.lockWrongPasscode);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setErrorMessage(bn.solo.lockWrongPasscode);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (passcode.length < 8) {
      setPasscode((prev) => prev + num);
      setErrorMessage(null);
    }
  };

  const handleBackspace = () => {
    setPasscode((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPasscode('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className={`w-full max-w-md transition-transform ${shake ? 'animate-bounce' : ''}`}>
        <Card variant="surface" className="p-6 sm:p-8 space-y-6 shadow-lg border border-border">
          {/* Header & Icon */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-soft text-primary flex items-center justify-center shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-fg">
                  {bn.solo.lockTitle}
                </h1>
                <Badge variant="accent" size="sm">
                  {bn.solo.lockProtectedBadge}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
                {bn.solo.lockSubtitle}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="passcode-input" className="block text-xs font-semibold text-fg">
                গোপন পাসকোড (PIN)
              </label>

              <div className="relative flex items-center">
                <div className="absolute left-3 text-muted pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </div>

                <input
                  id="passcode-input"
                  type={showPlain ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder={bn.solo.lockPasscodePlaceholder}
                  autoComplete="off"
                  className="w-full pl-9 pr-10 py-3 rounded-xl bg-surface-2 border border-border text-fg text-center text-lg tracking-widest font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
                />

                <button
                  type="button"
                  onClick={() => setShowPlain(!showPlain)}
                  className="absolute right-3 p-1 text-muted hover:text-fg transition-colors cursor-pointer touch-target"
                  title={showPlain ? 'পাসকোড লুকান' : 'পাসকোড দেখুন'}
                >
                  {showPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error feedback */}
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-danger-soft text-danger text-xs text-center font-medium animate-fadeIn">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Mobile-Friendly Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1 select-none">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="py-2.5 rounded-xl bg-surface-2 hover:bg-surface border border-border text-fg font-semibold text-base active:scale-95 transition-all cursor-pointer touch-target flex items-center justify-center"
                >
                  {toBanglaNumeral(digit)}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 rounded-xl bg-surface-2 hover:bg-surface border border-border text-muted text-xs font-medium active:scale-95 transition-all cursor-pointer touch-target flex items-center justify-center"
              >
                মুছুন
              </button>

              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="py-2.5 rounded-xl bg-surface-2 hover:bg-surface border border-border text-fg font-semibold text-base active:scale-95 transition-all cursor-pointer touch-target flex items-center justify-center"
              >
                ০
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 rounded-xl bg-surface-2 hover:bg-surface border border-border text-muted text-sm font-semibold active:scale-95 transition-all cursor-pointer touch-target flex items-center justify-center"
                title="এক ঘর পিছান"
              >
                ⌫
              </button>
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isVerifying}
              disabled={passcode.length === 0}
              className="w-full justify-center font-bold text-base py-3 mt-2"
              leftIcon={<Unlock className="w-4 h-4" />}
            >
              {isVerifying ? bn.solo.lockVerifying : bn.solo.lockUnlockBtn}
            </Button>
          </form>

          {/* Privacy Guarantee Banner */}
          <div className="p-3 rounded-xl bg-surface-2 border border-border/80 flex items-start gap-2.5 text-xs text-muted leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-fg block mb-0.5">১০০% গোপনীয় ও ট্র্যাকিংমুক্ত:</span>
              <span>{bn.solo.privacyNotice}। আপনার কোনো অ্যাক্টিভিটি কোনো সার্ভারে পাঠানো হয় না।</span>
            </div>
          </div>

          {/* Back to Home Navigation */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors cursor-pointer touch-target"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল পাতায় ফিরে যান</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
