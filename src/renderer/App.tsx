import React, { useState, useEffect, useRef } from 'react';
import { IoSettingsSharp } from 'react-icons/io5';
import StartScreen from './components/StartScreen';
import StopScreen from './components/StopScreen';
import AdminSettings from './components/AdminSettings';
import PinEntry from './components/PinEntry';
import { ViewMode } from './types';
import { getDeviceSettings } from './utils/settings';
import { useTimer } from './hooks/useTimer';
import './App.css';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const { timerState } = useTimer();

  // Load saved role on mount
  useEffect(() => {
    const settings = getDeviceSettings();
    if (settings.assignedRole && settings.isLocked) {
      console.log('🔒 Booting into assigned role:', settings.assignedRole);
      setViewMode(settings.assignedRole);
    }
    setIsInitialized(true);
  }, []);

  // Keyboard shortcut: Ctrl+Shift+A to open admin
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowPinEntry(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Long press handler for top-left corner
  const handleLongPressStart = () => {
    setLongPressProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 100;
      setLongPressProgress(progress);
    }, 100);

    longPressTimer.current = setTimeout(() => {
      clearInterval(interval);
      setLongPressProgress(0);
      setShowPinEntry(true);
    }, 3000);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressProgress(0);
  };

  const handleRoleSet = (role: ViewMode) => {
    setViewMode(role);
  };

  // Show loading screen while checking settings
  if (!isInitialized) {
    return (
      <div className="app loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // If no role is set, show the setup screen (first-time only)
  if (viewMode === null) {
    return (
      <div className="app mode-selector">
        <div className="content">
          <div className="hero">
            <div className="logo-container">
              <div className="timer-icon">
                <div className="clock-circle">
                  <div className="clock-hand hour"></div>
                  <div className="clock-hand minute"></div>
                </div>
              </div>
              <h1 className="title">
                <span className="gradient-text">Timer System</span>
              </h1>
            </div>
            <div className="status-badge warning">
              <span className="badge-icon">!</span>
              <span>Device Not Configured</span>
            </div>
            <p className="setup-message">
              Configure this device role to get started
            </p>
            
            <button 
              className="admin-open-btn"
              onClick={() => setShowPinEntry(true)}
            >
              <span className="btn-icon">⚙</span>
              <span>Open Configuration</span>
            </button>

            <div className="footer-info">
              <p className="help-text">
                Keyboard shortcut: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>
              </p>
            </div>
          </div>
        </div>

        {showPinEntry && (
          <PinEntry
            onClose={() => setShowPinEntry(false)}
            onSuccess={() => {
              setShowPinEntry(false);
              setShowAdmin(true);
            }}
          />
        )}

        {showAdmin && (
          <AdminSettings 
            onClose={() => setShowAdmin(false)}
            onRoleSet={handleRoleSet}
          />
        )}

        {/* Global Credit Footer */}
        <div className="global-credit">
          <span className="credit-text">by </span>
          <span className="credit-link">dvnny.no</span>
        </div>
      </div>
    );
  }

  // Main app with assigned role
  return (
    <div className="app">
      {viewMode === 'controller' ? <StartScreen /> : <StopScreen />}
      
      {/* Hidden admin access: long press top-left corner */}
      <div 
        className="admin-trigger"
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
      >
        {longPressProgress > 0 && (
          <div 
            className="long-press-indicator"
            style={{ width: `${(longPressProgress / 3000) * 100}%` }}
          />
        )}
      </div>

      {/* Settings Island - Bottom left corner */}
      {!timerState.running && (
        <button 
          className="settings-island"
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(30);
            setShowPinEntry(true);
          }}
          title="Device Settings"
        >
          <IoSettingsSharp size={24} />
        </button>
      )}

      {showPinEntry && (
        <PinEntry
          onClose={() => setShowPinEntry(false)}
          onSuccess={() => {
            setShowPinEntry(false);
            setShowAdmin(true);
          }}
        />
      )}

      {showAdmin && (
        <AdminSettings 
          onClose={() => setShowAdmin(false)}
          onRoleSet={handleRoleSet}
        />
      )}

      {/* Global Credit Footer */}
      <div className="global-credit">
        <span className="credit-text">by </span>
        <span className="credit-link">dvnny.no</span>
      </div>
    </div>
  );
};

export default App;
