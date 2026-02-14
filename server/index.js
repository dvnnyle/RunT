const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Timer state
const MAX_DURATION = 10 * 60 * 1000;

let timerState = {
  running: false,
  endTime: null,
  duration: MAX_DURATION,
  paused: false,
  remainingTime: MAX_DURATION
};

// Track connected clients
let connectedClients = 0;

let countdownValue = null;
let countdownTimer = null;

const devices = new Map();

const emitDevicesUpdate = () => {
  const list = Array.from(devices.values());
  io.emit('devices-update', list);
};

const normalizeDuration = (duration) => {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.min(value, MAX_DURATION);
};

const startTimer = (duration) => {
  const normalized = normalizeDuration(duration);
  if (normalized) {
    timerState.duration = normalized;
    timerState.remainingTime = normalized;
  } else if (timerState.duration > MAX_DURATION) {
    timerState.duration = MAX_DURATION;
    timerState.remainingTime = Math.min(timerState.remainingTime, MAX_DURATION);
  }

  timerState.running = true;
  timerState.paused = false;
  timerState.endTime = Date.now() + timerState.remainingTime;

  console.log(`Timer started: ${timerState.duration}ms`);
  io.emit('timer-state', timerState);
};

io.on('connection', (socket) => {
  connectedClients++;
  console.log(`Client connected. Total clients: ${connectedClients}`);

  devices.set(socket.id, {
    id: socket.id,
    name: 'Unknown Device',
    role: null
  });
  
  // Send current state to newly connected client
  socket.emit('timer-state', timerState);
  socket.emit('countdown', countdownValue);
  io.emit('clients-count', connectedClients);
  emitDevicesUpdate();

  socket.on('register-device', (payload) => {
    if (!payload || typeof payload !== 'object') {
      return;
    }

    const name = typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim()
      : 'Unknown Device';
    const role = payload.role === 'controller' || payload.role === 'display'
      ? payload.role
      : null;

    devices.set(socket.id, {
      id: socket.id,
      name,
      role
    });

    emitDevicesUpdate();
  });

  socket.on('start-countdown', () => {
    if (countdownTimer) {
      return;
    }

    countdownValue = 3;
    io.emit('countdown', countdownValue);

    countdownTimer = setInterval(() => {
      countdownValue -= 1;
      io.emit('countdown', countdownValue);

      if (countdownValue <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        if (!timerState.running) {
          startTimer();
        }
        setTimeout(() => {
          countdownValue = null;
          io.emit('countdown', countdownValue);
        }, 500);
      }
    }, 1000);
  });

  socket.on('clear-countdown', () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    countdownValue = null;
    io.emit('countdown', countdownValue);
  });

  // Start timer
  socket.on('start-timer', (duration) => {
    startTimer(duration);
  });

  // Stop timer
  socket.on('stop-timer', () => {
    if (timerState.running) {
      timerState.running = false;
      timerState.paused = true;
      timerState.remainingTime = Math.max(0, timerState.endTime - Date.now());
      timerState.endTime = null;
      
      console.log('Timer stopped');
      io.emit('timer-state', timerState);
    }
  });

  // Reset timer
  socket.on('reset-timer', () => {
    timerState.running = false;
    timerState.paused = false;
    timerState.endTime = null;
    timerState.remainingTime = timerState.duration;
    
    console.log('Timer reset');
    io.emit('timer-state', timerState);
  });

  // Set duration
  socket.on('set-duration', (duration) => {
    const normalized = normalizeDuration(duration);
    if (!normalized) {
      return;
    }

    timerState.duration = normalized;
    if (!timerState.running) {
      timerState.remainingTime = normalized;
    }
    
    console.log(`Duration set to: ${normalized}ms`);
    io.emit('timer-state', timerState);
  });

  // Disconnect
  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`Client disconnected. Total clients: ${connectedClients}`);
    io.emit('clients-count', connectedClients);
    devices.delete(socket.id);
    emitDevicesUpdate();
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    clients: connectedClients,
    timerState 
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n🚀 Timer Sync Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Connect clients to: http://localhost:${PORT}\n`);
});
