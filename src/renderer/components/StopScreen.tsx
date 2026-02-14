import React, { useState, useEffect, useRef } from 'react';
import { useTimer } from '../hooks/useTimer';
import './StopScreen.css';

const StopScreen: React.FC = () => {
  const { timerState, timeLeft, stopTimer, resetTimer, countdownValue, connected } = useTimer();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showCountdownOverlay, setShowCountdownOverlay] = useState(false);
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

  const handleStop = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    const time = formatTime(timeLeft);
    setFinalTime(time);
    stopTimer();
    setShowFinished(true);
    
    // Play beep sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Audio play failed:', e);
    }
  };

  const handleRestart = () => {
    resetTimer();
    setShowFinished(false);
    setFinalTime(null);
    setShowCountdownOverlay(false);
    setCountdown(null);
    wasRunning.current = false;
  };

  // Auto-stop when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && timerState.running) {
      handleStop();
    }
  }, [timeLeft, timerState.running]);

  // Reset finished state when timer restarts
  useEffect(() => {
    if (timerState.running && !timerState.paused) {
      setShowFinished(false);
      setFinalTime(null);
    }
  }, [timerState.running, timerState.paused]);

  useEffect(() => {
    if (timerState.running) {
      wasRunning.current = true;
      return;
    }

    if (!timerState.running && !timerState.paused) {
      wasRunning.current = false;
    }

    if (wasRunning.current && timerState.paused && !showFinished) {
      setFinalTime(formatTime(timeLeft));
      setShowFinished(true);
    }
  }, [timerState.running, timerState.paused, timeLeft, showFinished]);

  // Auto-reset after 15 seconds on finished screen
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;
    if (showFinished) {
      setCountdown(10);
      setShowCountdownOverlay(true);
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            return 0;
          }
        });
      }, 1000);
      timeout = setTimeout(() => {
        resetTimer();
        setShowFinished(false);
        setFinalTime(null);
        setShowCountdownOverlay(false);
      }, 10000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setShowCountdownOverlay(false);
      setCountdown(null);
    }
  }, [showFinished]);

  useEffect(() => {
    const duration = timerState.duration || 600000;
    if (showFinished && !timerState.running && !timerState.paused && timeLeft === duration) {
      setShowFinished(false);
      setFinalTime(null);
      setShowCountdownOverlay(false);
      setCountdown(null);
    }
  }, [showFinished, timerState.running, timerState.paused, timeLeft, timerState.duration]);

  // Show finished state with final time
  if (showFinished && finalTime) {
    return (
      <div className="stop-screen finished">
        <div className="final-time-display">
          <h1 className="stopped-label">Din Tid</h1>
          <div className="final-time">{finalTime}</div>
          <button
            className="stop-restart-button"
            onClick={handleRestart}
            disabled={!connected}
          >
            RESTART
          </button>
          {showCountdownOverlay && countdown !== null && (
            <div className="finished-countdown">går tilbake om {countdown}</div>
          )}
        </div>
      </div>
    );
  }

  if (countdownValue !== null) {
    return (
      <div className="stop-screen active">
        <div className="connection-status">
          <span className={connected ? 'connected' : 'disconnected'}>
            {connected ? '●' : '○'}
          </span>
        </div>
        <div className="countdown-overlay">
          <div className="countdown-number">{countdownValue}</div>
        </div>
      </div>
    );
  }

  // Show waiting state if timer hasn't started
  if (!timerState.running) {
    return (
      <div className="stop-screen waiting">
        <div className="connection-status">
          <span className={connected ? 'connected' : 'disconnected'}>
            {connected ? '●' : '○'}
          </span>
        </div>
        <div className="waiting-message">
          <div className="pulse-ring"></div>
          <h1>Klar til start</h1>
          <div className="waiting-subtext">
            Trykk <span className="start-word">START</span> på andre siden
          </div>
        </div>
      </div>
    );
  }

  // Show STOP button while timer is running
  return (
    <div className="stop-screen active">
      <div className="connection-status">
        <span className={connected ? 'connected' : 'disconnected'}>
          {connected ? '●' : '○'}
        </span>
      </div>

      <div className="timer-display">
        <div className="current-time">{formatTime(timeLeft)}</div>
      </div>
      
      <button 
        className="stop-button"
        onClick={handleStop}
        disabled={!connected}
      >
        STOP
      </button>

      {/* Credit Footer */}
      <div className="screen-credit">
        <span className="credit-text">by </span>
        <span className="credit-link">dvnny.no</span>
      </div>
    </div>
  );
};

export default StopScreen;
