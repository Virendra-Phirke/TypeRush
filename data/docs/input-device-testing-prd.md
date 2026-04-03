# Product Requirements Document (PRD)

## Project

Input Device Testing Tool (Keyboard + Mouse + Combined Diagnostics)

## 1. Overview

A web-based testing application that provides real-time diagnostics for keyboard and mouse performance, including latency, responsiveness, rollover behavior, click metrics, and stress behavior under load.

## 2. Objectives

- Provide real-time input diagnostics for keyboard and mouse.
- Help users identify hardware faults and inconsistencies.
- Offer performance metrics valuable for gaming and development workflows.
- Deliver a responsive, animated, low-latency UI with 3D visual polish.

## 3. Target Users

- Gamers testing competitive performance.
- Developers validating input handling and event timing.
- General users troubleshooting peripheral issues.

## 4. Feature Scope

### 4.1 Keyboard Tests

- Anti-ghosting / key rollover checker.
- Key press detection across all keys.
- Typing speed test (WPM).
- Typing accuracy test.
- Key latency approximation.
- Key repeat rate tracker.
- Modifier keys test (Shift, Ctrl, Alt).
- Backlight / LED visual simulation test.

### 4.2 Mouse Tests

- Polling rate approximation (Hz).
- DPI / sensitivity approximation by movement travel.
- Click speed test (CPS).
- Double-click detection.
- Click latency approximation.
- Cursor movement accuracy target test.
- Scroll wheel activity test.
- Drag and drop verification.
- Lift-off distance approximation (pointer leave/enter heuristics).

### 4.3 Combined / Advanced Tests

- Combined input delay view (keyboard + mouse).
- Responsiveness under load (stress mode + FPS).
- Multi-device input simultaneity test.
- Gaming performance aggregate score.

## 5. Functional Requirements

### 5.1 Input Capture

- Keyboard events: keydown, keyup.
- Mouse events: mousemove, mousedown, mouseup, wheel, drag/drop.
- Timing source: performance.now().

### 5.2 Metrics

- WPM = (correctChars / 5) / elapsedMinutes.
- Accuracy = correctChars / totalTypedChars.
- Polling rate = mousemove events per second.
- CPS = clicks in trailing 1-second window.
- Latency approximation = event timestamp to next animation frame commit.

### 5.3 UI Behavior

- Real-time visual feedback and metric updates.
- Virtual keyboard highlighting for active keys.
- Interactive mouse test zone with target and drag/drop.
- Checklist status for each test item (pending vs done).

## 6. UX and Design Requirements

- Dedicated section for Keyboard tests.
- Dedicated section for Mouse tests.
- Dedicated section for Combined tests.
- Animated cards with smooth transitions and 3D-like motion.
- Responsive desktop/mobile layout.
- High contrast and readable metric hierarchy.

## 7. Technical Architecture

### 7.1 Frontend Stack

- Next.js + React + TypeScript.
- Framer Motion for smooth interaction animation.
- Tailwind CSS for layout and visual styling.
- Optional Canvas overlays for advanced trajectories.

### 7.2 Data Handling

- In-memory real-time metrics.
- Optional persisted session snapshots (future enhancement).

## 8. Non-Functional Requirements

- Low-latency rendering and updates.
- Cross-browser compatibility (Chromium/Firefox/Safari modern versions).
- Stable behavior during frequent event bursts.
- No blocking operations on hot input paths.

## 9. Constraints and Risks

- Browser APIs cannot provide true hardware DPI.
- Browser event scheduling affects absolute latency measurements.
- OS-level acceleration influences movement data.
- Polling and latency should be presented as approximations.

## 10. Milestones

- M1: Input event infrastructure + baseline metrics.
- M2: Keyboard and mouse modules complete.
- M3: Combined analytics + stress mode.
- M4: UX polish, 3D animation tuning, and performance optimization.
- M5: QA across devices and browser matrix.

## 11. Success Metrics

- Accurate and stable detection of input events.
- Smooth UI under normal and stress scenarios.
- Minimal dropped interactions in rapid tests.
- Positive user feedback for clarity and usefulness.

## 12. Validation and Acceptance Criteria

- All listed keyboard tests available and interactive.
- All listed mouse tests available and interactive.
- Combined section reports cross-device metrics.
- Build and type-check pass without errors.
- App remains responsive while stress mode is active.
