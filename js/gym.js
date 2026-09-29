/**
 * PULSEFIT - GYM & STRENGTH TRAINING SCRIPT
 * Interactive workout sets, digital rest timer, 1RM calculator, and volume analytics.
 */

// Timer state
let timerInterval = null;
let timerSecondsTotal = 60;
let timerSecondsLeft = 60;
let isTimerRunning = false;

// Initialize Timer
function initRestTimer() {
  const display = document.getElementById("timerDisplay");
  const playBtn = document.getElementById("timerPlayBtn");
  const resetBtn = document.getElementById("timerResetBtn");
  const progressCircle = document.querySelector(".timer-progress-circle");
  const presetBtns = document.querySelectorAll(".timer-preset-btn");

  const totalDash = 440; // 2 * PI * r (approx for r=70)

  function updateTimerUI() {
    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    if (display) {
      display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    if (progressCircle) {
      const fraction = timerSecondsLeft / timerSecondsTotal;
      const offset = totalDash * (1 - fraction);
      progressCircle.style.strokeDashoffset = offset;
    }
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    if (playBtn) {
      playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
      playBtn.classList.remove("btn-primary");
      playBtn.classList.add("btn-secondary");
    }

    timerInterval = setInterval(() => {
      if (timerSecondsLeft > 0) {
        timerSecondsLeft--;
        updateTimerUI();
      } else {
        clearInterval(timerInterval);
        isTimerRunning = false;
        if (playBtn) {
          playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
          playBtn.classList.add("btn-primary");
          playBtn.classList.remove("btn-secondary");
        }
        showToast("Rest time is up! Get ready for your next set.", "warning", "Rest Complete");
        // Audio tone simulation using Web Audio API
        playBeepAlert();
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    if (playBtn) {
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
      playBtn.classList.add("btn-primary");
      playBtn.classList.remove("btn-secondary");
    }
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSecondsLeft = timerSecondsTotal;
    updateTimerUI();
    if (playBtn) {
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
      playBtn.classList.add("btn-primary");
      playBtn.classList.remove("btn-secondary");
    }
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (isTimerRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetTimer);
  }

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const seconds = parseInt(btn.getAttribute("data-seconds")) || 60;
      timerSecondsTotal = seconds;
      resetTimer();
    });
  });

  updateTimerUI();
}

// Web Audio API beep sound for timer
function playBeepAlert() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    // Audio context may require user interaction in some browsers
  }
}

// 1RM Calculator Logic
function initOneRmCalculator() {
  const weightInput = document.getElementById("calcWeight");
  const repsInput = document.getElementById("calcReps");
  const resultDisplay = document.getElementById("calc1RmVal");
  const tier90 = document.getElementById("tier90");
  const tier80 = document.getElementById("tier80");
  const tier70 = document.getElementById("tier70");

  function calculate() {
    const weight = parseFloat(weightInput.value) || 0;
    const reps = parseInt(repsInput.value) || 1;

    if (weight <= 0 || reps <= 0) return;

    // Epley Formula: 1RM = weight * (1 + reps / 30)
    const oneRm = Math.round(weight * (1 + reps / 30));
    if (resultDisplay) resultDisplay.textContent = `${oneRm} kg`;

    if (tier90) tier90.textContent = `${Math.round(oneRm * 0.9)} kg`;
    if (tier80) tier80.textContent = `${Math.round(oneRm * 0.8)} kg`;
    if (tier70) tier70.textContent = `${Math.round(oneRm * 0.7)} kg`;
  }

  if (weightInput && repsInput) {
    weightInput.addEventListener("input", calculate);
    repsInput.addEventListener("input", calculate);
    calculate();
  }
}

// Dynamic Sets and Exercise Management
function initExerciseLogger() {
  // Delegate set completion buttons
  document.addEventListener("click", (e) => {
    const checkBtn = e.target.closest(".set-check-btn");
    if (checkBtn) {
      checkBtn.classList.toggle("completed");
      if (checkBtn.classList.contains("completed")) {
        checkBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        showToast("Set marked complete! Rest timer ready.", "success");
        // Update total volume
        calculateTotalVolume();
      } else {
        checkBtn.innerHTML = '<i class="fa-regular fa-circle"></i>';
        calculateTotalVolume();
      }
    }

    // Add set to specific exercise card
    const addSetBtn = e.target.closest(".btn-add-set");
    if (addSetBtn) {
      const tableBody = addSetBtn.closest(".exercise-card").querySelector("tbody");
      const currentSets = tableBody.querySelectorAll("tr").length + 1;
      
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><strong>${currentSets}</strong></td>
        <td style="color: var(--text-muted); font-size: 0.85rem;">-</td>
        <td><input type="number" class="set-input set-weight" value="80" step="2.5"> kg</td>
        <td><input type="number" class="set-input set-reps" value="8" step="1"></td>
        <td>
          <button class="set-check-btn" title="Mark Set Done">
            <i class="fa-regular fa-circle"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(newRow);
      showToast(`Set ${currentSets} added!`, "info");
    }
  });

  // Calculate session volume
  function calculateTotalVolume() {
    const completedRows = document.querySelectorAll(".set-check-btn.completed");
    let totalKg = 0;
    completedRows.forEach(btn => {
      const row = btn.closest("tr");
      const weight = parseFloat(row.querySelector(".set-weight").value) || 0;
      const reps = parseInt(row.querySelector(".set-reps").value) || 0;
      totalKg += weight * reps;
    });

    const volEl = document.getElementById("totalSessionVolume");
    if (volEl) {
      volEl.textContent = `${totalKg.toLocaleString()} kg`;
    }
  }

  // Handle Add Custom Exercise Modal Form
  const addExForm = document.getElementById("addExerciseForm");
  if (addExForm) {
    addExForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const exName = document.getElementById("exNameInput").value;
      const muscle = document.getElementById("exMuscleSelect").value;
      const targetList = document.getElementById("exerciseCardsContainer");

      const muscleClassMap = {
        "Chest": "muscle-chest",
        "Back": "muscle-back",
        "Legs": "muscle-legs",
        "Shoulders": "muscle-shoulders",
        "Arms": "muscle-arms",
        "Core": "muscle-core"
      };

      const newCard = document.createElement("div");
      newCard.className = "exercise-card";
      newCard.innerHTML = `
        <div class="exercise-header">
          <div class="exercise-title-area">
            <h3 style="font-size: 1.15rem; font-weight: 700;">${exName}</h3>
            <span class="muscle-badge ${muscleClassMap[muscle] || 'muscle-chest'}">${muscle}</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            Personal Record: <strong style="color: var(--primary);">New Entry</strong>
          </div>
        </div>
        <div class="table-responsive">
          <table class="set-table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Target</th>
                <th>Weight</th>
                <th>Reps</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1</strong></td>
                <td style="color: var(--text-muted); font-size: 0.85rem;">Warmup</td>
                <td><input type="number" class="set-input set-weight" value="50" step="2.5"> kg</td>
                <td><input type="number" class="set-input set-reps" value="10" step="1"></td>
                <td>
                  <button class="set-check-btn" title="Mark Set Done">
                    <i class="fa-regular fa-circle"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top: 1rem; display: flex; justify-content: space-between;">
          <button class="btn btn-secondary btn-sm btn-add-set">
            <i class="fa-solid fa-plus"></i> Add Set
          </button>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Rest recommendation: 90s</span>
        </div>
      `;

      targetList.appendChild(newCard);
      closeModal("addExerciseModal");
      addExForm.reset();
      showToast(`${exName} added to current workout session!`, "success", "Exercise Added");
    });
  }

  // Routine Switcher buttons
  const routinePills = document.querySelectorAll(".routine-select-pill");
  routinePills.forEach(pill => {
    pill.addEventListener("click", () => {
      routinePills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const routineName = pill.getAttribute("data-routine");
      showToast(`Loaded ${routineName} routine template`, "info");
    });
  });
}

// Gym Volume Chart
function initGymVolumeChart() {
  const canvas = document.getElementById("gymVolumeChart");
  if (canvas && window.Chart) {
    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Chest", "Back", "Legs (Quads/Hams)", "Shoulders", "Arms", "Core"],
        datasets: [{
          label: "Volume Intensity (Sets/Week)",
          data: [18, 16, 20, 14, 12, 10],
          fill: true,
          backgroundColor: "rgba(0, 245, 155, 0.2)",
          borderColor: "#00f59b",
          pointBackgroundColor: "#00f59b",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#00f59b"
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
              font: { size: 12, family: "'Outfit', sans-serif" }
            },
            ticks: {
              display: false,
              backdropColor: "transparent"
            }
          }
        }
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initRestTimer();
  initOneRmCalculator();
  initExerciseLogger();
  initGymVolumeChart();
});
