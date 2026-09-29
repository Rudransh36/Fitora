/**
 * PULSEFIT - DASHBOARD INTERACTIVE SCRIPT
 * Manages weekly activity charts, sport distribution, live activity feed & filter tabs.
 */

let weeklyActivityChart = null;
let sportSplitChart = null;

function renderDashboardFeed() {
  const feedContainer = document.getElementById("dashboardRecentFeed");
  if (!feedContainer) return;

  const activities = JSON.parse(localStorage.getItem("pulsefit_recent_activities") || "[]");

  if (activities.length === 0) {
    feedContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <i class="fa-solid fa-person-running" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
        <p>No activities recorded yet. Tap "+ Log Activity" above to begin!</p>
      </div>
    `;
    return;
  }

  feedContainer.innerHTML = activities.slice(0, 5).map(act => `
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
  `).join("");
}

function getIconClass(sport) {
  switch (sport) {
    case "Gym": return "stat-icon-emerald";
    case "Cricket": return "stat-icon-cyan";
    case "Badminton": return "stat-icon-purple";
    default: return "stat-icon-orange";
  }
}

// Initialize Charts using Chart.js
function initDashboardCharts() {
  const weeklyCanvas = document.getElementById("weeklyBurnChart");
  const sportCanvas = document.getElementById("sportSplitChart");

  // Chart globals for dark theme
  if (window.Chart) {
    Chart.defaults.color = "#94a3b8";
    Chart.defaults.font.family = "'Outfit', sans-serif";
  }

  // Weekly Activity Bar & Line Chart
  if (weeklyCanvas && window.Chart) {
    const ctx = weeklyCanvas.getContext("2d");

    weeklyActivityChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Calories Burned (kcal)",
            data: [540, 680, 490, 820, 610, 940, 750],
            backgroundColor: "rgba(0, 245, 155, 0.6)",
            borderColor: "#00f59b",
            borderWidth: 1.5,
            borderRadius: 6,
            yAxisID: "y"
          },
          {
            label: "Active Minutes",
            data: [60, 75, 50, 90, 65, 110, 85],
            type: "line",
            borderColor: "#00d2ff",
            backgroundColor: "rgba(0, 210, 255, 0.1)",
            borderWidth: 3,
            tension: 0.35,
            pointBackgroundColor: "#00d2ff",
            pointRadius: 4,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 12,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: "#141c2c",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.05)"
            }
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            grid: {
              color: "rgba(255, 255, 255, 0.05)"
            },
            title: {
              display: true,
              text: "Calories (kcal)",
              color: "#64748b"
            }
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: "Active Minutes",
              color: "#64748b"
            }
          }
        }
      }
    });
  }

  // Sports Split Doughnut Chart
  if (sportCanvas && window.Chart) {
    const ctxSport = sportCanvas.getContext("2d");

    sportSplitChart = new Chart(ctxSport, {
      type: "doughnut",
      data: {
        labels: ["Gym & Weights", "Cricket", "Badminton"],
        datasets: [
          {
            data: [45, 32, 23],
            backgroundColor: [
              "#00f59b",
              "#00d2ff",
              "#a855f7"
            ],
            borderColor: "#141c2c",
            borderWidth: 4,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 16,
              boxWidth: 12,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: "#141c2c",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.raw}% time spent`;
              }
            }
          }
        },
        cutout: "70%"
      }
    });
  }
}

// Make refresh accessible globally
window.refreshDashboardFeed = renderDashboardFeed;

document.addEventListener("DOMContentLoaded", () => {
  renderDashboardFeed();
  initDashboardCharts();

  // Time Range Filters (Today / This Week / This Month)
  const timePills = document.querySelectorAll(".time-filter-pill");
  timePills.forEach(pill => {
    pill.addEventListener("click", () => {
      timePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const range = pill.getAttribute("data-range");
      showToast(`View updated for ${range.replace("-", " ")}`, "info");
      
      // Update charts with mock simulated trends
      if (weeklyActivityChart) {
        if (range === "today") {
          weeklyActivityChart.data.labels = ["06 AM", "09 AM", "12 PM", "03 PM", "06 PM", "09 PM"];
          weeklyActivityChart.data.datasets[0].data = [120, 340, 50, 80, 520, 110];
          weeklyActivityChart.data.datasets[1].data = [15, 45, 10, 15, 60, 15];
        } else if (range === "this-month") {
          weeklyActivityChart.data.labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
          weeklyActivityChart.data.datasets[0].data = [4200, 4850, 5100, 4700];
          weeklyActivityChart.data.datasets[1].data = [420, 510, 540, 490];
        } else {
          weeklyActivityChart.data.labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          weeklyActivityChart.data.datasets[0].data = [540, 680, 490, 820, 610, 940, 750];
          weeklyActivityChart.data.datasets[1].data = [60, 75, 50, 90, 65, 110, 85];
        }
        weeklyActivityChart.update();
      }
    });
  });
});
