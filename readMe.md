# Stop Time Blindness

A browser-based focus timer that keeps task progress visible in Picture-in-Picture and stores a private local work log.

The project explores a practical question: can a small always-on-top visual make elapsed time easier to perceive while working in another application? It renders timer progress to a canvas, streams that canvas through a hidden video, and opens it in the browser's Picture-in-Picture window.

> **Status:** experimental but substantial prototype. Stopwatch, countdown, Pomodoro, local logs, exports, and PiP rendering are implemented; browser compatibility still varies.

[Open the GitHub Pages experiment](https://simplecaci.github.io/Stop-Time-Blindness/) *(deployment not revalidated in this audit)*

## Capabilities

- stopwatch, countdown, and 25/5 Pomodoro modes
- current-task and optional note fields
- block-based visual progress
- compact card and wide-bar layouts
- canvas preview and always-on-top Picture-in-Picture display
- local session logs with timestamps, targets, and overtime
- CSV and JSON log downloads
- typed confirmation before a full timer reset

## How it works

```text
timer state
   -> canvas renderer
   -> canvas.captureStream()
   -> hidden video element
   -> browser Picture-in-Picture window
```

Logs are stored in browser `localStorage`; no server or account is required.

## Run locally

No build step is required:

```bash
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). Select **Prepare PiP** before **Enter PiP** because browsers require media initialization and a direct user gesture.

## Privacy

Task names and notes remain in the current browser profile unless the user downloads or clears them. Shared computers and browser-profile synchronization may still expose that data. Avoid entering sensitive work details without understanding the browser's storage behavior.

## Browser support

Picture-in-Picture, `canvas.captureStream()`, autoplay, and user-gesture rules differ between browsers. The main implementation was written with Safari compatibility in mind, but current Chrome, Edge, Firefox, Safari, desktop, and mobile behavior has not been fully verified.

## Validation status

No automated tests or CI workflow currently exist. Timer calculations, Pomodoro transitions, log serialization, and CSV escaping are suitable for unit tests. PiP behavior requires manual browser testing.

## Known limitations

- PiP support and media timing vary by browser
- the implementation is concentrated in one large HTML file
- timer accuracy after sleep/background throttling needs review
- destructive log clearing needs stronger confirmation
- accessibility, keyboard shortcuts, and reduced-motion behavior need testing
- `browswerPIP.html` has a spelling error and appears to be an earlier experiment
- root `main.js`, `worker.js`, and the inline implementation need consolidation

## Roadmap

- extract timer and log logic into testable modules
- add clear unsupported-browser and PiP-failure states
- restore active sessions safely after a refresh
- add keyboard controls and reduced-motion preferences
- compare standard PiP with Document Picture-in-Picture
- consolidate prototype files and document GitHub Pages deployment

## Authorship

Created by [SimpleCaci](https://github.com/SimpleCaci). A project license has not yet been selected.
