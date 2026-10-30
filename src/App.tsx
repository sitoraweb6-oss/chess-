/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.tsx';
import { HomeScreen } from './features/home/HomeScreen.tsx';
import { PlayScreen } from './features/play/PlayScreen.tsx';
import { ReviewScreen } from './features/review/ReviewScreen.tsx';
import { OpeningsScreen } from './features/openings/OpeningsScreen.tsx';
import { PuzzlesScreen } from './features/puzzles/PuzzlesScreen.tsx';
import { SettingsScreen } from './features/settings/SettingsScreen.tsx';
import { OnboardingModal } from './features/onboarding/OnboardingModal.tsx';
import { hasCompletedOnboarding, getStorageData } from './storage/index.ts';
import { stockfishEngine } from './engine/index.ts';
import { applyAppTheme } from './utils/theme.ts';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    // Apply user theme
    const data = getStorageData();
    applyAppTheme(data.settings.appTheme);

    // Check if user has completed onboarding
    const completed = hasCompletedOnboarding();
    if (!completed) {
      setShowOnboarding(true);
    }

    // Terminate engine worker when root unmounts
    return () => {
      stockfishEngine.terminate();
    };
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-app text-app selection:bg-primary-soft selection:text-primary transition-colors duration-200">

        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/play" element={<PlayScreen />} />
            <Route path="/review" element={<ReviewScreen />} />
            <Route path="/review/:gameId" element={<ReviewScreen />} />
            <Route path="/openings" element={<OpeningsScreen />} />
            <Route path="/puzzles" element={<PuzzlesScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-app py-6 text-center text-xs text-muted">
          <p>© {new Date().getFullYear()} দাবা শিক্ষক (Daba Shikkhok) · আনন্দের সাথে বাংলায় দাবা শিখুন</p>
        </footer>

        {/* First visit onboarding modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      </div>
    </HashRouter>
  );
}
