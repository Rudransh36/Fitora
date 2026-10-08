/**
 * Fitora – Frontend API Client
 * ──────────────────────────────────────────────────────────────────────────────
 * Central module for all HTTP calls to the Fitora backend API.
 * Every page imports this file instead of making raw fetch calls directly.
 *
 * BASE_URL: Points to the local Express server running on port 5000.
 * Token:    Stored in localStorage as 'Fitora_token'.
 * User:     Cached in localStorage as 'Fitora_user' (JSON).
 */

const API_BASE = (() => {
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return 'http://localhost:5000/api';
  }
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocal && window.location.port !== '5000' && window.location.port !== '') {
    return 'http://localhost:5000/api';
  }
  return '/api';
})();

// ─── Token Helpers ────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('Fitora_token');
}

function setToken(token) {
  localStorage.setItem('Fitora_token', token);
}

function clearAuth() {
  localStorage.removeItem('Fitora_token');
  localStorage.removeItem('Fitora_user');
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('Fitora_user'));
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  localStorage.setItem('Fitora_user', JSON.stringify(user));
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

/**
 * Makes a fetch request to the backend.
 * Automatically adds the Authorization header when a token is present.
 */
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && data && data.message && data.message.includes('token no longer exists')) {
        clearAuth();
        const currentPath = window.location.pathname.toLowerCase();
        if (!currentPath.endsWith('login.html') && !currentPath.endsWith('register.html') && !currentPath.endsWith('landing.html')) {
          window.location.href = 'login.html';
        }
      }
      throw new Error(data.message || `Server error: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Network error (server not running)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('⚠️ Cannot connect to server. Make sure the backend is running (npm run dev).');
    }
    throw error;
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

const Auth = {
  /**
   * Register a new user account
   * @param {Object} userData - { name, email, password, age, gender, height, weight, ... }
   */
  async register(userData) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token) {
      setToken(data.token);
      setStoredUser(data.user);
    }
    return data;
  },

  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      setToken(data.token);
      setStoredUser(data.user);
    }
    return data;
  },

  /** Logout: clear localStorage and redirect to login page */
  logout() {
    clearAuth();
    window.location.href = '/login.html';
  },

  /** Verify JWT still valid and return current user from server */
  async getMe() {
    return apiFetch('/auth/me');
  },

  /** Store token in localStorage */
  setToken(token) {
    setToken(token);
  },

  /** Returns true if a valid token exists in localStorage */
  isLoggedIn() {
    return !!getToken();
  },

  /** Check if Google OAuth credentials are configured */
  async getGoogleStatus() {
    try {
      return await apiFetch('/auth/google/status');
    } catch {
      return { configured: false };
    }
  },

  /** Check if Apple Sign-In credentials are configured */
  async getAppleStatus() {
    try {
      return await apiFetch('/auth/apple/status');
    } catch {
      return { configured: false };
    }
  }
};

// ─── Profile API ──────────────────────────────────────────────────────────────

const Profile = {
  /** Get full user profile with computed biometrics */
  async get() {
    return apiFetch('/profile');
  },

  /**
   * Update user profile fields
   * @param {Object} updates - any subset of profile fields
   */
  async update(updates) {
    const data = await apiFetch('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (data.profile) {
      setStoredUser(data.profile);
      populateNavUser();
    }
    return data;
  }
};

// ─── Biometrics API ───────────────────────────────────────────────────────────

const Biometrics = {
  /** Get full calculated biometrics (BMI, BMR, TDEE, water target, resting HR) */
  async get() {
    return apiFetch('/profile/biometrics');
  },

  /** Update resting heart rate (manually entered) */
  async updateHR(restingHeartRate) {
    return apiFetch('/profile/biometrics', {
      method: 'PUT',
      body: JSON.stringify({ restingHeartRate })
    });
  }
};

// ─── Water / Hydration API ────────────────────────────────────────────────────

const Water = {
  /** Get today's water intake record and target */
  async getToday() {
    return apiFetch('/profile/water');
  },

  /** Log water intake (amount in ml) */
  async add(amount) {
    return apiFetch('/profile/water', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  },

  /** Reset today's water intake */
  async reset() {
    return apiFetch('/profile/water', {
      method: 'DELETE'
    });
  },

  /** Get last 7 days water history */
  async getHistory() {
    return apiFetch('/profile/water/history');
  }
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

const Dashboard = {
  /** Fetch aggregated KPIs, recent activity, and chart data with optional range ('today', 'this-week', 'this-month') */
  async get(options = {}) {
    const q = options.range ? `?range=${encodeURIComponent(options.range)}` : '';
    return apiFetch(`/dashboard${q}`);
  }
};

// ─── Live Training Calendar & Performance API ─────────────────────────────────

const Calendar = {
  /** Fetch all scheduled and completed training events for a given month/year */
  async get(month, year) {
    let q = '';
    if (month !== undefined && year !== undefined) {
      q = `?month=${month}&year=${year}`;
    }
    return apiFetch(`/calendar${q}`);
  },

  /** Fetch monthly performance tracking metrics & improvement trends */
  async getPerformance(startDate, endDate, month, year) {
    const params = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (month !== undefined) params.push(`month=${month}`);
    if (year !== undefined) params.push(`year=${year}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return apiFetch(`/calendar/performance${qs}`);
  },

  /** Schedule or record a workout on the live calendar */
  async schedule(eventData) {
    return apiFetch('/calendar', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  /** Update status or performance of a calendar day */
  async update(id, updates) {
    return apiFetch(`/calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /** Fetch real recorded activity (gym/cricket/badminton sessions) for a specific date */
  async getDay(dateStr) {
    return apiFetch(`/calendar/day?date=${encodeURIComponent(dateStr)}`);
  }
};

// ─── Standalone BMI Calculator API & Utility ──────────────────────────────────

const BMI = {
  /**
   * Independent BMI calculation formula: weight (kg) / (height (m) ^ 2)
   * Returns score, category, styling tokens, and sports health advice.
   */
  calculate(weightKg, heightCm) {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    if (!w || !h || w <= 0 || h <= 0) return null;

    const heightM = h / 100;
    const score = parseFloat((w / (heightM * heightM)).toFixed(1));

    let category = 'Normal';
    let color = '#00f59b';
    let badgeClass = 'badge-emerald';
    let description = 'Healthy weight proportionality. Great physiological baseline for athletic stamina and muscular recovery.';

    if (score < 18.5) {
      category = 'Underweight';
      color = '#00d2ff';
      badgeClass = 'badge-cyan';
      description = 'Below standard BMI range. May benefit from increased caloric density and progressive compound resistance training.';
    } else if (score < 25) {
      category = 'Normal';
      color = '#00f59b';
      badgeClass = 'badge-emerald';
      description = 'Optimal athletic range. Great balance of power-to-weight ratio for endurance and resistance disciplines.';
    } else if (score < 30) {
      category = 'Overweight';
      color = '#ff9f1a';
      badgeClass = 'badge-orange';
      description = 'Slightly elevated BMI. In active athletes, this frequently represents lean muscular hypertrophy rather than excess adipose tissue.';
    } else {
      category = 'Obese';
      color = '#ff4757';
      badgeClass = 'badge-red';
      description = 'Elevated screening value. Prioritize structured whole-food nutrition, moderate calorie management, and progressive daily aerobic activity.';
    }

    return {
      bmi: score,
      category,
      color,
      badgeClass,
      description,
      disclaimer: 'BMI is an athletic screening metric, not a clinical medical diagnosis. Athletic body composition differs by skeletal muscle proportion.'
    };
  }
};

// ─── Gym API ──────────────────────────────────────────────────────────────────

const Gym = {
  /** Get recent workout sessions (up to 20) */
  async getSessions() {
    return apiFetch('/gym');
  },

  /**
   * Log a new gym workout
   * @param {Object} workoutData
   */
  async logWorkout(workoutData) {
    return apiFetch('/gym', {
      method: 'POST',
      body: JSON.stringify(workoutData)
    });
  },

  /** Get weekly/monthly stats and PRs */
  async getStats() {
    return apiFetch('/gym/stats');
  },

  /**
   * Calculate 1RM using Epley formula
   * @param {number} weight - weight lifted (kg)
   * @param {number} reps - repetitions performed
   */
  async calculate1RM(weight, reps) {
    return apiFetch('/gym/calculate-1rm', {
      method: 'POST',
      body: JSON.stringify({ weight, reps })
    });
  },

  /** Get AI gym training recommendations */
  async getRecommendations() {
    return apiFetch('/gym/recommendations');
  },

  /**
   * Delete a workout session
   * @param {string} id - MongoDB ObjectId
   */
  async deleteWorkout(id) {
    return apiFetch(`/gym/${id}`, { method: 'DELETE' });
  }
};

// ─── Cricket API ──────────────────────────────────────────────────────────────

const Cricket = {
  async getSessions() {
    return apiFetch('/cricket');
  },

  async logSession(sessionData) {
    return apiFetch('/cricket', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },

  async getStats() {
    return apiFetch('/cricket/stats');
  },

  async getRecommendations() {
    return apiFetch('/cricket/recommendations');
  },

  async deleteSession(id) {
    return apiFetch(`/cricket/${id}`, { method: 'DELETE' });
  }
};

// ─── Badminton API ────────────────────────────────────────────────────────────

const Badminton = {
  async getSessions() {
    return apiFetch('/badminton');
  },

  async logSession(sessionData) {
    return apiFetch('/badminton', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },

  async getStats() {
    return apiFetch('/badminton/stats');
  },

  async getRecommendations() {
    return apiFetch('/badminton/recommendations');
  },

  async deleteSession(id) {
    return apiFetch(`/badminton/${id}`, { method: 'DELETE' });
  }
};

// ─── Diet API ─────────────────────────────────────────────────────────────────

const Diet = {
  /** Get current diet plan (auto-generates if none exists) */
  async getPlan() {
    return apiFetch('/diet');
  },

  /** Regenerate diet plan based on updated profile */
  async regeneratePlan(data = {}) {
    return apiFetch('/diet/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// ─── Progress API ─────────────────────────────────────────────────────────────

const ProgressAPI = {
  async getHistory() {
    return apiFetch('/progress');
  },

  async logEntry(entryData) {
    return apiFetch('/progress', {
      method: 'POST',
      body: JSON.stringify(entryData)
    });
  },

  async getChartData(days = 7) {
    return apiFetch(`/progress/chart?days=${days}`);
  }
};

// ─── Auth Guard ───────────────────────────────────────────────────────────────

/**
 * Call this at the top of any protected page.
 * Redirects to login.html if no token is found.
 */
function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

/**
 * Redirect logged-in users away from login/register pages.
 * Call on login.html and register.html.
 */
function redirectIfLoggedIn(destination = '/index.html') {
  if (Auth.isLoggedIn()) {
    window.location.href = destination;
  }
}

// ─── UI Toast Helper ──────────────────────────────────────────────────────────

/**
 * Show a brief status toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.getElementById('pf-toast');
  if (existing) existing.remove();

  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#3b82f6'
  };

  const toast = document.createElement('div');
  toast.id = 'pf-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    z-index: 99999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    animation: pfSlideIn 0.3s ease;
    max-width: 340px;
    line-height: 1.4;
  `;
  toast.textContent = message;

  // Add keyframes once
  if (!document.getElementById('pf-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'pf-toast-styles';
    style.textContent = `
      @keyframes pfSlideIn {
        from { transform: translateX(120%); opacity: 0; }
        to   { transform: translateX(0);   opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ─── Populate User Info in Navbar ─────────────────────────────────────────────

/**
 * Fills in user name, avatar, and sport badge in the existing nav/sidebar
 * using data from localStorage (no extra network call needed on page load).
 */
function populateNavUser() {
  const user = getStoredUser();
  if (!user) return;

  // Specific known IDs
  const sidebarName = document.getElementById('sidebarUserName');
  if (sidebarName) sidebarName.textContent = user.name || 'Athlete';

  const sidebarRole = document.getElementById('sidebarUserRole');
  if (sidebarRole) {
    sidebarRole.textContent = user.activityLevel ? 
      (user.activityLevel.charAt(0).toUpperCase() + user.activityLevel.slice(1) + ' Athlete') : 
      (user.fitnessGoal || 'Athlete');
  }

  const topbarName = document.getElementById('topbarUserName');
  if (topbarName) topbarName.textContent = user.name || 'Athlete';

  const topbarAvatar = document.getElementById('topbarUserAvatar');
  if (topbarAvatar && user.avatar) topbarAvatar.src = user.avatar;

  const sidebarAvatar = document.getElementById('sidebarUserAvatar');
  if (sidebarAvatar && user.avatar) sidebarAvatar.src = user.avatar;

  // User name in various places
  document.querySelectorAll('[data-user-name], .sidebar-user-name').forEach(el => {
    el.textContent = user.name || 'Athlete';
  });

  // Avatar image
  document.querySelectorAll('[data-user-avatar]').forEach(el => {
    if (user.avatar) el.src = user.avatar;
  });

  // Email
  document.querySelectorAll('[data-user-email]').forEach(el => {
    el.textContent = user.email || '';
  });

  // Sport badge
  document.querySelectorAll('[data-user-sport]').forEach(el => {
    el.textContent = user.selectedSport || 'Gym';
  });

  // Fitness goal
  document.querySelectorAll('[data-user-goal]').forEach(el => {
    el.textContent = user.fitnessGoal || 'General fitness';
  });
}

// ─── Steps & Google Fit API ───────────────────────────────────────────────────

const Steps = {
  /** Fetch real step totals (today, week, month) and Google Fit connection status */
  async getSummary() {
    return apiFetch('/steps');
  },

  /** Log daily steps manually */
  async log(stepCount, date) {
    return apiFetch('/steps/log', {
      method: 'POST',
      body: JSON.stringify({ stepCount, date })
    });
  },

  /** Get Google Fit OAuth status */
  async getGoogleStatus() {
    return apiFetch('/steps/google/status');
  },

  /** Get Google Fit Auth URL */
  async getGoogleAuthUrl() {
    return apiFetch('/steps/google/auth');
  },

  /** Trigger manual sync with Google Fit */
  async syncGoogleFit() {
    return apiFetch('/steps/google/sync', {
      method: 'POST'
    });
  }
};

// Export everything to the global window scope
// (No module bundler used — this runs in plain browser context)
window.Fitora = {
  API_BASE,
  Auth,
  Profile,
  Biometrics,
  Water,
  Dashboard,
  Calendar,
  BMI,
  Gym,
  Cricket,
  Badminton,
  Diet,
  Progress: ProgressAPI,
  Steps,
  requireAuth,
  redirectIfLoggedIn,
  showToast,
  populateNavUser,
  getStoredUser,
  setStoredUser,
  getToken,
  setToken
};
