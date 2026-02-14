export {};

declare global {
  interface Window {
    api: {
      platform: string;
      toggleFullscreen: () => Promise<boolean>;
      isFullscreen: () => Promise<boolean>;
      quitApp: () => Promise<void>;
    };
  }
}
