import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { TimerState, ViewMode } from '../types';
import { getDeviceName, getDeviceSettings, getServerUrl } from '../utils/settings';

interface DeviceInfo {
  id: string;
  name: string;
  role: ViewMode | null;
}

interface TimerContextValue {
  timerState: TimerState;
  timeLeft: number;
  connected: boolean;
  clientsCount: number;
  countdownValue: number | null;
  devices: DeviceInfo[];
  startTimer: (duration?: number) => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setDuration: (duration: number) => void;
  startCountdown: () => void;
  clearCountdown: () => void;
  registerDevice: (name: string, role: ViewMode | null) => void;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>({
    running: false,
    endTime: null,
    duration: 600000,
    paused: false,
    remainingTime: 600000
  });

  const [timeLeft, setTimeLeft] = useState<number>(600000);
  const [connected, setConnected] = useState<boolean>(false);
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const serverUrl = getServerUrl();
    console.log('🌐 Connecting to server:', serverUrl);

    const socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to timer server');
      setConnected(true);

      const settings = getDeviceSettings();
      const deviceName = getDeviceName();
      socket.emit('register-device', {
        name: deviceName,
        role: settings.assignedRole
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from timer server');
      setConnected(false);
    });

    socket.on('timer-state', (state: TimerState) => {
      setTimerState(state);
    });

    socket.on('clients-count', (count: number) => {
      setClientsCount(count);
    });

    socket.on('countdown', (value: number | null) => {
      setCountdownValue(value);
    });

    socket.on('devices-update', (list: DeviceInfo[]) => {
      setDevices(list);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!timerState.running || timerState.endTime === null) {
      setTimeLeft(timerState.remainingTime);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, timerState.endTime! - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0 && timerState.running) {
        console.log('Timer finished!');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timerState.running, timerState.endTime, timerState.remainingTime]);

  const startTimer = (duration?: number) => {
    if (socketRef.current) {
      socketRef.current.emit('start-timer', duration);
    }
  };

  const stopTimer = () => {
    if (socketRef.current) {
      socketRef.current.emit('stop-timer');
    }
  };

  const resetTimer = () => {
    if (socketRef.current) {
      socketRef.current.emit('reset-timer');
    }
  };

  const setDuration = (duration: number) => {
    if (socketRef.current) {
      socketRef.current.emit('set-duration', duration);
    }
  };

  const startCountdown = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-countdown');
    }
  };

  const clearCountdown = () => {
    if (socketRef.current) {
      socketRef.current.emit('clear-countdown');
    }
  };

  const registerDevice = (name: string, role: ViewMode | null) => {
    if (socketRef.current) {
      socketRef.current.emit('register-device', { name, role });
    }
  };

  const value: TimerContextValue = {
    timerState,
    timeLeft,
    connected,
    clientsCount,
    countdownValue,
    devices,
    startTimer,
    stopTimer,
    resetTimer,
    setDuration,
    startCountdown,
    clearCountdown,
    registerDevice
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimerContext = (): TimerContextValue => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};
