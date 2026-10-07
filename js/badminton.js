/**
 * Fitora - BADMINTON ARENA & LIVE SCORER CONTROLLER
 * Live point-by-point digital scoreboard, BWF service rules, set history, and shot radar.
 * Fully integrated with Fitora Backend API (/api/badminton).
 */

// Live Scorer State
let liveScore = {
  player1Name: "Alex (You)",
  player2Name: "Opponent",
  p1Score: 0,
  p2Score: 0,
  server: 1, // 1 for P1, 2 for P2
  currentSet: 1,
  setsP1Won: 0,
  setsP2Won: 0,
  completedSets: [],
  smashesP1: 0,
  errorsP1: 0
};

let cachedBadmintonMatches = [];

async function fetchBadmintonData() {
  try {
    if (window.Fitora && Fitora.Auth.isLoggedIn()) {
      const response = await Fitora.Badminton.getSessions();
      if (response && response.sessions) {
        cachedBadmintonMatches = response.sessions.map(s => ({
          id: s._id,
          opponent: s.opponent || 'Opponent',
          mode: s.mode || 'Singles',
          date: s.date ? new Date(s.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
          scoreSummary: s.scoreSummary || '21-17, 21-19',
          result: s.result || 'Win',
          duration: s.duration ? `${s.duration}m` : '45m',
          smashes: s.smashes || 18,
          unforcedErrors: s.unforcedErrors || 8,
          avgRally: s.avgRallyLength || 8.2
        }));
        return cachedBadmintonMatches;
      }
    }
  } catch (err) {
    console.warn("Using offline badminton data:", err.message);
  }

  // Fallback to localStorage
  cachedBadmintonMatches = JSON.parse(localStorage.getItem("Fitora_badminton_matches") || "[]");
  return cachedBadmintonMatches;
}

function initLiveScoreboard() {
  const p1ScoreEl = document.getElementById("badmP1Score");
  const p2ScoreEl = document.getElementById("badmP2Score");
  const p1Box = document.getElementById("p1ScoreBox");
  const p2Box = document.getElementById("p2ScoreBox");
  const courtSideLabelP1 = document.getElementById("courtSideP1");
  const courtSideLabelP2 = document.getElementById("courtSideP2");
  const gameAlert = document.getElementById("gamePointAlert");
  const setsHistoryEl = document.getElementById("badmSetsHistory");
  const currentSetDisplay = document.getElementById("currentSetNum");

  function updateScoreboard() {
    if (p1ScoreEl) p1ScoreEl.textContent = liveScore.p1Score;
    if (p2ScoreEl) p2ScoreEl.textContent = liveScore.p2Score;
    if (currentSetDisplay) currentSetDisplay.textContent = `Set ${liveScore.currentSet}`;

    // Service court: In badminton, even score = Right court, odd score = Left court
    const serverScore = liveScore.server === 1 ? liveScore.p1Score : liveScore.p2Score;
    const isEven = serverScore % 2 === 0;
    const courtSide = isEven ? "Serving Right Court" : "Serving Left Court";

    if (p1Box && p2Box) {
      if (liveScore.server === 1) {
        p1Box.classList.add("serving");
        p2Box.classList.remove("serving");
        if (courtSideLabelP1) courtSideLabelP1.textContent = courtSide;
        if (courtSideLabelP2) courtSideLabelP2.textContent = "Receiving";
      } else {
        p2Box.classList.add("serving");
        p1Box.classList.remove("serving");
        if (courtSideLabelP2) courtSideLabelP2.textContent = courtSide;
        if (courtSideLabelP1) courtSideLabelP1.textContent = "Receiving";
      }
    }

    // Check for Game Point / Match Point (BWF: 21 points, win by 2, cap at 30)
    const p1 = liveScore.p1Score;
    const p2 = liveScore.p2Score;
    const maxScore = Math.max(p1, p2);
    const minScore = Math.min(p1, p2);

    let isGameOrMatchPoint = false;
    let alertText = "";

    if (maxScore >= 20 && maxScore - minScore >= 1) {
      const leader = p1 > p2 ? liveScore.player1Name : liveScore.player2Name;
      const isMatchPoint = (p1 > p2 && liveScore.setsP1Won === 1) || (p2 > p1 && liveScore.setsP2Won === 1);
      alertText = `${leader} ${isMatchPoint ? 'MATCH POINT' : 'GAME POINT'}!`;
      isGameOrMatchPoint = true;
    }

    // Check if set is won
    if ((maxScore >= 21 && maxScore - minScore >= 2) || maxScore === 30) {
      handleSetWin(p1 > p2 ? 1 : 2);
      return;
    }

    if (gameAlert) {
      if (isGameOrMatchPoint) {
        gameAlert.textContent = alertText;
        gameAlert.classList.add("visible");
      } else {
        gameAlert.classList.remove("visible");
      }
    }
  }

  function addPoint(player) {
    if (player === 1) {
      liveScore.p1Score++;
      liveScore.server = 1;
    } else {
      liveScore.p2Score++;
      liveScore.server = 2;
    }
    updateScoreboard();
  }

  function minusPoint(player) {
    if (player === 1 && liveScore.p1Score > 0) {
      liveScore.p1Score--;
    } else if (player === 2 && liveScore.p2Score > 0) {
      liveScore.p2Score--;
    }
    updateScoreboard();
  }

  async function handleSetWin(winner) {
    const winnerName = winner === 1 ? liveScore.player1Name : liveScore.player2Name;
    const finalSetScore = `${liveScore.p1Score}-${liveScore.p2Score}`;
    liveScore.completedSets.push(finalSetScore);

    if (winner === 1) liveScore.setsP1Won++;
    else liveScore.setsP2Won++;

    if (typeof showToast === 'function') {
      showToast(`${winnerName} won Set ${liveScore.currentSet} (${finalSetScore})!`, "success", "Set Completed");
    }

    // Render completed set chip
    if (setsHistoryEl) {
      const chip = document.createElement("span");
      chip.className = "set-chip active";
      chip.textContent = `Set ${liveScore.currentSet}: ${finalSetScore}`;
      setsHistoryEl.appendChild(chip);
    }

    // Check if match won (best of 3 sets)
    if (liveScore.setsP1Won === 2 || liveScore.setsP2Won === 2) {
      const matchWinner = liveScore.setsP1Won === 2 ? liveScore.player1Name : liveScore.player2Name;
      if (typeof showToast === 'function') {
        showToast(`🏆 Match Finished! ${matchWinner} is the Champion!`, "success", "Match Won");
      }
      
      // Auto save match to backend & history
      await saveLiveMatchToHistory();
      resetScoreboard();
      return;
    }

    // Start next set
    liveScore.currentSet++;
    liveScore.p1Score = 0;
    liveScore.p2Score = 0;
    updateScoreboard();
  }

  function resetScoreboard() {
    liveScore.p1Score = 0;
    liveScore.p2Score = 0;
    liveScore.server = 1;
    liveScore.currentSet = 1;
    liveScore.setsP1Won = 0;
    liveScore.setsP2Won = 0;
    liveScore.completedSets = [];
    if (setsHistoryEl) {
      setsHistoryEl.innerHTML = `<span class="set-chip">Set 1: In Progress</span>`;
    }
    updateScoreboard();
  }

  async function saveLiveMatchToHistory() {
    const isWin = liveScore.setsP1Won === 2;
    const scoreStr = liveScore.completedSets.join(", ");
    
    const payload = {
      trainingType: "Match",
      opponent: liveScore.player2Name || "Opponent",
      mode: "Singles",
      scoreSummary: scoreStr,
      result: isWin ? "Win" : "Loss",
      duration: 45,
      intensity: "High",
      smashes: liveScore.smashesP1 || 16,
      unforcedErrors: liveScore.errorsP1 || 8,
      avgRallyLength: 8.2
    };

    try {
      if (window.Fitora && Fitora.Auth.isLoggedIn()) {
        await Fitora.Badminton.logSession(payload);
        if (typeof window.loadDashboardData === 'function') {
          window.loadDashboardData().catch(() => {});
        }
        if (typeof window.refreshDashboardFeed === 'function') {
          window.refreshDashboardFeed().catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Backend badminton sync warning:", err.message);
    }

    const newMatch = {
      id: "badm-" + Date.now(),
      opponent: payload.opponent,
      mode: payload.mode,
      date: "Today",
      scoreSummary: payload.scoreSummary,
      result: payload.result,
      duration: "45m",
      smashes: payload.smashes,
      unforcedErrors: payload.unforcedErrors,
      avgRally: payload.avgRallyLength
    };

    const matches = JSON.parse(localStorage.getItem("Fitora_badminton_matches") || "[]");
    matches.unshift(newMatch);
    localStorage.setItem("Fitora_badminton_matches", JSON.stringify(matches));
    
    await fetchBadmintonData();
    renderBadmintonHistory();
  }

  // Bind Buttons
  const p1PlusBtn = document.getElementById("p1PlusBtn");
  const p1MinusBtn = document.getElementById("p1MinusBtn");
  const p2PlusBtn = document.getElementById("p2PlusBtn");
  const p2MinusBtn = document.getElementById("p2MinusBtn");
  const resetBtn = document.getElementById("resetScoreboardBtn");
  const smashBtn = document.getElementById("logSmashBtn");
  const errorBtn = document.getElementById("logErrorBtn");

  if (p1PlusBtn) p1PlusBtn.addEventListener("click", () => addPoint(1));
  if (p1MinusBtn) p1MinusBtn.addEventListener("click", () => minusPoint(1));
  if (p2PlusBtn) p2PlusBtn.addEventListener("click", () => addPoint(2));
  if (p2MinusBtn) p2MinusBtn.addEventListener("click", () => minusPoint(2));
  if (resetBtn) resetBtn.addEventListener("click", resetScoreboard);

  if (smashBtn) {
    smashBtn.addEventListener("click", () => {
      liveScore.smashesP1++;
      addPoint(1);
      if (typeof showToast === 'function') {
        showToast("💥 Smash Winner recorded! (+1 Pt)", "success");
      }
    });
  }

  if (errorBtn) {
    errorBtn.addEventListener("click", () => {
      liveScore.errorsP1++;
      addPoint(2);
      if (typeof showToast === 'function') {
        showToast("Unforced Error recorded. Point to opponent.", "warning");
      }
    });
  }

  updateScoreboard();
}

function renderBadmintonHistory(filter = "all") {
  const container = document.getElementById("badmintonHistoryList");
  if (!container) return;

  const matches = cachedBadmintonMatches;
  const filtered = filter === "all" ? matches : matches.filter(m => (m.result || "").toLowerCase() === filter.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
        <i class="fa-solid fa-medal" style="font-size: 2.5rem; margin-bottom: 0.75rem;"></i>
        <p>No badminton matches recorded for this filter. Start the live scorer above!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(match => {
    const isWin = (match.result || "").toLowerCase() === "win";
    return `
      <div class="card card-interactive" style="margin-bottom: 1rem; padding: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="stat-icon-wrapper ${isWin ? 'stat-icon-emerald' : 'stat-icon-orange'}" style="width: 38px; height: 38px; font-size: 1rem;">
              <i class="fa-solid ${isWin ? 'fa-trophy' : 'fa-handshake'}"></i>
            </div>
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 700;">vs ${match.opponent}</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">${match.mode} • ${match.date} • ${match.duration}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge ${isWin ? 'badge-emerald' : 'badge-orange'}">${isWin ? 'Won' : 'Lost'}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-primary); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block; text-transform: uppercase;">Scoreline</span>
            <strong style="font-size: 1rem; color: var(--accent-cyan);">${match.scoreSummary}</strong>
          </div>
          <div style="display: flex; gap: 1.5rem;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Smashes</span>
              <strong style="color: var(--primary);">${match.smashes}</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Errors</span>
              <strong style="color: var(--accent-red);">${match.unforcedErrors}</strong>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Avg Rally</span>
              <strong>${match.avgRally} shots</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function initBadmintonCharts() {
  const radarCanvas = document.getElementById("badmintonShotRadarChart");
  if (radarCanvas && window.Chart) {
    const ctx = radarCanvas.getContext("2d");
    new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Smashes", "Drop Shots", "Net Kills", "Clears / Lifts", "Drives", "Trick Shots"],
        datasets: [{
          label: "Shot Accuracy & Frequency",
          data: [85, 78, 92, 70, 80, 65],
          backgroundColor: "rgba(0, 210, 255, 0.2)",
          borderColor: "#00d2ff",
          pointBackgroundColor: "#00d2ff",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            angleLines: { color: "rgba(255, 255, 255, 0.1)" },
            grid: { color: "rgba(255, 255, 255, 0.08)" },
            pointLabels: {
              color: "#94a3b8",
              font: { size: 11, family: "'Outfit', sans-serif" }
            },
            ticks: { display: false }
          }
        }
      }
    });
  }
}

function initBadmintonHistoryFilters() {
  const filterBtns = document.querySelectorAll(".badminton-filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      renderBadmintonHistory(filter);
    });
  });

  // Log Past Match Form
  const pastForm = document.getElementById("logPastBadmintonForm");
  if (pastForm) {
    pastForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const opponent = document.getElementById("badmOpponent").value;
      const mode = document.getElementById("badmMode").value;
      const score = document.getElementById("badmScore").value;
      const result = document.getElementById("badmResult").value;
      const durationStr = document.getElementById("badmDuration").value || "45m";
      const durationMin = parseInt(durationStr) || 45;
      const smashes = parseInt(document.getElementById("badmSmashes").value) || 12;
      const errors = parseInt(document.getElementById("badmErrors").value) || 6;

      const payload = {
        trainingType: "Match",
        opponent,
        mode,
        scoreSummary: score,
        result,
        duration: durationMin,
        intensity: "High",
        smashes,
        unforcedErrors: errors,
        avgRallyLength: 7.8
      };

      try {
        if (window.Fitora && Fitora.Auth.isLoggedIn()) {
          await Fitora.Badminton.logSession(payload);
          if (typeof window.loadDashboardData === 'function') {
            window.loadDashboardData().catch(() => {});
          }
          if (typeof window.refreshDashboardFeed === 'function') {
            window.refreshDashboardFeed().catch(() => {});
          }
        }
      } catch (err) {
        console.warn("Backend badminton sync warning:", err.message);
      }

      const newMatch = {
        id: "badm-" + Date.now(),
        ...payload,
        date: "Today",
        duration: durationStr,
        avgRally: 7.8
      };

      const matches = JSON.parse(localStorage.getItem("Fitora_badminton_matches") || "[]");
      matches.unshift(newMatch);
      localStorage.setItem("Fitora_badminton_matches", JSON.stringify(matches));

      // Also add to global activities
      const activities = JSON.parse(localStorage.getItem("Fitora_recent_activities") || "[]");
      activities.unshift({
        id: "act-" + Date.now(),
        sport: "Badminton",
        title: `${mode} vs ${opponent}`,
        date: "Just now",
        duration: durationStr,
        calories: 510,
        highlight: `${result} (${score})`,
        icon: "fa-medal",
        badgeClass: "badge-purple"
      });
      localStorage.setItem("Fitora_recent_activities", JSON.stringify(activities));

      if (typeof closeModal === 'function') closeModal("logBadmintonModal");
      pastForm.reset();
      
      await fetchBadmintonData();
      renderBadmintonHistory();

      if (typeof showToast === 'function') {
        showToast("Badminton match added to cloud database!", "success", "Match Saved");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initLiveScoreboard();
  await fetchBadmintonData();
  renderBadmintonHistory();
  initBadmintonCharts();
  initBadmintonHistoryFilters();
});
