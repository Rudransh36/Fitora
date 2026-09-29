# ⚡ PulseFit - Sports & Fitness Monitoring Platform

A modern, responsive multi-sport frontend application designed for high-performance athletes to track strength workouts, cricket performance, and badminton match analytics in real time.

---

## 🚀 Key Features by Page

### 1. 🔐 Athlete Authentication (`login.html` & `register.html`)
- **Login (`login.html`)**:
  - Split-screen showcase layout with athlete testimonials and key metrics.
  - **1-Click Demo Login Autofill** (`alex@pulsefit.io` / `athlete123`).
  - Interactive password visibility reveal/hide toggle.
  - Forgot password modal with email verification flow simulation.
  - Quick social sign-in buttons (Google & Apple).
- **Register (`register.html`)**:
  - Personalized athlete onboarding form (Full Name, Username, Email, Fitness Experience level).
  - Multi-sport choice selector pills (Gym & Weightlifting, Cricket, Badminton).
  - Dynamic password strength meter with real-time feedback.
  - Client-side validation and immediate redirection to the dashboard.

---

### 2. 📊 Main Dashboard (`index.html`)
- **4 Key Performance Indicators (KPIs)**:
  - **Daily Calories Burned**: Real-time counter with target progress bar and trend indicators.
  - **Active Training Time**: Total duration logged today vs weekly target.
  - **Heart Rate & Aerobic Zone**: Beats per minute with zone classification and pulsating indicator.
  - **Recovery Score**: Readiness evaluation based on HRV and sleep data.
- **Fast-Launch Sports Pillars**:
  - Dedicated cards for Gym, Cricket, and Badminton with quick stats and one-click navigation.
- **Interactive Visualizations (Chart.js)**:
  - Weekly Calories Burned & Active Minutes combo bar/line chart with dynamic time filters (Today, This Week, This Month).
  - Multi-sport time dedication doughnut chart.
- **Live Activity Feed**: Real-time stream synced directly from `localStorage`.
- **Universal Quick-Log Modal**: Log any activity on the fly from the persistent topbar.

---

### 3. 🏋️ Gym & Strength Tracker (`gym.html`)
- **Routine Switcher**: Preconfigured routines for Push Day, Pull Day, Legs & Core, and Upper Hypertrophy.
- **Live Digital Rest Timer**:
  - Circular SVG countdown ring with smooth transition.
  - Quick presets: 30s, 60s, 90s, and 120s.
  - Play, Pause, and Reset controls.
  - Synthesized Web Audio alert chime when the rest period completes.
- **1-Rep Maximum (1RM) Estimator**:
  - Computes theoretical maximums using the Epley formula.
  - Instant breakdown for 90% (heavy triples), 80% (hypertrophy), and 70% (endurance) loads.
- **Set-by-Set Interactive Logger**:
  - Exercise cards (Bench Press, Standing Overhead Press, Incline Dumbbell Press, etc.).
  - Target weight, rep counters, and interactive set completion buttons.
  - Dynamic session volume accumulator that updates as sets are checked.
  - `+ Add Set` and `+ Add Custom Exercise` modals.
- **PR Showcase & Radar Balance Chart**:
  - Highlights all-time personal records.
  - Radar chart visualizing weekly volume balance across all major muscle groups.

---

### 4. 🏏 Cricket Performance Analytics (`cricket.html`)
- **Career & Season Summary Cards**:
  - Batting Aggregate (Runs, Average, Strike Rate, 50s, 100s).
  - Bowling Impact (Wickets, Economy Rate, Best Bowling Figures, Dot Ball %).
  - Athleticism (Distance run between the wickets, Top sprint speed, Catches, Run-outs).
  - Match Win Ratio.
- **Tactical Pitch & Wagon Wheel Visualization**:
  - Sector-by-sector breakdown: Cover Drives (28%), Pull Shots (34%), Straight Hits (22%), Leg Glances (16%).
- **Interactive Match Logger Modal**:
  - Comprehensive match logger supporting T20, 50-Over, Multi-Day, and Net Practice sessions.
  - Records runs, balls faced, boundaries (4s & 6s), not-out status, overs bowled, maidens, runs conceded, and wickets.
- **Performance Charts**:
  - Inning-by-inning runs scored and strike rate progression line chart.
  - Boundary vs dot-ball doughnut chart.
- **Filterable Match History**: Filter by All, T20s, 50-Overs, or Net Sessions.

---

### 5. 🏸 Badminton Arena & Live Match Scorer (`badminton.html`)
- **Interactive Live Digital Scoreboard**:
  - Real-time point tracking for Player 1 (Alex) vs Player 2 (Opponent).
  - Official **BWF Court Service Parity**: Automatically indicates whether the server delivers from the **Right Court** (Even scores: 0, 2, 4...) or **Left Court** (Odd scores: 1, 3, 5...).
  - Animated pulsating **Game Point** and **Match Point** alert banners.
  - Quick action buttons: `+1 Point`, `-1 Undo`, `💥 Smash Winner (+1)`, and `Unforced Error`.
  - Best-of-3 sets tracker that records finished game scores.
- **Season Badminton Metrics**:
  - Win rate (68%), Smash count (384), Average rally length (8.4 shots), and Calorie burn.
- **Tactical Shot Mastery Radar**:
  - Accuracy and frequency radar chart for Smashes, Drops, Net Kills, Clears, and Drives.
- **Filterable Match History & Logger**:
  - Filter past games by Wins, Losses, Singles, and Doubles.
  - Modal to log completed past matches.

---

## 📱 Responsive Design Architecture

- **Desktop (> 1024px)**: Fixed 260px athletic sidebar with full navigation, sticky glassmorphic topbar with search, and multi-column grid layouts.
- **Tablet (768px - 1024px)**: Adaptive 2-column re-flowing layout with preserved topbar controls.
- **Mobile (< 768px)**:
  - Collapsible drawer navigation menu with smooth overlay.
  - Fixed **Bottom Navigation Bar** optimized for thumb reach across Dashboard, Gym, Cricket, Badminton, and Profile.
  - Full-width touch-friendly buttons and score counters.

---

## 🛠️ Technology Stack (Zero Build Step Required)

- **HTML5**: Semantic tags (`<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, `<article>`, `<footer>`).
- **CSS3**: Custom properties (CSS variables), Flexbox, CSS Grid, Glassmorphism backdrop filters, and CSS keyframe animations.
- **JavaScript (ES6+)**:
  - Modular, vanilla architecture.
  - `localStorage` mock database pre-seeded with realistic athletic data.
  - Web Audio API for timer sound alerts.
- **Chart.js 4.4.1 (CDN)**: Canvas-based charts configured for high-contrast dark themes.
- **Font Awesome 6.5.1 (CDN)**: High-resolution vector sports icons.
- **Google Fonts**: `Outfit` (athletic geometric sans-serif) and `JetBrains Mono` (crisp digital timers and scores).

---

## 🏃 How to View & Run

Since this is a client-side frontend UI, no package installations or build steps are necessary:

### Option 1: Direct File Open
Simply double-click `index.html` or `login.html` to open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Python)
Run the following command from the project root:
```bash
python -m http.server 3000
```
Then navigate to `http://localhost:3000` in your browser.
