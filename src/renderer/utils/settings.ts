import { ViewMode } from '../types';

const SETTINGS_KEY = 'timer-device-settings';
const SERVER_URL_KEY = 'timer-server-url';
const HOST_SERVER_KEY = 'timer-host-server';
const DEVICE_NAME_KEY = 'timer-device-name';

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

export const getHostServer = (): boolean => {
  try {
    const stored = localStorage.getItem(HOST_SERVER_KEY);
    return stored === 'true';
  } catch (e) {
    console.error('Failed to load host server setting:', e);
    return false;
  }
};

export const saveHostServer = (enabled: boolean): void => {
  try {
    localStorage.setItem(HOST_SERVER_KEY, String(enabled));
  } catch (e) {
    console.error('Failed to save host server setting:', e);
  }
};

export const getDeviceName = (): string => {
  try {
    const stored = localStorage.getItem(DEVICE_NAME_KEY);
    if (stored && stored.trim()) {
      return stored;
    }

    const defaultName = `RunT Device ${Math.floor(100 + Math.random() * 900)}`;
    localStorage.setItem(DEVICE_NAME_KEY, defaultName);
    return defaultName;
  } catch (e) {
    console.error('Failed to load device name:', e);
    return 'RunT Device';
  }
};

export const saveDeviceName = (name: string): void => {
  try {
    localStorage.setItem(DEVICE_NAME_KEY, name.trim());
  } catch (e) {
    console.error('Failed to save device name:', e);
  }
};
