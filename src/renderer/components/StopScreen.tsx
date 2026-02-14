import React, { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import './StopScreen.css';

const StopScreen: React.FC = () => {
  const { timerState, timeLeft, stopTimer, connected } = useTimer();
  const [finalTime, setFinalTime] = useState<string | null>(null);
  const [showFinished, setShowFinished] = useState(false);

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

  // Auto-reset after 15 seconds on finished screen
  useEffect(() => {
    if (showFinished) {
      const resetTimer = setTimeout(() => {
        setShowFinished(false);
        setFinalTime(null);
      }, 15000);

      return () => clearTimeout(resetTimer);
    }
  }, [showFinished]);

  // Show finished state with final time
  if (showFinished && finalTime) {
    return (
      <div className="stop-screen finished">
        <div className="final-time-display">
          <h1 className="stopped-label">STOPPED AT</h1>
          <div className="final-time">{finalTime}</div>
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
          <h1>WAITING FOR START</h1>
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
