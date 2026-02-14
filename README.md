# Two-Tablet Countdown Timer System

A synchronized countdown timer system built with Electron, React (TypeScript), and Socket.IO for real-time synchronization across multiple devices.

## 🎯 Features

- **Real-time Synchronization** - Multiple devices stay perfectly in sync
- **Dual Mode Operation**
  - **Controller Mode** (Tablet A) - Full control panel with start/stop/reset
  - **Display Mode** (Tablet B) - Large fullscreen countdown display
- **Touch-Friendly UI** - Optimized for tablets
- **Visual & Audio Alerts** - Flashing screen and beep sound when timer finishes
- **Preset Durations** - Quick access to common timer durations
- **Custom Durations** - Set any duration from 1-60 minutes
- **Auto-Reconnect** - Automatically reconnects if connection drops
- **Kiosk Mode Ready** - Perfect for fullscreen tablet deployments

## 🛠️ Technology Stack

- **Frontend**: Electron + React 18 + TypeScript
- **Backend**: Node.js + Express + Socket.IO
- **Real-time Sync**: WebSocket (Socket.IO)
- **Build Tool**: Webpack 5

## 📁 Project Structure

```
project/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts           # Main process entry
│   │   └── preload.ts        # Preload script
│   └── renderer/             # React renderer process
│       ├── components/
│       │   ├── ControllerView.tsx    # Controller UI (Tablet A)
│       │   ├── ControllerView.css
│       │   ├── DisplayView.tsx       # Display UI (Tablet B)
│       │   └── DisplayView.css
│       ├── hooks/
│       │   └── useTimer.ts           # Timer hook with Socket.IO
│       ├── types.ts                  # TypeScript interfaces
│       ├── App.tsx                   # Main app component
│       ├── App.css
│       └── index.tsx
├── server/
│   └── index.js              # Socket.IO sync server
├── dist/                     # Build output
└── package.json

```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Windows (for production deployment on tablets)

### Installation

```bash
# Install dependencies
npm install
```

### Development

**Option 1: Run everything separately (recommended for development)**

```bash
# Terminal 1: Start the sync server
npm run server

# Terminal 2: Start development mode
npm run dev

# Terminal 3: Launch Electron app
npm start
```

**Option 2: Quick start (experimental)**

```bash
npm run start:all
```

### Building for Production

```bash
npm run build
```

### Package as Executable

```bash
npm run package
```

The packaged application will be in the `release/` directory.

## 📱 How to Use

### Initial Setup

1. **Start the Server**
   ```bash
   npm run server
   ```
   Server runs on `http://localhost:3001`

2. **Launch the App**
   - Start the Electron app on both tablets
   - You'll see a mode selection screen

3. **Select Modes**
   - **Tablet A** → Select "Controller" mode
   - **Tablet B** → Select "Display" mode

### Controller Mode (Tablet A)

- ▶️ **Start** - Begin countdown
- ⏸️ **Stop** - Pause the timer
- 🔄 **Reset** - Reset to selected duration
- **Quick Presets** - 30 sec, 1 min, 2 min, 5 min, 10 min, 15 min
- **Custom Duration** - Set any duration (1-60 minutes)
- **Status Indicators** - See connection status and client count

### Display Mode (Tablet B)

- **Large Countdown** - Easy to read from a distance
- **Auto-Sync** - Updates in real-time with controller
- **Visual Alerts** - Screen flashes red when time's up
- **Audio Alert** - Beep sound plays at completion
- **Emergency Stop** - Can stop timer if needed

### Network Setup

**For Local Network (Same Wi-Fi):**

1. Find the server computer's IP address:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Update `SERVER_URL` in [src/renderer/hooks/useTimer.ts](src/renderer/hooks/useTimer.ts):
   ```typescript
   const SERVER_URL = 'http://192.168.1.X:3001';  // Replace with actual IP
   ```

3. Ensure firewall allows port 3001

**For Same Device (Testing):**
- Default `http://localhost:3001` works perfectly

## 🎨 Customization

### Change Server Port

Edit [server/index.js](server/index.js):
```javascript
const PORT = process.env.PORT || 3001;  // Change 3001 to desired port
```

### Change Timer Appearance

- **Controller**: Edit [src/renderer/components/ControllerView.css](src/renderer/components/ControllerView.css)
- **Display**: Edit [src/renderer/components/DisplayView.css](src/renderer/components/DisplayView.css)

### Add More Presets

Edit [src/renderer/components/ControllerView.tsx](src/renderer/components/ControllerView.tsx):
```typescript
const presetDurations = [
  { label: '30 sec', value: 30000 },
  { label: '1 min', value: 60000 },
  // Add more presets here
];
```

## 🖥️ Kiosk Mode Setup (Windows)

For full-screen kiosk deployment on tablets:

1. **Windows + R** → `shell:startup`
2. Create a shortcut to your packaged `.exe`
3. Right-click shortcut → Properties
4. Add to Target (after .exe path): `--kiosk`
5. Tablet will launch app in fullscreen on boot

## 🔧 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev servers (renderer + main watch) |
| `npm run dev:renderer` | Start renderer dev server only |
| `npm run dev:main` | Build main process in watch mode |
| `npm run build` | Build for production |
| `npm run start` | Launch Electron app |
| `npm run server` | Start Socket.IO sync server |
| `npm run package` | Package app for distribution |

## 🐛 Troubleshooting

### "Cannot connect to server"
- Ensure server is running (`npm run server`)
- Check SERVER_URL in useTimer.ts matches server address
- Verify firewall isn't blocking port 3001

### "White screen" in Electron
- Run `npm run build` first
- Check DevTools console (Ctrl+Shift+I) for errors
- Ensure port 3000 isn't blocked

### Timer not syncing between devices
- Both devices must be on same network
- Server must be accessible to all devices
- Check connection indicator (should be green)

### Audio not playing
- Browser/Electron may block autoplay -User interaction required for first play
- Check system volume

## 💡 Tips

- Use **wired Ethernet** for most reliable sync
- Set Windows power settings to "Never sleep"
- Disable Windows updates during events
- Test connection before important events
- Keep devices plugged in

## 📄 License

ISC

## 🤝 Contributing

This is a local project, but feel free to fork and customize for your needs!

## 📞 Support

Check the project specification document: [pROJECT-Two-Tablet-Countdown-Timer-System.md](pROJECT-Two-Tablet-Countdown-Timer-System.md)

---

**Cost**: $0 (No cloud hosting, no database, runs locally!)  
**Setup Time**: < 10 minutes  
**Perfect for**: Events, presentations, classrooms, workshops, competitions
