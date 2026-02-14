export interface TimerState {
  running: boolean;
  endTime: number | null;
  duration: number;
  paused: boolean;
  remainingTime: number;
}

export type ViewMode = 'controller' | 'display';
