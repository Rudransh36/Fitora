# ⚡ Fitora - Sports & Fitness Monitoring Platform (Full Stack)

A comprehensive, production-grade Sports and Fitness Monitoring Web Application built for college Minor Project presentation, viva evaluation, and real-world athletic performance tracking.

The system features an athletic dark-mode responsive frontend, an Express.js & MongoDB REST API backend, JWT authentication, scientifically verified sports calculation algorithms, and an Indian diet recommendation engine.

---

## 🏗️ System Architecture

```
                       ┌────────────────────────────────────────────────────────┐
                       │                   CLIENT (BROWSER)                     │
                       │   HTML5 / CSS3 / Vanilla JS (ES6+) / Chart.js 4.4     │
                       └───────────┬────────────────────────────────────────────┘
                                   │  HTTP Requests (JSON)
                                   │  Headers: Authorization: Bearer <JWT>
                                   ▼
                       ┌────────────────────────────────────────────────────────┐
                       │               EXPRESS.JS BACKEND (PORT 5000)           │
                       │   ├── CORS, JSON Body Parser, Static Frontend Files    │
                       │   ├── authMiddleware (JWT Verification via Bearer)     │
                       │   └── REST API Routes (/api/...)                       │
                       └───────────┬────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   CALCULATIONS   │     │ RECOMMENDATIONS  │     │   DATA STORAGE   │
│  ├── Mifflin-St  │     │  ├── Indian Food │     │  ├── User / Auth │
│      Jeor (BMR)  │     │      Catalog     │     │  ├── Workouts    │
│  ├── TDEE Multi  │     │  ├── Strict Diet │     │  ├── Cricket     │
│  ├── BMI Formula │     │      Filtering   │     │  ├── Badminton   │
│  ├── MET Calorie │     │  ├── Sport-Based │     │  ├── Diet Plans  │
│      Burn        │     │      Nutrition   │     │  └── Progress    │
│  ├── Epley 1-RM  │     │  └── 7-Day Sport │     └─────────┬────────┘
│  └── Hydration   │     │      Schedules   │               │
└──────────────────┘     └──────────────────┘               ▼
                                                   ┌──────────────────┐
                                                   │ MONGODB DATABASE │
                                                   │ Primary: :27017  │
                                                   │ Fallback: Memory │
                                                   └──────────────────┘
```

---

## 🚀 Key Features

### 1. 🔐 Authentication & Profile Management (`login.html` & `register.html`)
- **JWT Authentication**: Secure stateless token issuance and verification with 30-day expiry.
- **Password Security**: Passwords salted and hashed with `bcryptjs` (salt rounds: 10).
- **1-Click Demo Login Autofill**: Prefills verified credentials (`alex@Fitora.io` / `athlete123`).
- **Comprehensive Onboarding**: Captures Age, Gender, Height, Weight, Activity Level, Fitness Goal, Selected Sport, and Dietary Preference.
- **Automatic Seed Support**: On server startup, automatically seeds a demo athlete with pre-populated workout, cricket, badminton, and nutrition history.

### 2. 📊 Dynamic Athlete Dashboard (`index.html`)
- **Real-Time KPI Cards**:
  - Daily Calories Burned (aggregates today's gym + cricket + badminton sessions).
  - Target Caloric Requirement (dynamically computed via Mifflin-St Jeor TDEE).
  - Weekly Completed Workouts & Lifted Volume (kg).
  - BMI Index & Health Category Classification.
  - Recovery Score computed from sleep duration & training intensity.
- **Interactive Visualizations (Chart.js)**:
  - Weekly Activity & Calories Burned Combo Chart with filterable views (Today, Week, Month).
  - Sport Dedication Split Doughnut Chart.
- **Universal Quick Log Modal**: Log any sport workout on the fly directly to the backend.

### 3. 🏋️ Gym & Strength Tracking (`gym.html`)
- **Routine Switcher**: Push Day, Pull Day, Legs & Core, and Upper Hypertrophy.
- **Digital Rest Timer**:
  - Circular SVG countdown ring with smooth transition.
  - Quick presets: 30s, 60s, 90s, and 120s.
  - Web Audio API synthesized audio chime on countdown completion.
- **1RM (One Repetition Max) Estimator**:
  - Scientific Epley formula computation.
  - Sub-maximal training breakdown: 90% (3 Reps), 80% (8 Reps), 70% (12 Reps).
- **Set-by-Set Interactive Logger**:
  - Dynamic set completion, real-time volume accumulator ($Volume = Weight \times Reps$).
  - `+ Add Set`, `+ Add Custom Exercise`, and `Finish Workout` syncing with `/api/gym`.
- **Muscle Balance Radar Chart**: Visualizes weekly sets per muscle group.

### 4. 🏏 Cricket Performance Analytics (`cricket.html`)
- **Batting & Bowling Metrics**:
  - Batting Aggregate, Strike Rate ($Runs / Balls \times 100$), Fours, Sixes, Not-Out tracking.
  - Bowling Figures (Overs, Maidens, Runs Conceded, Wickets, Economy Rate: $Runs / Overs$).
  - Fielding & Fitness: Pitch running distance (km) and top sprint speed (km/h).
- **Inning-by-Inning Batting Trend Chart**: Correlates runs scored and strike rate across recent innings.
- **Scoring Shots Distribution**: Doughnut breakdown of boundaries vs singles vs dot balls.
- **Match Logging & History**: Multi-format support (T20, 50-Over ODI, Multi-Day, Net Practice).

### 5. 🏸 Badminton Arena & Live Scorer (`badminton.html`)
- **Live Digital Court Scoreboard**:
  - Point-by-point tracking with `+1`, `-1 Undo`, `💥 Smash Winner`, and `Unforced Error`.
  - **Official BWF Service Parity**: Automatically indicates whether the server delivers from the **Right Court** (Even scores: 0, 2, 4...) or **Left Court** (Odd scores: 1, 3, 5...).
  - Animated Game Point & Match Point alert banners.
  - Best-of-3 sets tracker; completed matches auto-saved to backend database.
- **Tactical Shot Mastery Radar**: 6-axis evaluation (Smashes, Drops, Net Kills, Clears, Drives, Trick Shots).
- **Filterable Match Logs**: Filter past games by Wins, Losses, and Game Mode.

### 6. 🥗 Indian Diet & Nutrition Engine (`/api/diet`)
- **Authentic Indian Food Catalog**: Over 30 curated North & South Indian and Maharashtrian dishes (Vegetable Upma, Moong Dal Chilla, Thalipeeth, Sattu Drink, Jowar Bhakri, Paneer Bhurji, Dal Khichdi, Taak).
- **Strict Dietary Filtering**:
  - *Vegetarian*: Plant proteins, lentils, legumes, paneer, sprouts, curd.
  - *Eggetarian*: Eggs + all vegetarian staples (no meat/fish).
  - *Non-Vegetarian*: Chicken, fish, eggs + whole grains.
- **Sport-Specific Partitioning**:
  - *Gym*: Hypertrophy focus with 1.6-2.0g protein/kg body weight.
  - *Cricket*: Glycogen retention, pitch endurance, and hydration electrolytes.
  - *Badminton*: Light gastric footprint, rapid energy, and anti-inflammatory spices.

---

## 🧮 Mathematical & Scientific Calculations (Viva Reference)

### 1. Basal Metabolic Rate (BMR) – Mifflin-St Jeor Equation
$$\text{BMR}_{\text{Male}} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{years}}) + 5$$
$$\text{BMR}_{\text{Female}} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{years}}) - 161$$

### 2. Total Daily Energy Expenditure (TDEE)
$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$
- Sedentary: $\times 1.2$
- Lightly Active: $\times 1.375$
- Moderately Active: $\times 1.55$
- Very Active: $\times 1.725$
- Extremely Active: $\times 1.9$

### 3. Body Mass Index (BMI)
$$\text{BMI} = \frac{\text{weight}_{\text{kg}}}{(\text{height}_{\text{m}})^2}$$
- Underweight: $< 18.5$
- Normal: $18.5 - 24.9$
- Overweight: $25.0 - 29.9$
- Obese: $\ge 30.0$

### 4. Calorie Burn Estimation (MET Formula)
$$\text{Calories Burned} = \text{Duration}_{\text{minutes}} \times \left( \frac{\text{MET} \times 3.5 \times \text{weight}_{\text{kg}}}{200} \right)$$
- Heavy Weightlifting: $\text{MET} = 6.0$
- Cricket Match / Nets: $\text{MET} = 5.0 - 6.5$
- Competitive Badminton: $\text{MET} = 7.0$

### 5. One Repetition Maximum (1RM) – Epley Formula
$$\text{1RM} = \text{Weight Lifted} \times \left(1 + \frac{\text{Reps}}{30}\right)$$

### 6. Daily Hydration Target
$$\text{Water}_{\text{ml}} = (\text{weight}_{\text{kg}} \times 35) + \text{Activity Bonus (500 - 1000 ml)}$$

---

## 💻 How to Run the Project

### Prerequisites
- Node.js (v18 or higher installed on your machine)

### Step 1: Navigate to Backend Directory & Start the Server
Open a terminal in the project directory:
```powershell
cd "c:\Users\rudra\Downloads\minor project\backend"
node server.js
```
*(Or use `npm start` / `npm run dev`)*

### Automatic Database Magic:
If you have a local MongoDB service running on `localhost:27017`, the server automatically connects to it.
If **no MongoDB service is running**, the backend automatically boots an **embedded in-memory MongoDB instance** (`MongoMemoryServer`) and pre-seeds it with demo athlete records! Zero configuration needed.

### Step 2: Open in Browser
Once the server starts:
- **Web App URL**: [http://localhost:5000](http://localhost:5000)
- **API Base URL**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Step 3: Log In
- On [http://localhost:5000/login.html](http://localhost:5000/login.html), click **"Fill Demo Credentials"** (`alex@Fitora.io` / `athlete123`) and click **Sign In**.
- Or register a new athlete on `register.html` with your custom biometrics!

---

## 📡 Complete REST API Endpoint Directory

| Method | Endpoint | Description | Protected? |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new athlete account & return JWT | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `GET` | `/api/auth/me` | Get currently authenticated athlete | Yes (JWT) |
| `GET` | `/api/profile` | Full profile with calculated BMR, TDEE, BMI | Yes (JWT) |
| `PUT` | `/api/profile` | Update profile fields & biometrics | Yes (JWT) |
| `GET` | `/api/dashboard` | Aggregated KPIs, recovery score, recent feed | Yes (JWT) |
| `GET` | `/api/gym` | List workout sessions | Yes (JWT) |
| `POST` | `/api/gym` | Log new gym session & calculate calories | Yes (JWT) |
| `GET` | `/api/gym/stats` | Weekly volume, PRs, and muscle group balance | Yes (JWT) |
| `POST` | `/api/gym/calculate-1rm` | Calculate 1-Rep Max via Epley formula | Yes (JWT) |
| `GET` | `/api/gym/recommendations` | AI gym training recommendations & schedule | Yes (JWT) |
| `GET` | `/api/cricket` | List cricket match & practice sessions | Yes (JWT) |
| `POST` | `/api/cricket` | Log cricket match, batting & bowling stats | Yes (JWT) |
| `GET` | `/api/cricket/stats` | Season runs, wickets, avg, strike rate | Yes (JWT) |
| `GET` | `/api/cricket/recommendations` | AI cricket endurance & stamina advice | Yes (JWT) |
| `GET` | `/api/badminton` | List badminton tournament & practice games | Yes (JWT) |
| `POST` | `/api/badminton` | Log badminton match, scoreline & smashes | Yes (JWT) |
| `GET` | `/api/badminton/stats` | Win rate, rally stats, and radar scores | Yes (JWT) |
| `GET` | `/api/badminton/recommendations`| Tactical court agility & smash tips | Yes (JWT) |
| `GET` | `/api/diet` | Fetch current personalized Indian diet plan | Yes (JWT) |
| `POST` | `/api/diet/generate` | Regenerate diet plan based on biometrics | Yes (JWT) |
| `GET` | `/api/progress` | Timeline history of body metrics & volume | Yes (JWT) |
| `POST` | `/api/progress` | Log daily body weight, hydration & workout | Yes (JWT) |
| `GET` | `/api/health` | Server & API health status check | No |

---

## 🎓 College Minor Project Viva Q&A Guide

**Q1: What is the tech stack of this project?**
> *Frontend*: HTML5, Vanilla CSS3 (Custom Design System with CSS variables and glassmorphism), Vanilla JavaScript ES6+, and Chart.js for data visualization.  
> *Backend*: Node.js and Express.js REST API with modular MVC architecture.  
> *Database*: MongoDB with Mongoose ODM (featuring dual-mode connection: MongoDB standalone or embedded memory database fallback for demonstration).  
> *Security*: bcryptjs for salt-hashed passwords and JSON Web Tokens (JWT) for stateless token authentication.

**Q2: How does the authentication system work?**
> When a user registers or logs in, their password is verified using bcrypt's secure compare function. Upon successful verification, the server generates a cryptographically signed JWT containing the user ID in the payload. The client stores this in `localStorage` and transmits it in the HTTP `Authorization: Bearer <token>` header for all protected API requests. The `protect` middleware decodes and verifies the token on every request.

**Q3: How are calories and BMR calculated?**
> We use the clinically validated Mifflin-St Jeor formula to determine Basal Metabolic Rate (BMR) from age, gender, height, and weight. Total Daily Energy Expenditure (TDEE) is calculated by applying an activity multiplier (1.2 to 1.9). Active exercise calorie burn uses the Metabolic Equivalent of Task (MET) formula scaled by body mass and session duration.

**Q4: What makes the Indian diet plan unique?**
> Rather than generic Western meal suggestions (like oatmeal and chicken breast), our engine features a rich catalog of authentic Indian dishes including regional staples (Vegetable Upma, Moong Dal Chilla, Thalipeeth, Sattu Drink, Jowar Bhakri, Paneer Bhurji, Dal Khichdi, Taak). It strictly enforces Vegetarian, Eggetarian, or Non-Vegetarian preferences and adapts macros specifically for Gym (muscle protein synthesis), Cricket (pitch stamina and electrolytes), or Badminton (court agility and low gastric footprint).

**Q5: How does the application handle offline mode or database unavailability?**
> If a local MongoDB instance is not detected, the application automatically initiates an embedded MongoDB engine (`mongodb-memory-server`) and seeds it with demo records. Furthermore, client-side scripts maintain resilient fallback logic using `localStorage`, ensuring the website remains presentable during examinations without breaking.
#   F i t o r a  
 