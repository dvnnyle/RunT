import React, { useEffect, useRef, useState } from 'react';
import { useTimer } from '../hooks/useTimer';
import './StartScreen.css';

const StartScreen: React.FC = () => {
  const {
    timerState,
    stopTimer,
    resetTimer,
    startCountdown,
    clearCountdown,
    countdownValue,
    connected,
    timeLeft
  } = useTimer();
  const [finalTime, setFinalTime] = useState<string | null>(null);
  const [showFinished, setShowFinished] = useState(false);
  const wasRunning = useRef(false);

  const formatTime = (ms: number): string => {
    const totalDuration = timerState.duration || 60000;
    const elapsed = Math.max(0, totalDuration - ms);
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor((elapsed % 1000) / 100);
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis}`;
    }
    return `${seconds}.${millis}s`;
  };

  const handleStart = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    if (!timerState.running && countdownValue === null) {
      startCountdown();
    }
  };

  const handleRestart = () => {
    stopTimer();
    resetTimer();
    clearCountdown();
  };

  const playBeep = (frequency: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log('Audio play failed:', e);
    }
  };

  useEffect(() => {
    if (countdownValue === null) return;

    if (countdownValue > 0) {
      playBeep(800);
    } else {
      playBeep(1200);
    }
  }, [countdownValue]);

  useEffect(() => {
    if (timerState.running) {
      wasRunning.current = true;
      return;
    }

    if (!timerState.running && !timerState.paused) {
      wasRunning.current = false;
    }

    if (wasRunning.current && timerState.paused) {
      setFinalTime(formatTime(timeLeft));
      setShowFinished(true);
    }
  }, [timerState.running, timerState.paused, timeLeft]);

  useEffect(() => {
    if (timerState.running && !timerState.paused) {
      setShowFinished(false);
      setFinalTime(null);
    }
  }, [timerState.running, timerState.paused]);

  useEffect(() => {
    if (showFinished) {
      const resetTimerId = setTimeout(() => {
        setShowFinished(false);
        setFinalTime(null);
      }, 15000);

      return () => clearTimeout(resetTimerId);
    }
  }, [showFinished]);

  if (showFinished && finalTime) {
    return (
      <div className="start-screen finished">
        <div className="final-time-display">
          <h1 className="stopped-label">STOPPED AT</h1>
          <div className="final-time">{finalTime}</div>
        </div>
      </div>
    );
  }

  // If timer is already running, show running state
  if (timerState.running || countdownValue !== null) {
    return (
      <div className="start-screen running">
        <div className="connection-status">
          <span className={connected ? 'connected' : 'disconnected'}>
            {connected ? '●' : '○'}
          </span>
        </div>
        {countdownValue !== null ? (
          <div className="countdown-overlay">
            <div className="countdown-number">{countdownValue}</div>
          </div>
        ) : (
          <div className="running-indicator">
            <div className="pulse-dot"></div>
            <h1>TIMER RUNNING</h1>
            <div className="running-timer">{formatTime(timeLeft)}</div>
            <button
              className="restart-button"
              onClick={handleRestart}
              disabled={!connected}
            >
              RESTART
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="start-screen">
      <div className="connection-status">
        <span className={connected ? 'connected' : 'disconnected'}>
          {connected ? '●' : '○'}
        </span>
      </div>
      
      <button 
        className="start-button"
        onClick={handleStart}
        disabled={!connected}
      >
        START
      </button>

      {!connected && (
        <div className="connection-message">
          Waiting for server...
        </div>
      )}

      {/* Credit Footer */}
      <div className="screen-credit">
        <span className="credit-text">by </span>
        <span className="credit-link">dvnny.no</span>
      </div>
    </div>
  );
};

export default StartScreen;
