import React, { useState, useEffect } from 'react';
import { ViewMode } from '../types';
import { getDeviceSettings, saveDeviceSettings, clearDeviceSettings } from '../utils/settings';
import { useTimer } from '../hooks/useTimer';
import { IoSettingsSharp, IoCheckmark, IoClose, IoExpand, IoContract, IoExit, IoLockClosed, IoLockOpen, IoTrash } from 'react-icons/io5';
import './AdminSettings.css';

interface AdminSettingsProps {
  onClose: () => void;
  onRoleSet: (role: ViewMode) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onClose, onRoleSet }) => {
  const [selectedRole, setSelectedRole] = useState<ViewMode | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { connected, clientsCount } = useTimer();

  useEffect(() => {
    const settings = getDeviceSettings();
    setSelectedRole(settings.assignedRole);
    setIsLocked(settings.isLocked);
    
    // Check fullscreen status
    if (window.api && window.api.isFullscreen) {
      window.api.isFullscreen().then((fullscreen: boolean) => {
        setIsFullscreen(fullscreen);
      });
    }
  }, []);

  const handleSave = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    if (selectedRole) {
      saveDeviceSettings({
        assignedRole: selectedRole,
        isLocked: true
      });
      onRoleSet(selectedRole);
      alert('✅ Device role saved! App will boot directly to this role.');
      onClose();
    } else {
      alert('⚠️ Please select a role first');
    }
  };

  const handleClear = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }
    if (confirm('⚠️ Clear all settings and unlock device role?')) {
      clearDeviceSettings();
      setSelectedRole(null);
      setIsLocked(false);
      alert('✅ Settings cleared. Role selection will show on next start.');
    }
  };

  const handleToggleFullscreen = async () => {
    if (navigator.vibrate) navigator.vibrate(30);
    if (window.api && window.api.toggleFullscreen) {
      const newFullscreenState = await window.api.toggleFullscreen();
      setIsFullscreen(newFullscreenState);
    }
  };

  const handleQuitApp = () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    if (confirm('⚠️ Are you sure you want to exit the application?')) {
      if (window.api && window.api.quitApp) {
        window.api.quitApp();
      }
    }
  };

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <div className="header-left">
            <div className="settings-icon-header">
              <IoSettingsSharp className="gear-icon" />
            </div>
            <h1>Device Configuration</h1>
          </div>
          <button className="close-btn" onClick={() => {
            if (navigator.vibrate) navigator.vibrate(30);
            onClose();
          }}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="admin-content">
          <div className="connection-status-bar">
            <div className="status-item-inline">
              <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></div>
              <span>{connected ? 'Server Connected' : 'Server Disconnected'}</span>
            </div>
            <div className="status-item-inline">
              <div className="status-indicator">
                <span className="client-count">{clientsCount}</span>
              </div>
              <span>{clientsCount === 1 ? 'Device Online' : `${clientsCount} Devices Online`}</span>
            </div>
          </div>

          <div className="settings-section">
            <h2>Assign Device Role</h2>
            <p className="description">
              Select the role for this device. Once saved, the app will boot directly to this screen.
            </p>

            <div className="role-cards">
              <div 
                className={`role-card ${selectedRole === 'controller' ? 'selected' : ''}`}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(30);
                  setSelectedRole('controller');
                }}
              >
                <div className="role-icon-circle green">
                  <div className="play-icon"></div>
                </div>
                <h3>Side A</h3>
                <div className="role-label">Start Control</div>
                <ul>
                  <li>Large green START button</li>
                  <li>3-2-1 countdown animation</li>
                  <li>Running status indicator</li>
                </ul>
                {selectedRole === 'controller' && <div className="check-badge"><IoCheckmark className="checkmark" /></div>}
              </div>

              <div 
                className={`role-card ${selectedRole === 'display' ? 'selected' : ''}`}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(30);
                  setSelectedRole('display');
                }}
              >
                <div className="role-icon-circle red">
                  <div className="stop-icon"></div>
                </div>
                <h3>Side B</h3>
                <div className="role-label">Stop Control</div>
                <ul>
                  <li>Large red STOP button</li>
                  <li>Current time display</li>
                  <li>Final time on stop</li>
                </ul>
                {selectedRole === 'display' && <div className="check-badge"><IoCheckmark className="checkmark" /></div>}
              </div>
            </div>
          </div>

          <div className="settings-section status-section">
            <div className="status-info">
              <div className="status-item">
                <strong>Current Role:</strong> 
                <span className={`status-value ${selectedRole ? 'set' : 'unset'}`}>
                  {selectedRole === 'controller' ? 'Side A (Start Control)' : 
                   selectedRole === 'display' ? 'Side B (Stop Control)' : 
                   'Not Configured'}
                </span>
              </div>
              <div className="status-item">
                <strong>Lock Status:</strong> 
                <span className={`status-value ${isLocked ? 'locked' : 'unlocked'}`}>
                  {isLocked ? <IoLockClosed size={16} color="#f44336" /> : <IoLockOpen size={16} color="#4caf50" />}
                  <span style={{ marginLeft: '0.5rem' }}>{isLocked ? 'Locked' : 'Unlocked'}</span>
                </span>
              </div>
              <div className="status-item status-action">
                <button 
                  className="btn-primary btn-inline"
                  onClick={handleSave}
                  disabled={!selectedRole}
                >
                  <IoLockClosed size={20} />
                  <span style={{ marginLeft: '0.5rem' }}>Save & Lock Role</span>
                </button>
              </div>
            </div>
          </div>

          <div className="admin-actions">
            <div className="action-section">
              <h3 className="section-title">Display Options</h3>
              <button 
                className="btn-secondary"
                onClick={handleToggleFullscreen}
              >
                {isFullscreen ? <IoContract size={20} /> : <IoExpand size={20} />}
                <span style={{ marginLeft: '0.5rem' }}>
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </span>
              </button>
            </div>

            <div className="action-section">
              <h3 className="section-title">System Actions</h3>
              <div className="button-row">
                <button 
                  className="btn-danger"
                  onClick={handleClear}
                >
                  <IoTrash size={20} />
                  <span style={{ marginLeft: '0.5rem' }}>Clear Settings</span>
                </button>
                <button 
                  className="btn-danger"
                  onClick={handleQuitApp}
                  style={{ background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)' }}
                >
                  <IoExit size={20} />
                  <span style={{ marginLeft: '0.5rem' }}>Exit Application</span>
                </button>
              </div>
              <button 
                className="btn-secondary btn-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="admin-footer">
            <div className="creator-credit">
              <span className="credit-text">by </span>
              <span className="credit-link">dvnny.no</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
