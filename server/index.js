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
let timerState = {
  running: false,
  endTime: null,
  duration: 60000, // 60 seconds default
  paused: false,
  remainingTime: 60000
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
    if (duration) {
      timerState.duration = duration;
      timerState.remainingTime = duration;
    }
    
    timerState.running = true;
    timerState.paused = false;
    timerState.endTime = Date.now() + timerState.remainingTime;
    
    console.log(`Timer started: ${timerState.duration}ms`);
    io.emit('timer-state', timerState);
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
    timerState.duration = duration;
    if (!timerState.running) {
      timerState.remainingTime = duration;
    }
    
    console.log(`Duration set to: ${duration}ms`);
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
