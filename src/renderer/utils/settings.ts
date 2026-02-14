import { ViewMode } from '../types';

const SETTINGS_KEY = 'timer-device-settings';
const SERVER_URL_KEY = 'timer-server-url';

interface DeviceSettings {
  assignedRole: ViewMode | null;
  isLocked: boolean;
}

export const getDeviceSettings = (): DeviceSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  
  return {
    assignedRole: null,
    isLocked: false
  };
};

export const saveDeviceSettings = (settings: DeviceSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const clearDeviceSettings = (): void => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (e) {
    console.error('Failed to clear settings:', e);
  }
};

export const getServerUrl = (): string => {
  try {
    const stored = localStorage.getItem(SERVER_URL_KEY);
    return stored || 'http://localhost:3001';
  } catch (e) {
    console.error('Failed to load server URL:', e);
    return 'http://localhost:3001';
  }
};

export const saveServerUrl = (url: string): void => {
  try {
    localStorage.setItem(SERVER_URL_KEY, url);
  } catch (e) {
    console.error('Failed to save server URL:', e);
  }
};
