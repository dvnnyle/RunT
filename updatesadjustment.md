# updatesadjustment

## UI Simplification Update

The interface has been simplified to remove unnecessary detail.

### Side A -- Start Screen

Purpose: Only start the countdown.

UI Requirements: - One large START button centered on screen - Minimal
design - No extra settings visible - Touch friendly

### Behavior:

1.  Press START
2.  Display short visual countdown: 3 2 1
3.  Timer begins immediately after countdown
4.  Sync state sent to server

------------------------------------------------------------------------

## Side B -- Stop Screen

Purpose: Stop the timer and display result.

UI Requirements: - One very large STOP button - Fullscreen layout - High
contrast for visibility

### Behavior:

1.  Press STOP
2.  Timer stops immediately
3.  Final time is displayed clearly on screen
4.  State sent to server

------------------------------------------------------------------------

## Timer Flow Logic

Start → 3-2-1 countdown → Running\
Stop → Freeze time → Show final time

No extra menus.\
Clean appliance-style design.

------------------------------------------------------------------------

## How to Simulate Two Devices on One PC

Since tablets are not available yet, you can test using your main PC.

### Option 1 -- Two Browser Windows (Fastest)

1.  Run your Node server: node server.js

2.  Start Electron app OR web dev server

3.  Open two separate windows:

    -   Window 1 → Side A
    -   Window 2 → Side B

You can: - Open one normal window - Open one Incognito window This
simulates two independent devices.

------------------------------------------------------------------------

### Option 2 -- Two Electron Instances

Run:

npm run dev npm run dev

If needed, modify your app to accept a role parameter:

Example:

npm run dev -- --role=A npm run dev -- --role=B

Then inside React:

const role = new URLSearchParams(window.location.search).get("role");

Render UI based on role.

------------------------------------------------------------------------

### Option 3 -- Use Two Different Browsers

Example: - Chrome → Side A - Edge → Side B

This better simulates separate devices because sessions are isolated.

------------------------------------------------------------------------

## Recommended Dev Setup

Until tablets arrive:

-   Server running locally
-   Two browser windows testing sync
-   Console open to monitor socket events

------------------------------------------------------------------------

## Next Steps

-   Implement 3-2-1 animated countdown
-   Implement big STOP screen
-   Add fullscreen mode
-   Add sound alert at finish
-   Add reconnect handling

------------------------------------------------------------------------

End of update documentation.
