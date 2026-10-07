/**
 * Fitora - DASHBOARD INTERACTIVE SCRIPT
 * Manages weekly activity charts, sport distribution, live activity feed & filter tabs.
 * Now fully integrated with the Fitora backend API.
 */

let weeklyActivityChart = null;
let sportSplitChart = null;

// ─── Render Recent Activity Feed ──────────────────────────────────────────────
function renderDashboardFeed(recentActivity) {
  const feedContainer = document.getElementById('dashboardRecentFeed');
  if (!feedContainer) return;

  // Merge all recent activities into one sorted list
  const items = [];

  if (recentActivity) {
    (recentActivity.gymSessions || []).forEach(s => items.push({
      sport: 'Gym', icon: 'fa-dumbbell', title: s.exercise,
      badgeClass: 'badge-emerald', calories: s.calories || 0,
      date: new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      duration: `${s.volume || 0} kg vol`, highlight: s.muscle || 'Compound'
    }));
    (recentActivity.cricketSessions || []).forEach(s => items.push({
      sport: 'Cricket', icon: 'fa-baseball-bat-ball', title: s.type || 'Match',
      badgeClass: 'badge-cyan', calories: s.calories || 0,
      date: new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      duration: `${s.distance || 0} km run`, highlight: `${s.runs || 0} runs, ${s.wickets || 0}W`
    }));
    (recentActivity.badmintonSessions || []).forEach(s => items.push({
      sport: 'Badminton', icon: 'fa-medal', title: s.type || 'Match',
      badgeClass: 'badge-purple', calories: s.calories || 0,
      date: new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      duration: `${s.duration || 0} min`, highlight: `${s.smashes || 0} smashes • ${s.result || 'Completed'}`
    }));
  }

  // Fallback: localStorage-based items ONLY for unauthenticated / offline preview
  const isLoggedIn = window.Fitora && Fitora.Auth.isLoggedIn();
  if (!isLoggedIn && items.length === 0) {
    const stored = JSON.parse(localStorage.getItem('Fitora_recent_activities') || '[]');
    stored.slice(0, 5).forEach(act => items.push(act));
  }

  if (items.length === 0) {
    feedContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <i class="fa-solid fa-person-running" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
        <p>No activities recorded yet. Log a workout to get started!</p>
      </div>
    `;
    return;
  }

  feedContainer.innerHTML = items.slice(0, 5).map(act => `
    <div class="card card-interactive" style="padding: 1.15rem; margin-bottom: 0.85rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div class="stat-icon-wrapper ${getIconClass(act.sport)}">
          <i class="fa-solid ${act.icon || 'fa-bolt'}"></i>
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
            <h4 style="font-size: 0.98rem; font-weight: 700;">${act.title}</h4>
            <span class="badge ${act.badgeClass || 'badge-emerald'}">${act.sport}</span>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary);">
            <i class="fa-regular fa-clock" style="margin-right: 0.3rem;"></i> ${act.date} • <strong>${act.duration}</strong>
          </p>
        </div>
      </div>
      <div style="text-align: right; display: flex; align-items: center; gap: 1.5rem;">
        <div>
          <span style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">${act.calories}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">KCAL</span>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary); background: var(--bg-primary); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          ${act.highlight}
        </div>
      </div>
    </div>
  `).join('');
}

function getIconClass(sport) {
  switch (sport) {
    case 'Gym':      return 'stat-icon-emerald';
    case 'Cricket':  return 'stat-icon-cyan';
    case 'Badminton': return 'stat-icon-purple';
    default:         return 'stat-icon-orange';
  }
}
window.getIconClass = getIconClass;

// ─── Update KPI Cards from Real Data ─────────────────────────────────────────
function updateKPICards(kpis, range = 'today', rangeLabel = 'Today') {
  if (!kpis) return;

  // Helper: safely set text content of an element
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  // Dynamic range-based labels
  const workoutsLabel = document.getElementById('kpiWorkoutsLabel');
  if (workoutsLabel) {
    if (range === 'today') workoutsLabel.textContent = "Today's Sessions";
    else if (range === 'this-month') workoutsLabel.textContent = "Monthly Sessions";
    else workoutsLabel.textContent = "Weekly Workouts";
  }

  const workoutsTrend = document.getElementById('kpiWorkoutsTrend');
  if (workoutsTrend) {
    workoutsTrend.textContent = rangeLabel || (range === 'today' ? 'Today' : range === 'this-month' ? 'This Month' : 'This Week');
  }

  const calLabel = document.getElementById('kpiCalLabel');
  if (calLabel) {
    if (range === 'today') calLabel.textContent = "Today's Calories Burned";
    else if (range === 'this-month') calLabel.textContent = "Monthly Calories Burned";
    else calLabel.textContent = "Weekly Calories Burned";
  }

  const durationLabel = document.getElementById('kpiDurationLabel');
  if (durationLabel) {
    if (range === 'today') durationLabel.textContent = "Active Training Today";
    else if (range === 'this-month') durationLabel.textContent = "Active Training This Month";
    else durationLabel.textContent = "Active Training This Week";
  }

  // Legacy IDs
  set('dailyCalBurnValue', kpis.dailyCaloriesBurned || 0);
  set('kpiWeekWorkouts', kpis.totalWorkouts || 0);
  set('kpiBMI', kpis.bmi || '--');
  set('kpiBMR', kpis.bmr ? kpis.bmr.toLocaleString() : '--');
  set('kpiTDEE', kpis.tdee ? kpis.tdee.toLocaleString() : '--');
  set('kpiWater', kpis.dailyWaterMl ? (kpis.dailyWaterMl / 1000).toFixed(1) + ' L' : '--');
  set('kpiRecovery', kpis.recoveryScore ? kpis.recoveryScore + '%' : '--');
  set('kpiStreak', kpis.streakDays !== undefined ? kpis.streakDays : 0);

  // New Index.html KPI Card Elements
  // 1. Calories Card
  const calEl = document.getElementById('kpiCaloriesCard');
  if (calEl) {
    const calVal = (kpis.dailyCaloriesBurned || 0).toLocaleString();
    calEl.innerHTML = `${calVal} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;">kcal</span>`;
  }
  const calGoalEl = document.getElementById('kpiCalGoalLabel');
  if (calGoalEl && kpis.targetCalories) {
    calGoalEl.textContent = `Goal: ${kpis.targetCalories.toLocaleString()} kcal`;
  }
  const pct = kpis.targetCalories
    ? Math.min(100, Math.round(((kpis.dailyCaloriesBurned || 0) / kpis.targetCalories) * 100))
    : 0;
  set('kpiCalPct', `${pct}%`);
  const calFill = document.getElementById('kpiCalProgressFill');
  if (calFill) calFill.style.width = `${pct}%`;
  const legacyBar = document.querySelector('.kpi-progress-bar .progress-fill');
  if (legacyBar) legacyBar.style.width = `${pct}%`;

  // 2. Active Training Duration Card
  const durEl = document.getElementById('kpiDurationCard');
  if (durEl) {
    if (kpis.totalDurationFormatted && kpis.totalDurationFormatted !== '0h 0m') {
      durEl.textContent = kpis.totalDurationFormatted;
    } else if (kpis.totalDurationMinutes) {
      durEl.textContent = `${Math.floor(kpis.totalDurationMinutes / 60)}h ${kpis.totalDurationMinutes % 60}m`;
    } else {
      durEl.textContent = '0h 0m';
    }
  }

  // 3. Workouts Card & BMI / Streak sublabels
  const wEl = document.getElementById('kpiWorkoutsCard');
  if (wEl) {
    const wCount = (kpis.totalWorkouts !== undefined) ? kpis.totalWorkouts : (kpis.weeklyWorkouts || 0);
    wEl.innerHTML = `${wCount} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;">sessions</span>`;
  }
  const bmiEl = document.getElementById('kpiBMILabel');
  if (bmiEl) {
    bmiEl.textContent = `BMI: ${kpis.bmi ? kpis.bmi : '--'}`;
  }
  const streakEl = document.getElementById('kpiStreakLabel');
  if (streakEl) {
    streakEl.textContent = `Streak: ${kpis.streakDays !== undefined ? kpis.streakDays : 0}d`;
  }

  // 4. Water Card & TDEE / BMR sublabels
  const waterEl = document.getElementById('kpiWaterCard');
  if (waterEl) {
    const waterL = kpis.dailyWaterMl ? (kpis.dailyWaterMl / 1000).toFixed(1) : (kpis.waterTargetMl ? (kpis.waterTargetMl / 1000).toFixed(1) : '0.0');
    waterEl.innerHTML = `${waterL} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;">L</span>`;
  }
  const tdeeEl = document.getElementById('kpiTDEELabel');
  if (tdeeEl) {
    tdeeEl.textContent = `TDEE: ${kpis.tdee ? kpis.tdee.toLocaleString() : '--'}`;
  }
  const bmrEl = document.getElementById('kpiBMRLabel');
  if (bmrEl) {
    bmrEl.textContent = `BMR: ${kpis.bmr ? kpis.bmr.toLocaleString() : '--'}`;
  }
}

window.updateKPICards = updateKPICards;

// ─── Update User Info in Sidebar ─────────────────────────────────────────────
function updateSidebarUser(user) {
  if (!user) return;
  if (window.Fitora) Fitora.populateNavUser();

  // Also update any static elements that have specific IDs in index.html
  const nameEls = document.querySelectorAll('.sidebar-user-name, #sidebarUserName');
  nameEls.forEach(el => { el.textContent = user.name || 'Athlete'; });

  const avatarEls = document.querySelectorAll('.sidebar-user-avatar, #sidebarUserAvatar');
  avatarEls.forEach(el => { if (user.avatar) el.src = user.avatar; });
}

// ─── Initialize Charts using Chart.js ────────────────────────────────────────
function initDashboardCharts(chartData, sportSplit) {
  const weeklyCanvas = document.getElementById('weeklyBurnChart');
  const sportCanvas  = document.getElementById('sportSplitChart');

  if (window.Chart) {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";
  }

  // Build labels and data from real API data
  let labels   = (chartData && chartData.labels) ? chartData.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let calories = (chartData && chartData.calories) ? chartData.calories : [0, 0, 0, 0, 0, 0, 0];
  let minutes  = (chartData && chartData.minutes) ? chartData.minutes : [0, 0, 0, 0, 0, 0, 0];

  // Weekly Activity Bar & Line Chart
  if (weeklyCanvas && window.Chart) {
    if (weeklyActivityChart) {
      weeklyActivityChart.data.labels = labels;
      weeklyActivityChart.data.datasets[0].data = calories;
      weeklyActivityChart.data.datasets[1].data = minutes;
      weeklyActivityChart.update();
    } else {
      const ctx = weeklyCanvas.getContext('2d');
      weeklyActivityChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Calories Burned (kcal)',
              data: calories,
              backgroundColor: 'rgba(0, 245, 155, 0.6)',
              borderColor: '#00f59b',
              borderWidth: 1.5,
              borderRadius: 6,
              yAxisID: 'y'
            },
            {
              label: 'Active Minutes',
              data: minutes,
              type: 'line',
              borderColor: '#00d2ff',
              backgroundColor: 'rgba(0, 210, 255, 0.1)',
              borderWidth: 3,
              tension: 0.35,
              pointBackgroundColor: '#00d2ff',
              pointRadius: 4,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } },
            tooltip: {
              backgroundColor: '#141c2c',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              padding: 10
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            y: {
              type: 'linear', display: true, position: 'left',
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              title: { display: true, text: 'Calories (kcal)', color: '#64748b' }
            },
            y1: {
              type: 'linear', display: true, position: 'right',
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Active Minutes', color: '#64748b' }
            }
          }
        }
      });
    }
  }

  // Sports Split Doughnut Chart
  if (sportCanvas && window.Chart) {
    const gymVal = (sportSplit && sportSplit.gym) || 0;
    const crickVal = (sportSplit && sportSplit.cricket) || 0;
    const badmVal = (sportSplit && sportSplit.badminton) || 0;
    const hasData = (gymVal + crickVal + badmVal) > 0;

    const sLabels = hasData ? ['Gym & Weights', 'Cricket', 'Badminton'] : ['No Activities Logged'];
    const sData = hasData ? [gymVal, crickVal, badmVal] : [100];
    const sColors = hasData ? ['#00f59b', '#00d2ff', '#a855f7'] : ['rgba(255, 255, 255, 0.08)'];

    if (sportSplitChart) {
      sportSplitChart.data.labels = sLabels;
      sportSplitChart.data.datasets[0].data = sData;
      sportSplitChart.data.datasets[0].backgroundColor = sColors;
      sportSplitChart.update();
    } else {
      const ctxSport = sportCanvas.getContext('2d');
      sportSplitChart = new Chart(ctxSport, {
        type: 'doughnut',
        data: {
          labels: sLabels,
          datasets: [{
            data: sData,
            backgroundColor: sColors,
            borderColor: '#141c2c',
            borderWidth: 4,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 16, boxWidth: 12, usePointStyle: true } },
            tooltip: {
              backgroundColor: '#141c2c',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  return hasData ? ` ${context.label}: ${context.raw}%` : ' Log a session to see sports distribution';
                }
              }
            }
          },
          cutout: '70%'
        }
      });
    }
  }
}

// ─── Main Dashboard Load ──────────────────────────────────────────────────────
async function loadDashboardData(range) {
  // Auth guard
  if (window.Fitora && !Fitora.Auth.isLoggedIn()) {
    window.location.href = 'landing.html';
    return;
  }

  // Populate user info immediately from cache (instant UX)
  if (window.Fitora) Fitora.populateNavUser();

  if (!range) {
    const activePill = document.querySelector('.time-filter-pill.active');
    range = activePill ? activePill.getAttribute('data-range') : 'today';
  }

  try {
    const data = await Fitora.Dashboard.get({ range });
    if (data.success) {
      updateKPICards(data.kpis, data.range, data.rangeLabel);
      renderDashboardFeed(data.recentActivity);
      updateSidebarUser(data.user);

      initDashboardCharts(data.chartData, data.sportSplit);
    }
  } catch (err) {
    console.warn('Dashboard API error:', err.message);
    renderDashboardFeed(null);
    initDashboardCharts(null, null);
  }

  // Load real steps data (Today, Week, Month, Google Fit state)
  await loadStepsData();
}

// ─── Steps Tracking & Google Fit Integration ─────────────────────────────────
async function loadStepsData() {
  const todayEl = document.getElementById('stepMetricToday');
  const weekEl = document.getElementById('stepMetricWeek');
  const monthEl = document.getElementById('stepMetricMonth');
  if (!todayEl && !weekEl && !monthEl) return;

  try {
    if (window.Fitora && Fitora.Auth.isLoggedIn()) {
      const res = await Fitora.Steps.getSummary();
      if (res && res.success) {
        if (todayEl) {
          todayEl.innerHTML = `${(res.todaySteps || 0).toLocaleString()} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">steps</span>`;
        }
        if (weekEl) {
          weekEl.innerHTML = `${(res.weeklySteps || 0).toLocaleString()} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">steps</span>`;
        }
        if (monthEl) {
          monthEl.innerHTML = `${(res.monthlySteps || 0).toLocaleString()} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">steps</span>`;
        }

        // Update Google Fit connection button state
        const googleBtn = document.getElementById('googleFitConnectBtn');
        const googleText = document.getElementById('googleFitBtnText');
        if (googleBtn && googleText) {
          if (res.googleFit && res.googleFit.connected) {
            googleText.textContent = 'Sync Google Fit';
            googleBtn.className = 'btn btn-sm btn-emerald';
            googleBtn.title = 'Google Fit Connected • Click to sync latest steps';
          } else {
            googleText.textContent = 'Connect Google Fit';
            googleBtn.className = 'btn btn-sm btn-primary';
            googleBtn.title = 'Connect with Google Fit';
          }
        }
      }
    }
  } catch (err) {
    console.warn('Steps load error:', err.message);
  }
}
window.loadStepsData = loadStepsData;

// Open manual step logging modal
function openLogStepsModal() {
  const countInput = document.getElementById('manualStepCount');
  const dateInput = document.getElementById('manualStepDate');
  if (countInput) countInput.value = '';
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
  if (typeof openModal === 'function') {
    openModal('logStepsModal');
  } else {
    const modal = document.getElementById('logStepsModal');
    if (modal) modal.classList.add('open');
  }
}
window.openLogStepsModal = openLogStepsModal;

// Handle Google Fit connect / sync button click
async function handleGoogleFitAction() {
  try {
    let statusRes = null;
    try {
      if (window.Fitora && Fitora.Steps) {
        statusRes = await Fitora.Steps.getGoogleStatus();
      }
    } catch (_) {}

    if (!statusRes || !statusRes.success) {
      statusRes = { success: true, configured: false, connected: false };
    }

    // If already connected -> trigger real sync
    if (statusRes.connected) {
      if (!window.Fitora || !Fitora.Auth.isLoggedIn()) {
        if (window.showToast) showToast('Please sign in to sync Google Fit', 'warning');
        return;
      }
      if (window.showToast) showToast('Syncing latest step data from Google Fitness API...', 'info');
      const syncRes = await Fitora.Steps.syncGoogleFit();
      if (syncRes && syncRes.success) {
        if (window.showToast) showToast(syncRes.message || 'Steps successfully synced from Google Fit!', 'success');
        await loadStepsData();
      } else {
        if (window.showToast) showToast((syncRes && syncRes.message) || 'Failed to sync Google Fit steps', 'error');
      }
      return;
    }

    // If not connected, check if Google Cloud credentials are configured in .env
    const modalContent = document.getElementById('googleFitModalContent');
    const actionBtn = document.getElementById('googleFitModalActionBtn');

    if (statusRes.configured) {
      // Credentials are fully set in .env! Show connect button
      if (modalContent) {
        modalContent.innerHTML = `
          <div style="text-align: center; padding: 1rem 0;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(59, 130, 246, 0.1); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
              <i class="fa-brands fa-google" style="font-size: 1.75rem; color: var(--primary);"></i>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;">Connect Official Google Fit</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.25rem;">
              Authorize Fitora to securely read your daily step counts from Google Fitness API using standard OAuth 2.0. No fake data will ever be used.
            </p>
            <div style="background: var(--bg-surface-elevated); padding: 0.85rem 1rem; border-radius: var(--radius-sm); font-size: 0.82rem; text-align: left; color: var(--text-secondary);">
              <div style="font-weight: 600; margin-bottom: 0.3rem; color: var(--text-primary);"><i class="fa-solid fa-shield-halved" style="color: var(--accent-emerald);"></i> Secure Authorization:</div>
              <div>• Scope: <code>https://www.googleapis.com/auth/fitness.activity.read</code></div>
              <div>• Syncs real step totals for today, this week, and this month</div>
            </div>
          </div>
        `;
      }
      if (actionBtn) {
        actionBtn.style.display = 'inline-flex';
        actionBtn.innerHTML = '<i class="fa-brands fa-google"></i> Connect Now';
        actionBtn.onclick = async () => {
          await initiateGoogleFitAuth();
        };
      }
    } else {
      // Credentials not yet configured in .env -> display clear guide without fake data
      if (modalContent) {
        modalContent.innerHTML = `
          <div style="padding: 0.5rem 0;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fa-solid fa-key" style="color: #f59e0b; font-size: 1.2rem;"></i>
              </div>
              <div>
                <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700;">Google Cloud OAuth Setup</h4>
                <p style="margin: 0; font-size: 0.82rem; color: var(--text-muted);">Real API integration configured • Awaiting API credentials</p>
              </div>
            </div>

            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem; font-size: 0.83rem; line-height: 1.55;">
              <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: var(--text-primary);">
                To connect live Google Health & Fit data without mock values, configure your Google Cloud Console credentials:
              </p>
              <ol style="margin: 0; padding-left: 1.25rem; color: var(--text-secondary);">
                <li>Open <a href="https://console.cloud.google.com/apis/library/fitness.googleapis.com" target="_blank" style="color: var(--primary); text-decoration: underline;">Google Cloud Console</a> and enable the <strong>Fitness API</strong>.</li>
                <li>Go to <strong>APIs & Services &gt; Credentials</strong> and create an <strong>OAuth 2.0 Client ID</strong> (Web application).</li>
                <li>Add Authorized Redirect URI: <code style="background: var(--bg-primary); padding: 0.15rem 0.35rem; border-radius: 4px;">http://localhost:5000/api/steps/google/callback</code></li>
                <li>Add the keys to your project's <code style="background: var(--bg-primary); padding: 0.15rem 0.35rem; border-radius: 4px;">.env</code> file:
                  <pre style="margin-top: 0.5rem; background: var(--bg-primary); padding: 0.6rem; border-radius: 4px; overflow-x: auto; color: var(--accent-cyan); font-family: monospace;">GOOGLE_FIT_CLIENT_ID=your_client_id.apps.googleusercontent.com&#10;GOOGLE_FIT_CLIENT_SECRET=your_client_secret</pre>
                </li>
              </ol>
            </div>

            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.82rem; color: var(--text-secondary);">
              <i class="fa-solid fa-circle-check" style="color: var(--accent-emerald); margin-right: 0.35rem;"></i>
              <strong>Manual Step Tracking Active:</strong> You can log your exact daily steps right now using the <strong>Log Steps</strong> button. All calculations (Today, Weekly, Monthly) are live and authentic!
            </div>
          </div>
        `;
      }
      if (actionBtn) {
        actionBtn.style.display = 'none';
      }
    }

    if (typeof openModal === 'function') {
      openModal('googleFitModal');
    } else {
      const m = document.getElementById('googleFitModal');
      if (m) m.classList.add('open');
    }
  } catch (err) {
    console.error('Google Fit Action error:', err);
    if (window.showToast) showToast(err.message || 'Error checking Google Fit connection', 'error');
  }
}
window.handleGoogleFitAction = handleGoogleFitAction;

// Initiate Google Fit OAuth flow
async function initiateGoogleFitAuth() {
  try {
    if (!window.Fitora || !Fitora.Auth.isLoggedIn()) {
      if (window.showToast) showToast('Please sign in to connect Google Fit', 'warning');
      return;
    }
    const authRes = await Fitora.Steps.getGoogleAuthUrl();
    if (authRes && authRes.authUrl) {
      window.location.href = authRes.authUrl;
    } else {
      if (window.showToast) showToast((authRes && authRes.message) || 'Failed to start Google OAuth flow', 'error');
    }
  } catch (err) {
    if (window.showToast) showToast(err.message || 'OAuth error', 'error');
  }
}
window.initiateGoogleFitAuth = initiateGoogleFitAuth;

// Make refresh accessible globally and refresh both dashboard and steps
window.refreshDashboardFeed = async () => {
  await loadDashboardData();
};

// ─── Biometrics & Heart Modal Logic ───────────────────────────────────────────
async function openBiometricsModal() {
  if (typeof openModal === 'function') {
    openModal('biometricsModal');
  }

  try {
    let bioData = null;
    let profData = null;

    if (window.Fitora && Fitora.Auth.isLoggedIn()) {
      const [bRes, pRes] = await Promise.all([
        Fitora.Biometrics.get().catch(() => null),
        Fitora.Profile.get().catch(() => null)
      ]);
      bioData = bRes && bRes.biometrics;
      profData = pRes && pRes.profile;
    }

    // Fall back to stored user if offline or unauthenticated
    const user = profData || (window.Fitora ? Fitora.getStoredUser() : null) || {};

    const bmi = (bioData && bioData.bmi) || (user.height && user.weight ? ((user.weight / ((user.height / 100) ** 2)).toFixed(1)) : '--');
    const category = (bioData && bioData.bmiCategory) || (bmi !== '--' ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : 'Normal');
    const bmr = (bioData && bioData.bmr) || (user.height && user.weight ? Math.round(10 * user.weight + 6.25 * user.height - 5 * (user.age || 24) + 5) : '--');
    const tdee = (bioData && bioData.tdee) || (bmr !== '--' ? Math.round(bmr * 1.55) : '--');
    const water = (bioData && bioData.dailyWaterMl ? (bioData.dailyWaterMl / 1000).toFixed(1) : (user.weight ? (user.weight * 0.035).toFixed(1) : '--'));

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('bioBmiVal', bmi);
    setVal('bioBmrVal', bmr ? bmr.toLocaleString() : '--');
    setVal('bioTdeeVal', tdee ? tdee.toLocaleString() : '--');
    setVal('bioWaterVal', water);

    const catEl = document.getElementById('bioBmiCategory');
    if (catEl) {
      catEl.textContent = category;
      catEl.className = `badge ${category === 'Normal' ? 'badge-emerald' : category === 'Underweight' ? 'badge-cyan' : 'badge-orange'}`;
    }

    const hr = (bioData && bioData.restingHeartRate) || user.restingHeartRate || 72;
    const hrInput = document.getElementById('bioHeartRateInput');
    if (hrInput) hrInput.value = hr;

    // Fill profile fields
    if (document.getElementById('bioHeight')) document.getElementById('bioHeight').value = user.height || 175;
    if (document.getElementById('bioWeight')) document.getElementById('bioWeight').value = user.weight || 72;
    if (document.getElementById('bioAge')) document.getElementById('bioAge').value = user.age || 24;
    if (document.getElementById('bioGender')) document.getElementById('bioGender').value = user.gender || 'Male';
    if (document.getElementById('bioActivityLevel')) document.getElementById('bioActivityLevel').value = user.activityLevel || 'Moderately Active';
    if (document.getElementById('bioFitnessGoal')) document.getElementById('bioFitnessGoal').value = user.fitnessGoal || 'Sports performance';
  } catch (err) {
    console.warn('Failed to load biometrics:', err);
  }
}

// ─── Streak Modal Logic ───────────────────────────────────────────────────────
function openStreakModal() {
  if (typeof openModal === 'function') {
    openModal('streakModal');
  }
  const user = (window.Fitora && Fitora.getStoredUser()) || {};
  const days = user.streakDays || 0;
  const daysEl = document.getElementById('streakModalDays');
  if (daysEl) daysEl.textContent = `${days} Days`;
  const badgeEl = document.getElementById('sidebarStreakBadge');
  if (badgeEl) badgeEl.textContent = `🔥 ${days}d`;
}

window.openBiometricsModal = openBiometricsModal;
window.openStreakModal = openStreakModal;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();

  // Save Resting Heart Rate
  const saveHrBtn = document.getElementById('saveHeartRateBtn');
  if (saveHrBtn) {
    saveHrBtn.addEventListener('click', async () => {
      const input = document.getElementById('bioHeartRateInput');
      const hr = parseInt(input.value);
      if (isNaN(hr) || hr < 30 || hr > 200) {
        if (window.showToast) showToast('Resting heart rate must be between 30 and 200 bpm', 'error');
        return;
      }
      try {
        if (window.Fitora && Fitora.Auth.isLoggedIn()) {
          await Fitora.Biometrics.updateHR(hr);
        }
        const user = (window.Fitora && Fitora.getStoredUser()) || {};
        user.restingHeartRate = hr;
        if (window.Fitora) localStorage.setItem('Fitora_user', JSON.stringify(user));
        if (window.showToast) showToast(`Resting heart rate saved: ${hr} bpm`, 'success');
      } catch (err) {
        if (window.showToast) showToast(err.message || 'Failed to save heart rate', 'error');
      }
    });
  }

  // Save Body Profile form
  const bioForm = document.getElementById('bioProfileForm');
  if (bioForm) {
    bioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const height = parseFloat(document.getElementById('bioHeight').value);
      const weight = parseFloat(document.getElementById('bioWeight').value);
      const age = parseInt(document.getElementById('bioAge').value);
      const gender = document.getElementById('bioGender').value;
      const activityLevel = document.getElementById('bioActivityLevel').value;
      const fitnessGoal = document.getElementById('bioFitnessGoal').value;

      try {
        if (window.Fitora && Fitora.Auth.isLoggedIn()) {
          const res = await Fitora.Profile.update({
            height,
            weight,
            age,
            gender,
            activityLevel,
            fitnessGoal
          });
          if (res && res.biometrics) {
            document.getElementById('bioBmiVal').textContent = res.biometrics.bmi;
            document.getElementById('bioBmiCategory').textContent = res.biometrics.bmiCategory;
            document.getElementById('bioBmrVal').textContent = res.biometrics.bmr.toLocaleString();
            document.getElementById('bioTdeeVal').textContent = res.biometrics.tdee.toLocaleString();
            document.getElementById('bioWaterVal').textContent = (res.biometrics.dailyWaterMl / 1000).toFixed(1);
          }
          await loadDashboardData();
        } else {
          const user = (window.Fitora && Fitora.getStoredUser()) || {};
          Object.assign(user, { height, weight, age, gender, activityLevel, fitnessGoal });
          localStorage.setItem('Fitora_user', JSON.stringify(user));
          openBiometricsModal();
        }

        if (window.showToast) showToast('Athlete body profile & biometrics successfully updated!', 'success');
      } catch (err) {
        if (window.showToast) showToast(err.message || 'Failed to update body profile', 'error');
      }
    });
  }

  // Time Range Filters (Today / This Week / This Month)
  const timePills = document.querySelectorAll('.time-filter-pill');
  timePills.forEach(pill => {
    pill.addEventListener('click', async () => {
      timePills.forEach(p => {
        p.classList.remove('active');
        p.classList.remove('btn-primary');
        p.classList.add('btn-ghost');
      });
      pill.classList.add('active');
      pill.classList.remove('btn-ghost');
      pill.classList.add('btn-primary');
      const range = pill.getAttribute('data-range');
      if (window.showToast) showToast(`View updated for ${range.replace('-', ' ')}`, 'info');

      // Call API for real range data
      try {
        if (window.Fitora) {
          const data = await Fitora.Dashboard.get({ range });
          if (data && data.success) {
            if (typeof updateKPICards === 'function') updateKPICards(data.kpis, data.range, data.rangeLabel);
            if (typeof renderDashboardFeed === 'function') renderDashboardFeed(data.recentActivity);
            if (data.chartData && weeklyActivityChart) {
              weeklyActivityChart.data.labels = data.chartData.labels;
              weeklyActivityChart.data.datasets[0].data = data.chartData.calories;
              weeklyActivityChart.data.datasets[1].data = data.chartData.minutes;
              weeklyActivityChart.update();
            }
          }
        }
      } catch (err) {
        console.warn('Dashboard range fetch:', err);
      }
    });
  });

  // Handle Log Steps Form submission
  const logStepsForm = document.getElementById('logStepsForm');
  if (logStepsForm) {
    logStepsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const countInput = document.getElementById('manualStepCount');
      const dateInput = document.getElementById('manualStepDate');
      const stepCount = parseInt(countInput ? countInput.value : 0, 10);
      const stepDate = dateInput ? dateInput.value : undefined;

      if (!stepCount || stepCount < 0) {
        if (window.showToast) showToast('Please enter a valid step count', 'warning');
        return;
      }

      const saveBtn = document.getElementById('saveStepsBtn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
      }

      try {
        if (window.Fitora && Fitora.Auth.isLoggedIn()) {
          const res = await Fitora.Steps.log(stepCount, stepDate);
          if (res && res.success) {
            if (window.showToast) showToast(`${stepCount.toLocaleString()} steps saved successfully!`, 'success');
            if (typeof closeModal === 'function') closeModal('logStepsModal');
            await loadStepsData();
          } else {
            if (window.showToast) showToast((res && res.message) || 'Failed to save steps', 'error');
          }
        } else {
          if (window.showToast) showToast('Please sign in to save your daily steps to the database.', 'warning');
        }
      } catch (err) {
        if (window.showToast) showToast(err.message || 'Error saving steps', 'error');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Steps';
        }
      }
    });
  }

  // Handle Google OAuth login query params (?token=...&provider=google)
  if (urlParams.get('token')) {
    const oauthToken = urlParams.get('token');
    if (window.Fitora && typeof Fitora.setToken === 'function') {
      Fitora.setToken(oauthToken);
    } else {
      localStorage.setItem('Fitora_token', oauthToken);
    }
    // Remove token from browser URL immediately so it is not left visible
    window.history.replaceState({}, document.title, window.location.pathname);
    // Restore user details via /api/auth/me
    if (window.Fitora && Fitora.Auth && typeof Fitora.Auth.getMe === 'function') {
      Fitora.Auth.getMe().then(res => {
        if (res && res.user) {
          Fitora.setStoredUser(res.user);
          if (typeof Fitora.populateNavUser === 'function') {
            Fitora.populateNavUser();
          }
          if (window.showToast) {
            showToast(`Welcome, ${res.user.name || 'Athlete'}! Signed in with Google. 💪`, 'success');
          }
        }
      }).catch(err => console.warn('OAuth getMe warning:', err));
    }
  }

  // Handle Google Fit OAuth redirect query params
  if (urlParams.get('googleFit') === 'connected') {
    if (window.showToast) showToast('Google Fit connected successfully! Steps synced.', 'success');
    window.history.replaceState({}, document.title, window.location.pathname);
    loadStepsData();
  } else if (urlParams.get('googleFitError')) {
    const errorMsg = urlParams.get('googleFitError');
    if (window.showToast) showToast('Google Fit connection: ' + decodeURIComponent(errorMsg), 'error');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
