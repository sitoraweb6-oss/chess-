import { useState, useEffect } from 'react';
import {
  getStorageData,
  updateUserSettings,
  UserSettings,
  SETTINGS_CHANGE_EVENT,
} from '../storage/index.ts';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => getStorageData().settings);

  useEffect(() => {
    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<UserSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getStorageData().settings);
      }
    };

    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChanged);
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChanged);
    };
  }, []);

  return {
    settings,
    updateSettings: updateUserSettings,
  };
}
