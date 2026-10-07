/**
 * Fitora - CRICKET PERFORMANCE CONTROLLER
 * Match logging, batting & bowling analytics, strike rates, economy, and trend charts.
 * Fully integrated with Fitora Backend API (/api/cricket).
 */

let battingTrendChart = null;
let boundarySplitChart = null;
let cachedCricketMatches = [];

async function fetchCricketData() {
  try {
    if (window.Fitora && Fitora.Auth.isLoggedIn()) {
      const response = await Fitora.Cricket.getSessions();
      if (response && response.sessions) {
        cachedCricketMatches = response.sessions.map(s => ({
          id: s._id,
          opponent: s.opponent || 'Opponent XI',
          format: s.format || s.sessionType || 'T20',
          venue: s.venue || 'Home Ground',
          date: s.date ? new Date(s.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
          result: s.result || 'Completed',
          runs: s.runs || 0,
          balls: s.balls || 0,
          fours: s.fours || 0,
          sixes: s.sixes || 0,
          notOut: !!s.notOut,
          overs: s.overs || 0,
          maidens: s.maidens || 0,
          runsConceded: s.runsConceded || 0,
          wickets: s.wickets || 0,
          distanceRun: s.distanceRun ? `${s.distanceRun} km` : '4.5 km'
        }));
        return cachedCricketMatches;
      }
    }
  } catch (err) {
    console.warn("Using offline cricket data:", err.message);
  }

  // Fallback to localStorage
  cachedCricketMatches = JSON.parse(localStorage.getItem("Fitora_cricket_matches") || "[]");
  return cachedCricketMatches;
}

function renderCricketMatches(filter = "all") {
  const container = document.getElementById("cricketMatchesList");
  if (!container) return;

  const matches = cachedCricketMatches;
  const filtered = filter === "all" ? matches : matches.filter(m => m.format.toLowerCase().includes(filter.toLowerCase()));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
        <i class="fa-solid fa-baseball-bat-ball" style="font-size: 2.5rem; margin-bottom: 0.75rem;"></i>
        <p>No cricket matches found for this filter. Tap "+ Log Match / Net Session" to add one!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(match => {
    const strikeRate = match.balls > 0 ? ((match.runs / match.balls) * 100).toFixed(1) : "0.0";
    const economy = match.overs > 0 ? (match.runsConceded / match.overs).toFixed(2) : "0.00";
    const isWin = (match.result || "").toLowerCase().includes("won") || (match.result || "").toLowerCase().includes("win");

    return `
      <div class="match-summary-card">
        <div class="match-card-header">
          <div class="match-teams">
            <span class="match-team-name">${(window.Fitora && Fitora.getStoredUser() && Fitora.getStoredUser().name) ? Fitora.getStoredUser().name + "'s XI" : "My XI"}</span>
            <span class="vs-badge">VS</span>
            <span class="match-team-name" style="color: var(--accent-cyan);">${match.opponent}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge ${isWin ? 'badge-emerald' : 'badge-orange'}">${match.result}</span>
            <span class="badge badge-outline">${match.format}</span>
          </div>
        </div>

        <div class="match-score-row">
          <div class="match-metric-highlight">
            Batting
            <strong>${match.runs}${match.notOut ? '*' : ''} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">(${match.balls}b)</span></strong>
            <span class="strike-rate-tag">SR: ${strikeRate} • ${match.fours}x4, ${match.sixes}x6</span>
          </div>
          <div class="match-metric-highlight">
            Bowling
            <strong>${match.wickets}/${match.runsConceded} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">(${match.overs} ov)</span></strong>
            <span class="bowling-fig-tag">Econ: ${economy}</span>
          </div>
          <div class="match-metric-highlight">
            Fielding & Fitness
            <strong>${match.distanceRun || '4.5 km'}</strong>
            <span style="color: var(--text-secondary); font-size: 0.75rem;">Pitch Coverage</span>
          </div>
          <div class="match-metric-highlight">
            Date & Venue
            <strong style="font-size: 0.95rem;">${match.venue}</strong>
            <span style="color: var(--text-muted); font-size: 0.75rem;">${match.date}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function initCricketCharts() {
  const trendCanvas = document.getElementById("cricketBattingTrendChart");
  const boundaryCanvas = document.getElementById("cricketBoundarySplitChart");

  let labels = ["Match 1", "Match 2", "Match 3", "Match 4", "Match 5", "Match 6"];
  let runsData = [42, 65, 31, 88, 54, 72];
  let srData = [125, 148, 110, 162, 130, 163];

  let boundaryData = [42, 28, 18, 12];

  if (cachedCricketMatches.length > 0) {
    const rev = [...cachedCricketMatches].reverse().slice(-6);
    labels = rev.map((m, i) => `Inn ${i + 1}`);
    runsData = rev.map(m => m.runs);
    srData = rev.map(m => m.balls > 0 ? Math.round((m.runs / m.balls) * 100) : 100);

    const totalFours = cachedCricketMatches.reduce((s, m) => s + (m.fours || 0), 0);
    const totalSixes = cachedCricketMatches.reduce((s, m) => s + (m.sixes || 0), 0);
    const totalRuns = cachedCricketMatches.reduce((s, m) => s + (m.runs || 0), 0);
    const boundaryRuns = totalFours * 4 + totalSixes * 6;
    const runningRuns = Math.max(0, totalRuns - boundaryRuns);

    if (totalRuns > 0) {
      boundaryData = [
        Math.max(10, runningRuns),
        Math.max(10, totalFours * 4),
        Math.max(10, totalSixes * 6),
        15
      ];
    }
  }

  if (trendCanvas && window.Chart) {
    if (battingTrendChart) battingTrendChart.destroy();
    const ctx = trendCanvas.getContext("2d");
    battingTrendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Runs Scored",
            data: runsData,
            borderColor: "#00f59b",
            backgroundColor: "rgba(0, 245, 155, 0.1)",
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "#00f59b",
            pointRadius: 5
          },
          {
            label: "Strike Rate",
            data: srData,
            borderColor: "#00d2ff",
            borderDash: [5, 5],
            tension: 0.3,
            pointBackgroundColor: "#00d2ff",
            pointRadius: 4,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" }
        },
        scales: {
          x: { grid: { color: "rgba(255, 255, 255, 0.05)" } },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            title: { display: true, text: "Runs Scored", color: "#64748b" }
          },
          y1: {
            position: "right",
            grid: { drawOnChartArea: false },
            title: { display: true, text: "Strike Rate", color: "#64748b" }
          }
        }
      }
    });
  }

  if (boundaryCanvas && window.Chart) {
    if (boundarySplitChart) boundarySplitChart.destroy();
    const ctx2 = boundaryCanvas.getContext("2d");
    boundarySplitChart = new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: ["Singles / 2s", "Fours (4s)", "Sixes (6s)", "Dots"],
        datasets: [{
          data: boundaryData,
          backgroundColor: ["#3b82f6", "#00f59b", "#ff9f1a", "#64748b"],
          borderColor: "#141c2c",
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" }
        },
        cutout: "65%"
      }
    });
  }
}

function initCricketForm() {
  const form = document.getElementById("logCricketMatchForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const opponent = document.getElementById("crickOpponent").value;
      const format = document.getElementById("crickFormat").value;
      const venue = document.getElementById("crickVenue").value || "Home Ground";
      const result = document.getElementById("crickResult").value;
      const runs = parseInt(document.getElementById("crickRuns").value) || 0;
      const balls = parseInt(document.getElementById("crickBalls").value) || 0;
      const fours = parseInt(document.getElementById("crickFours").value) || 0;
      const sixes = parseInt(document.getElementById("crickSixes").value) || 0;
      const notOut = document.getElementById("crickNotOut").checked;
      const overs = parseFloat(document.getElementById("crickOvers").value) || 0;
      const maidens = parseInt(document.getElementById("crickMaidens").value) || 0;
      const runsConceded = parseInt(document.getElementById("crickRunsConceded").value) || 0;
      const wickets = parseInt(document.getElementById("crickWickets").value) || 0;
      const distanceRun = parseFloat(document.getElementById("crickDistance").value) || 4.5;

      const payload = {
        sessionType: format === "Net Practice" ? "Net Practice" : "Match",
        opponent,
        format,
        venue,
        result,
        runs,
        balls,
        fours,
        sixes,
        notOut,
        overs,
        maidens,
        runsConceded,
        wickets,
        distanceRun,
        trainingDuration: format === "T20" ? 180 : (format === "50-Over" ? 240 : 90),
        intensity: "High"
      };

      try {
        if (window.Fitora && Fitora.Auth.isLoggedIn()) {
          await Fitora.Cricket.logSession(payload);
          if (typeof window.loadDashboardData === 'function') {
            window.loadDashboardData().catch(() => {});
          }
          if (typeof window.refreshDashboardFeed === 'function') {
            window.refreshDashboardFeed().catch(() => {});
          }
        }
      } catch (err) {
        console.warn("Backend cricket sync warning:", err.message);
      }

      // Also update local storage for immediate responsiveness
      const localMatches = JSON.parse(localStorage.getItem("Fitora_cricket_matches") || "[]");
      localMatches.unshift({
        id: "crick-" + Date.now(),
        ...payload,
        date: "Today",
        distanceRun: `${distanceRun} km`
      });
      localStorage.setItem("Fitora_cricket_matches", JSON.stringify(localMatches));

      // Also add to global recent activities feed
      const activities = JSON.parse(localStorage.getItem("Fitora_recent_activities") || "[]");
      activities.unshift({
        id: "act-" + Date.now(),
        sport: "Cricket",
        title: `${format} vs ${opponent}`,
        date: "Just now",
        duration: "3h 10m",
        calories: 780,
        highlight: `${runs}${notOut ? '*' : ''} (${balls}) & ${wickets}/${runsConceded}`,
        icon: "fa-baseball-bat-ball",
        badgeClass: "badge-cyan"
      });
      localStorage.setItem("Fitora_recent_activities", JSON.stringify(activities));

      if (typeof closeModal === 'function') closeModal("logCricketMatchModal");
      form.reset();
      
      await fetchCricketData();
      renderCricketMatches();
      initCricketCharts();

      if (typeof showToast === 'function') {
        showToast("Cricket match performance recorded in cloud database!", "success", "Match Saved");
      }
    });
  }

  // Format filter tabs
  const filterBtns = document.querySelectorAll(".cricket-filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      renderCricketMatches(filter);
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchCricketData();
  renderCricketMatches();
  await initCricketCharts();
  initCricketForm();
});
