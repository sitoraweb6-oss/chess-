import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Play, Settings as SettingsIcon } from 'lucide-react';
import { bn } from '../i18n/bn.ts';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks: { path: string; label: string; badge?: string }[] = [
    { path: '/', label: bn.nav.home },
    { path: '/play', label: bn.nav.play },
    { path: '/openings', label: bn.nav.openings },
    { path: '/puzzles', label: 'ভুলের পাজল' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-app">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold tracking-tight text-primary-themed flex items-center gap-2 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <span className="text-2xl" aria-hidden="true">♟️</span>
          <span>{bn.appName}</span>
        </Link>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-primary-themed font-semibold border-b-2 border-primary'
                    : 'text-muted hover:text-primary-themed'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] bg-[#E0A43A]/15 text-[#B87D1B] font-medium px-1.5 py-0.2 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            to="/settings"
            aria-label={bn.nav.settings}
            className="p-2 text-muted hover:text-primary-themed hover:bg-surface-2 rounded-lg transition-colors touch-target flex items-center justify-center"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>
          <Link
            to="/play"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors shadow-sm whitespace-nowrap shrink-0 touch-target"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{bn.home.startPlayCTA}</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/settings"
            aria-label={bn.nav.settings}
            className="p-2 text-muted hover:text-primary-themed rounded-lg touch-target flex items-center justify-center"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="মেনু খুলুন"
            className="p-2 text-app hover:bg-surface-2 rounded-lg touch-target flex items-center justify-center cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-app bg-surface px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-base ${
                  isActive
                    ? 'bg-primary-soft text-primary-themed font-semibold'
                    : 'text-app hover:bg-surface-2'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] bg-[#E0A43A]/15 text-[#B87D1B] font-medium px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              to="/play"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 p-3 text-base font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm touch-target"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{bn.home.startPlayCTA}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
