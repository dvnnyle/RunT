import React, { useState, useEffect } from 'react';
import { IoClose, IoBackspace } from 'react-icons/io5';
import './PinEntry.css';

interface PinEntryProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PinEntry: React.FC<PinEntryProps> = ({ onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const CORRECT_PIN = '0087'; // Admin PIN

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === CORRECT_PIN) {
        // Success
        if (navigator.vibrate) navigator.vibrate(50);
        onSuccess();
      } else {
        // Wrong PIN
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 1000);
      }
    }
  }, [pin, onSuccess]);

  const handleNumber = (num: string) => {
    if (navigator.vibrate) navigator.vibrate(20);
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    setPin('');
  };

  return (
    <div className="pin-overlay">
      <div className="pin-panel">
        <div className="pin-header">
          <h2>Enter Admin PIN</h2>
          <button 
            className="pin-close-btn" 
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(30);
              onClose();
            }}
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="pin-content">
          <div className={`pin-display ${error ? 'error' : ''}`}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`}></div>
            ))}
          </div>

          {error && <div className="pin-error-msg">Incorrect PIN</div>}

          <div className="pin-keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                className="pin-key"
                onClick={() => handleNumber(num)}
                disabled={error}
              >
                {num}
              </button>
            ))}
            <button
              className="pin-key pin-clear"
              onClick={handleClear}
              disabled={error || pin.length === 0}
            >
              C
            </button>
            <button
              className="pin-key"
              onClick={() => handleNumber('0')}
              disabled={error}
            >
              0
            </button>
            <button
              className="pin-key pin-backspace"
              onClick={handleBackspace}
              disabled={error || pin.length === 0}
            >
              <IoBackspace size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinEntry;
