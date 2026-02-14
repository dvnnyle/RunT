import React, { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import './DisplayView.css';

const DisplayView: React.FC = () => {
  const {
    timerState,
    timeLeft,
    connected,
    stopTimer
  } = useTimer();

  const [isFinished, setIsFinished] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimeWithMillis = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis}`;
  };

  // Detect when timer finishes
  useEffect(() => {
    if (timeLeft === 0 && timerState.running) {
      setIsFinished(true);
      setShowFlash(true);
      
      // Simple beep using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        console.log('Audio play failed:', e);
      }
      
      // Flash effect
      const flashInterval = setInterval(() => {
        setShowFlash(prev => !prev);
      }, 500);
      
      setTimeout(() => {
        clearInterval(flashInterval);
        setShowFlash(false);
      }, 5000);
      
      return () => clearInterval(flashInterval);
    } else if (timeLeft > 0) {
      setIsFinished(false);
      setShowFlash(false);
    }
  }, [timeLeft, timerState.running]);

  const getDisplayClass = () => {
    if (isFinished) return 'finished';
    if (timeLeft < 10000) return 'warning';
    return '';
  };

  return (
    <div className={`display-view ${getDisplayClass()} ${showFlash ? 'flash' : ''}`}>
      <div className="display-header">
        <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '●' : '○'}
        </div>
        <div className="display-mode">Display Mode</div>
      </div>

      <div className="timer-display-large">
        <div className="countdown">
          {timeLeft < 60000 ? formatTimeWithMillis(timeLeft) : formatTime(timeLeft)}
        </div>
        
        {isFinished && (
          <div className="finished-message">
            <h1>⏰ TIME'S UP! ⏰</h1>
          </div>
        )}
        
        {!timerState.running && !isFinished && timeLeft > 0 && (
          <div className="waiting-message">
            Waiting for start...
          </div>
        )}
      </div>

      <div className="display-footer">
        <div className="status-indicator">
          {timerState.running ? (
            <span className="status running">▶️ Running</span>
          ) : timeLeft === 0 && isFinished ? (
            <span className="status finished">🔔 Finished</span>
          ) : timerState.paused ? (
            <span className="status paused">⏸️ Paused</span>
          ) : (
            <span className="status stopped">⏹️ Ready</span>
          )}
        </div>
        
        {timerState.running && (
          <button 
            className="emergency-stop" 
            onClick={stopTimer}
            disabled={!connected}
          >
            🛑 STOP
          </button>
        )}
      </div>
    </div>
  );
};

export default DisplayView;
