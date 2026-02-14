import React, { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import './StartScreen.css';

const StartScreen: React.FC = () => {
  const { timerState, startTimer, connected, timeLeft } = useTimer();
  const [countdown, setCountdown] = useState<number | null>(null);

  const formatTime = (ms: number): string => {
    // Count upwards from 0
    const elapsed = 60000 - ms; // 60 seconds total
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
    // Begin 3-2-1 countdown
    setCountdown(3);
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
    if (countdown === null) return;

    // Play beep when countdown changes
    if (countdown > 0) {
      playBeep(800); // 3, 2, 1
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      playBeep(1200); // GO (higher pitch)
      // Countdown finished, start the actual timer
      startTimer(60000); // Default 1 minute, can be adjusted
      setCountdown(null);
    }
  }, [countdown, startTimer]);

  // If timer is already running, show running state
  if (timerState.running || countdown !== null) {
    return (
      <div className="start-screen running">
        <div className="connection-status">
          <span className={connected ? 'connected' : 'disconnected'}>
            {connected ? '●' : '○'}
          </span>
        </div>
        {countdown !== null ? (
          <div className="countdown-overlay">
            <div className="countdown-number">{countdown}</div>
          </div>
        ) : (
          <div className="running-indicator">
            <div className="pulse-dot"></div>
            <h1>TIMER RUNNING</h1>
            <div className="running-timer">{formatTime(timeLeft)}</div>
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
