import React, { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import './ControllerView.css';

const ControllerView: React.FC = () => {
  const {
    timerState,
    timeLeft,
    connected,
    clientsCount,
    startTimer,
    stopTimer,
    resetTimer,
    setDuration
  } = useTimer();

  const [customMinutes, setCustomMinutes] = useState<number>(1);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const presetDurations = [
    { label: '30 sec', value: 30000 },
    { label: '1 min', value: 60000 },
    { label: '2 min', value: 120000 },
    { label: '5 min', value: 300000 },
    { label: '10 min', value: 600000 },
    { label: '15 min', value: 900000 }
  ];

  const handlePreset = (duration: number) => {
    setDuration(duration);
    if (!timerState.running) {
      resetTimer();
    }
  };

  const handleCustomDuration = () => {
    const duration = customMinutes * 60000;
    setDuration(duration);
    if (!timerState.running) {
      resetTimer();
    }
  };

  return (
    <div className="controller-view">
      <div className="controller-header">
        <h1>⏱️ Timer Controller</h1>
        <div className="status-bar">
          <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <span className="clients-count">
            👥 {clientsCount} {clientsCount === 1 ? 'client' : 'clients'}
          </span>
        </div>
      </div>

      <div className="timer-display-mini">
        <div className="time-left">{formatTime(timeLeft)}</div>
        <div className="time-status">
          {timerState.running ? '▶️ Running' : timerState.paused ? '⏸️ Paused' : '⏹️ Stopped'}
        </div>
      </div>

      <div className="control-panel">
        <h2>Controls</h2>
        <div className="main-controls">
          {!timerState.running ? (
            <button 
              className="btn btn-start" 
              onClick={() => startTimer()}
              disabled={!connected}
            >
              ▶️ Start
            </button>
          ) : (
            <button 
              className="btn btn-stop" 
              onClick={stopTimer}
              disabled={!connected}
            >
              ⏸️ Stop
            </button>
          )}
          <button 
            className="btn btn-reset" 
            onClick={resetTimer}
            disabled={!connected}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="presets-panel">
        <h2>Quick Presets</h2>
        <div className="preset-grid">
          {presetDurations.map((preset) => (
            <button
              key={preset.value}
              className={`btn preset-btn ${timerState.duration === preset.value ? 'active' : ''}`}
              onClick={() => handlePreset(preset.value)}
              disabled={!connected || timerState.running}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-duration">
        <h2>Custom Duration</h2>
        <div className="custom-input-group">
          <input
            type="number"
            min="1"
            max="60"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
            disabled={!connected || timerState.running}
          />
          <span>minutes</span>
          <button
            className="btn btn-set"
            onClick={handleCustomDuration}
            disabled={!connected || timerState.running}
          >
            Set
          </button>
        </div>
      </div>

      <div className="info-panel">
        <p><strong>Duration:</strong> {formatTime(timerState.duration)}</p>
        <p><strong>Mode:</strong> Controller (Tablet A)</p>
      </div>
    </div>
  );
};

export default ControllerView;
