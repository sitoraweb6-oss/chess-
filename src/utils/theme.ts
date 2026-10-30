/**
 * Theme & Board Styling Utilities
 * "দাবা শিক্ষক" - Daba Shikkhok
 */

import { UserSettings } from '../storage/index.ts';

export interface BoardThemeColors {
  light: string;
  dark: string;
  nameBn: string;
}

export const BOARD_THEMES: Record<UserSettings['boardTheme'], BoardThemeColors> = {
  classic: {
    light: '#EEEED2',
    dark: '#769656',
    nameBn: 'ক্লাসিক সবুজ',
  },
  wood: {
    light: '#F0D9B5',
    dark: '#B58863',
    nameBn: 'উডেন ও বাদামি',
  },
  blue: {
    light: '#DEE3E6',
    dark: '#8CA2AD',
    nameBn: 'সাগর নীল',
  },
  slate: {
    light: '#E2E8F0',
    dark: '#64748B',
    nameBn: 'স্লেট গ্রে',
  },
  purple: {
    light: '#F3E8FF',
    dark: '#7E22CE',
    nameBn: 'রয়্যাল পার্পল',
  },
  coral: {
    light: '#FFEDD5',
    dark: '#C2410C',
    nameBn: 'উষ্ণ কোরাল',
  },
};

export const ANIMATION_SPEEDS: Record<UserSettings['animationSpeed'], number> = {
  fast: 150,
  normal: 200,
  slow: 300,
};

export function getCustomBoardStyles(theme: UserSettings['boardTheme']) {
  const colors = BOARD_THEMES[theme] || BOARD_THEMES.classic;
  return {
    customLightSquareStyle: { backgroundColor: colors.light },
    customDarkSquareStyle: { backgroundColor: colors.dark },
  };
}

/**
 * Applies the selected app theme to the document element
 */
export function applyAppTheme(appTheme: UserSettings['appTheme']): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark', 'theme-paper', 'dark');
  root.classList.add(`theme-${appTheme}`);
  if (appTheme === 'dark') {
    root.classList.add('dark');
  }
}

export function getBoardTheme(theme?: UserSettings['boardTheme']): BoardThemeColors {
  if (!theme || !BOARD_THEMES[theme]) {
    return BOARD_THEMES.classic;
  }
  return BOARD_THEMES[theme];
}
