# Two-Tablet Countdown Timer System

## Overview

This project is a synchronized countdown timer system built using:

-   Electron
-   React (TypeScript / TSX)
-   Socket.IO (WebSockets)
-   Node.js (Express server)

The system runs on **two Windows touch tablets** that stay in sync in
real-time over Wi-Fi.

------------------------------------------------------------------------

## System Architecture

Tablet A (Controller) \<--\> Node.js Server \<--\> Tablet B (Display)

The server acts as the central "brain" and maintains the timer state.
Both tablets connect to it using WebSockets.

------------------------------------------------------------------------

## Roles

### Tablet A -- Controller

-   Start timer
-   Stop timer
-   Reset timer (optional)
-   Possibly change duration

### Tablet B -- Display

-   Shows large countdown
-   Can optionally stop timer
-   Visual + audio alert when timer hits 0

------------------------------------------------------------------------

## Technology Stack

### Frontend

-   Electron
-   React
-   TypeScript (.tsx)
-   Socket.IO Client

### Backend

-   Node.js
-   Express
-   Socket.IO

------------------------------------------------------------------------

## Timer Logic Design

The server stores:

``` js
let timerState = {
  running: false,
  endTime: null
};
```

When the timer starts: - Server sets endTime = Date.now() + duration -
Server broadcasts state to all clients

Clients calculate:

    timeLeft = endTime - Date.now()

This prevents drift between devices.

------------------------------------------------------------------------

## Network Setup

-   Both tablets must be on the same Wi-Fi network.
-   Server runs on one device (or PC).
-   Other tablet connects using local IP address.

Example:

    io("http://192.168.1.42:3000")

------------------------------------------------------------------------

## Features

-   Real-time synchronization
-   Fullscreen kiosk mode
-   Touch-friendly interface
-   Auto-reconnect support
-   Optional buzzer at 0
-   Optional visual flash on finish

------------------------------------------------------------------------

## Future Improvements

-   Save session history
-   Add multiple timer presets
-   Remote control from mobile device
-   Admin lock mode
-   Theming system

------------------------------------------------------------------------

## Cost

Total cost: \$0

No database required. No cloud hosting required. Runs locally over
Wi-Fi.

------------------------------------------------------------------------

## Project Status

Core components planned: - \[ \] Node.js sync server - \[ \] React
countdown UI - \[ \] WebSocket integration - \[ \] Kiosk mode
configuration - \[ \] Auto-start on Windows boot

------------------------------------------------------------------------

End of documentation.
