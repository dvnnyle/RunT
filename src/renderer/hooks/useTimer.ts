import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { TimerState } from '../types';
import { getServerUrl } from '../utils/settings';

export const useTimer = () => {
  const [timerState, setTimerState] = useState<TimerState>({
    running: false,
    endTime: null,
    duration: 60000,
    paused: false,
    remainingTime: 60000
  });
  
  const [timeLeft, setTimeLeft] = useState<number>(60000);
  const [connected, setConnected] = useState<boolean>(false);
  const [clientsCount, setClientsCount] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to server using saved URL
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

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update time left every 100ms when timer is running
  useEffect(() => {
    if (!timerState.running || timerState.endTime === null) {
      setTimeLeft(timerState.remainingTime);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, timerState.endTime! - Date.now());
      setTimeLeft(remaining);
      
      // Auto-stop when time runs out
      if (remaining === 0 && timerState.running) {
        // Timer finished
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

  return {
    timerState,
    timeLeft,
    connected,
    clientsCount,
    startTimer,
    stopTimer,
    resetTimer,
    setDuration
  };
};
