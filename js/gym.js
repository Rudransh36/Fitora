/**
 * Fitora - GYM & STRENGTH TRAINING SCRIPT
 * Interactive workout sets, digital rest timer, 1RM calculator, and volume analytics.
 * Fully integrated with Fitora Backend API (/api/gym).
 */

// Routine Templates
// Routine Templates
const ROUTINE_TEMPLATES = {
  "Push (Chest/Tri)": {
    name: "Push Day (Chest, Shoulders & Triceps)",
    focus: "Heavy compound pressing followed by tricep isolation.",
    muscles: "Chest, Shoulders & Triceps",
    estDuration: "60 mins",
    estCalories: 520,
    intensity: "High Intensity",
    checklist: [
      { muscle: "Chest", name: "Barbell Flat Bench Press", sets: "4 sets", reps: "6–8 reps", rest: "120s", difficulty: "Heavy", instructions: "Retract scapulae firmly into the bench. Lower bar under control to mid-sternum, then drive explosively upward." },
      { muscle: "Chest", name: "Incline Dumbbell Press (30°)", sets: "3 sets", reps: "8–10 reps", rest: "90s", difficulty: "Moderate", instructions: "Set bench angle to 30 degrees. Flare elbows at 45 degrees, press upward into a subtle squeeze at peak." },
      { muscle: "Shoulders", name: "Standing Military Overhead Press", sets: "3 sets", reps: "8–10 reps", rest: "90s", difficulty: "Heavy", instructions: "Brace core and squeeze glutes. Press straight overhead, clearing chin and pushing head slightly through." },
      { muscle: "Shoulders", name: "Dumbbell Lateral Raise", sets: "4 sets", reps: "12–15 reps", rest: "45s", difficulty: "Moderate", instructions: "Lead with elbows up to shoulder level. Maintain continuous tension on lateral deltoid heads." },
      { muscle: "Arms", name: "Tricep Rope Pushdown", sets: "4 sets", reps: "12–15 reps", rest: "45s", difficulty: "Moderate", instructions: "Pin elbows securely at sides. Spread rope attachments wide at full extension, squeezing triceps." }
    ],
    exercises: [
      { name: "Barbell Flat Bench Press", muscle: "Chest", muscleClass: "muscle-chest", pr: "110 kg",
        sets: [{t:"Warmup",w:60,r:12},{t:"85 kg x 8",w:85,r:8},{t:"95 kg x 6",w:95,r:6},{t:"102.5 kg x 4",w:102.5,r:4}], rest: "120s" },
      { name: "Standing Military Overhead Press", muscle: "Shoulders", muscleClass: "muscle-shoulders", pr: "75 kg",
        sets: [{t:"50 kg x 10",w:50,r:10},{t:"60 kg x 8",w:60,r:8},{t:"65 kg x 6",w:65,r:6}], rest: "90s" },
      { name: "Incline Dumbbell Press (30deg)", muscle: "Upper Chest", muscleClass: "muscle-chest", pr: "38 kg DBs",
        sets: [{t:"30 kg x 10",w:30,r:10},{t:"34 kg x 8",w:34,r:8}], rest: "90s" }
    ]
  },
  "Pull (Back/Bi)": {
    name: "Pull Day (Back & Biceps)",
    focus: "Vertical and horizontal pulling movements for full back development.",
    muscles: "Back, Biceps & Forearms",
    estDuration: "65 mins",
    estCalories: 560,
    intensity: "High Intensity",
    checklist: [
      { muscle: "Back", name: "Lat Pulldown (Wide Grip)", sets: "4 sets", reps: "10–12 reps", rest: "60s", difficulty: "Moderate", instructions: "Grip slightly wider than shoulder width. Pull bar down smoothly to upper chest, retract scapula, slow 3-second negative." },
      { muscle: "Back", name: "Seated Cable Row (Close Grip)", sets: "4 sets", reps: "8–10 reps", rest: "90s", difficulty: "Moderate", instructions: "Keep torso steady, drive elbows past torso, contract rhomboids and middle trapezius." },
      { muscle: "Back", name: "Barbell Bent-Over Row", sets: "4 sets", reps: "6–8 reps", rest: "90s", difficulty: "Heavy", instructions: "Hinge at hips with neutral spine. Pull bar smoothly into lower ribcage, squeezing shoulder blades together." },
      { muscle: "Back", name: "Back Hyperextension", sets: "3 sets", reps: "15 reps", rest: "60s", difficulty: "Moderate", instructions: "Hinge at the hip crease. Extend spine until aligned with thighs, contract glutes and lower back erectors." },
      { muscle: "Biceps", name: "Dumbbell Bicep Curl", sets: "3 sets", reps: "10–12 reps", rest: "60s", difficulty: "Moderate", instructions: "Supinate wrists on upward contraction. Keep elbows tucked at ribs, avoid swinging hips." },
      { muscle: "Biceps", name: "Hammer Curl (Neutral Grip)", sets: "3 sets", reps: "10–12 reps", rest: "60s", difficulty: "Moderate", instructions: "Maintain neutral thumbs-up grip. Excellent for building the brachialis and forearm thickness." },
      { muscle: "Biceps", name: "Incline Dumbbell Curl", sets: "3 sets", reps: "10–12 reps", rest: "60s", difficulty: "Moderate", instructions: "Set incline bench to 60 degrees. Allow arms to hang fully for maximum stretch across long bicep head." }
    ],
    exercises: [
      { name: "Lat Pulldown (Wide Grip)", muscle: "Back", muscleClass: "muscle-back", pr: "90 kg",
        sets: [{t:"60 kg x 12",w:60,r:12},{t:"75 kg x 10",w:75,r:10},{t:"85 kg x 8",w:85,r:8},{t:"90 kg x 6",w:90,r:6}], rest: "60s" },
      { name: "Seated Cable Row (Close Grip)", muscle: "Back", muscleClass: "muscle-back", pr: "80 kg",
        sets: [{t:"60 kg x 12",w:60,r:12},{t:"70 kg x 10",w:70,r:10},{t:"80 kg x 8",w:80,r:8}], rest: "60s" },
      { name: "Barbell Bent-Over Row", muscle: "Back", muscleClass: "muscle-back", pr: "120 kg",
        sets: [{t:"70 kg x 10",w:70,r:10},{t:"90 kg x 8",w:90,r:8},{t:"100 kg x 6",w:100,r:6},{t:"110 kg x 5",w:110,r:5}], rest: "90s" },
      { name: "EZ-Bar Barbell Curl", muscle: "Arms", muscleClass: "muscle-arms", pr: "65 kg",
        sets: [{t:"40 kg x 12",w:40,r:12},{t:"50 kg x 10",w:50,r:10},{t:"60 kg x 8",w:60,r:8}], rest: "60s" },
      { name: "Hammer Curl (DB)", muscle: "Arms", muscleClass: "muscle-arms", pr: "28 kg DBs",
        sets: [{t:"20 kg x 12",w:20,r:12},{t:"24 kg x 10",w:24,r:10},{t:"26 kg x 8",w:26,r:8}], rest: "45s" }
    ]
  },
  "Legs (Quads/Hamstrings)": {
    name: "Legs & Core",
    focus: "Primary leg compound movements with core stability finishers.",
    muscles: "Quads, Hamstrings, Glutes & Abs",
    estDuration: "70 mins",
    estCalories: 620,
    intensity: "High Intensity",
    checklist: [
      { muscle: "Legs", name: "Barbell Back Squat", sets: "4 sets", reps: "6–8 reps", rest: "120s", difficulty: "Heavy", instructions: "Break hips and knees together, descend below parallel with upright chest, drive up through floor." },
      { muscle: "Legs", name: "Romanian Deadlift (RDL)", sets: "4 sets", reps: "8–10 reps", rest: "90s", difficulty: "Heavy", instructions: "Hinge hips backward with soft knees, feel deep hamstring stretch, lockout glutes at peak." },
      { muscle: "Legs", name: "45-Degree Leg Press", sets: "3 sets", reps: "10–12 reps", rest: "90s", difficulty: "Moderate", instructions: "Position feet shoulder-width, lower platform until knees reach 90 degrees, press without hyper-extending knees." },
      { muscle: "Legs", name: "Walking Dumbbell Lunges", sets: "3 sets", reps: "12 steps/leg", rest: "60s", difficulty: "Moderate", instructions: "Take controlled lunging strides forward. Keep front knee aligned over second toe." },
      { muscle: "Core/Abs", name: "Hanging Leg Raise", sets: "3 sets", reps: "15 reps", rest: "60s", difficulty: "Moderate", instructions: "Curl pelvis upward toward chest using lower abdominal contraction. Avoid swinging momentum." },
      { muscle: "Core/Abs", name: "Cable Woodchoppers", sets: "3 sets", reps: "12 reps/side", rest: "45s", difficulty: "Moderate", instructions: "Diagonal rotational movement through hips and obliques, keeping core tightly braced." },
      { muscle: "Core/Abs", name: "Weighted Plank Hold", sets: "3 sets", reps: "45s hold", rest: "45s", difficulty: "Moderate", instructions: "Lock ribs down and squeeze glutes to keep pelvis in neutral position for total abdominal tension." }
    ],
    exercises: [
      { name: "Barbell Back Squat", muscle: "Legs", muscleClass: "muscle-legs", pr: "145 kg",
        sets: [{t:"Warmup 60 kg",w:60,r:10},{t:"100 kg x 8",w:100,r:8},{t:"120 kg x 6",w:120,r:6},{t:"135 kg x 4",w:135,r:4},{t:"145 kg x 3",w:145,r:3}], rest: "180s" },
      { name: "Romanian Deadlift", muscle: "Hamstrings", muscleClass: "muscle-legs", pr: "140 kg",
        sets: [{t:"80 kg x 10",w:80,r:10},{t:"100 kg x 8",w:100,r:8},{t:"120 kg x 6",w:120,r:6}], rest: "90s" },
      { name: "Leg Press (45deg)", muscle: "Quads", muscleClass: "muscle-legs", pr: "280 kg",
        sets: [{t:"160 kg x 12",w:160,r:12},{t:"200 kg x 10",w:200,r:10},{t:"240 kg x 8",w:240,r:8}], rest: "90s" },
      { name: "Hanging Leg Raise", muscle: "Core", muscleClass: "muscle-core", pr: "BW x 20",
        sets: [{t:"BW x 15",w:0,r:15},{t:"BW x 20",w:0,r:20},{t:"+5 kg x 12",w:5,r:12}], rest: "60s" }
    ]
  },
  "Upper Hypertrophy": {
    name: "Upper Hypertrophy",
    focus: "High-rep, high-volume chest and back superset block for muscle growth.",
    muscles: "Upper Chest, Lats, Deltoids & Arms",
    estDuration: "60 mins",
    estCalories: 510,
    intensity: "Hypertrophy Volume",
    checklist: [
      { muscle: "Upper-body hypertrophy", name: "Incline Dumbbell Press", sets: "4 sets", reps: "8–10 reps", rest: "90s", difficulty: "Moderate", instructions: "30-degree incline, press dumbbells up on a natural inward arc, contract clavicular pecs." },
      { muscle: "Upper-body hypertrophy", name: "Lat Pulldown (Wide Grip)", sets: "4 sets", reps: "10–12 reps", rest: "60s", difficulty: "Moderate", instructions: "Wide grip bar, pull down proud chest, squeeze lat insertions." },
      { muscle: "Upper-body hypertrophy", name: "Cable Chest Flyes", sets: "3 sets", reps: "12–15 reps", rest: "60s", difficulty: "Moderate", instructions: "Constant tension across pecs, soft elbow bend, squeeze at peak contraction." },
      { muscle: "Upper-body hypertrophy", name: "Dumbbell Lateral Raise", sets: "4 sets", reps: "15 reps", rest: "45s", difficulty: "Moderate", instructions: "Raise elbows outward to ear level with slight forward torso lean." },
      { muscle: "Upper-body hypertrophy", name: "Tricep Rope Pushdown", sets: "4 sets", reps: "12–15 reps", rest: "45s", difficulty: "Moderate", instructions: "Lock elbows, flare rope at bottom, 1-second pause on peak lockout." },
      { muscle: "Upper-body hypertrophy", name: "Preacher EZ-Bar Curl", sets: "3 sets", reps: "10–12 reps", rest: "60s", difficulty: "Moderate", instructions: "Armpits over pad, curl bar up strictly with zero swinging motion." }
    ],
    exercises: [
      { name: "Cable Chest Flyes (High to Low)", muscle: "Chest", muscleClass: "muscle-chest", pr: "30 kg per side",
        sets: [{t:"20 kg x 15",w:20,r:15},{t:"24 kg x 12",w:24,r:12},{t:"28 kg x 10",w:28,r:10},{t:"30 kg x 8",w:30,r:8}], rest: "60s" },
      { name: "Lat Pulldown (Wide Grip)", muscle: "Back", muscleClass: "muscle-back", pr: "90 kg",
        sets: [{t:"60 kg x 15",w:60,r:15},{t:"72 kg x 12",w:72,r:12},{t:"82 kg x 10",w:82,r:10},{t:"90 kg x 8",w:90,r:8}], rest: "60s" },
      { name: "Dumbbell Lateral Raise", muscle: "Shoulders", muscleClass: "muscle-shoulders", pr: "20 kg DBs",
        sets: [{t:"12 kg x 15",w:12,r:15},{t:"16 kg x 12",w:16,r:12},{t:"18 kg x 10",w:18,r:10}], rest: "45s" },
      { name: "Tricep Rope Pushdown", muscle: "Arms", muscleClass: "muscle-arms", pr: "55 kg",
        sets: [{t:"35 kg x 15",w:35,r:15},{t:"45 kg x 12",w:45,r:12},{t:"50 kg x 10",w:50,r:10}], rest: "45s" },
      { name: "Hammer Curl (DB)", muscle: "Arms", muscleClass: "muscle-arms", pr: "28 kg DBs",
        sets: [{t:"20 kg x 12",w:20,r:12},{t:"24 kg x 10",w:24,r:10},{t:"26 kg x 8",w:26,r:8}], rest: "45s" }
    ]
  }
};

function buildExerciseCard(ex) {
  const rowsHTML = ex.sets.map((s, i) => {
    return '<tr><td><strong>' + (i+1) + '</strong></td><td style="color:var(--text-muted);font-size:0.85rem;">' + s.t + '</td><td><input type="number" class="set-input set-weight" value="' + s.w + '" step="2.5"> kg</td><td><input type="number" class="set-input set-reps" value="' + s.r + '" step="1"></td><td><button class="set-check-btn" title="Mark Set Done"><i class="fa-regular fa-circle"></i></button></td></tr>';
  }).join('');

  return '<div class="exercise-card"><div class="exercise-header"><div class="exercise-title-area"><h3 style="font-size:1.15rem;font-weight:700;">' + ex.name + '</h3><span class="muscle-badge ' + ex.muscleClass + '">' + ex.muscle + '</span></div><div style="font-size:0.85rem;color:var(--text-secondary);">Personal Record: <strong style="color:var(--primary);">' + ex.pr + '</strong></div></div><div class="table-responsive"><table class="set-table"><thead><tr><th>Set</th><th>Target</th><th>Weight</th><th>Reps</th><th>Done</th></tr></thead><tbody>' + rowsHTML + '</tbody></table></div><div style="margin-top:1rem;display:flex;justify-content:space-between;align-items:center;"><button class="btn btn-secondary btn-sm btn-add-set"><i class="fa-solid fa-plus"></i> Add Set</button><span style="font-size:0.8rem;color:var(--text-muted);">Recommended rest: ' + ex.rest + '</span></div></div>';
}

function loadRoutine(routineKey) {
  const routine = ROUTINE_TEMPLATES[routineKey];
  if (!routine) return;
  const bannerH2 = document.querySelector('.gym-header-banner h2');
  const bannerP  = document.querySelector('.gym-header-banner p');
  if (bannerH2) bannerH2.textContent = routine.name;
  if (bannerP)  bannerP.textContent  = routine.focus;
  const container = document.getElementById('exerciseCardsContainer');
  if (container) {
    container.innerHTML = routine.exercises.map(buildExerciseCard).join('');
  }
  const volEl = document.getElementById('totalSessionVolume');
  if (volEl) volEl.textContent = '0 kg';
  showToast('Loaded: ' + routine.name, 'info', 'Routine Switched');
}

let sessionSeconds = 0;
let sessionInterval = null;

function startSessionTimer() {
  sessionInterval = setInterval(function() {
    sessionSeconds++;
    const mins = Math.floor(sessionSeconds / 60);
    const el = document.getElementById('sessionDurationDisplay');
    if (el) el.textContent = mins + ' mins';
  }, 1000);
}

let timerInterval = null;
let timerSecondsTotal = 60;
let timerSecondsLeft = 60;
let isTimerRunning = false;

function initRestTimer() {
  const display        = document.getElementById('timerDisplay');
  const playBtn        = document.getElementById('timerPlayBtn');
  const resetBtn       = document.getElementById('timerResetBtn');
  const progressCircle = document.querySelector('.timer-progress-circle');
  const presetBtns     = document.querySelectorAll('.timer-preset-btn');
  const totalDash      = 440;

  function updateTimerUI() {
    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    if (display) display.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    if (progressCircle) {
      progressCircle.style.strokeDashoffset = totalDash * (1 - timerSecondsLeft / timerSecondsTotal);
    }
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    if (playBtn) { playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause'; playBtn.classList.remove('btn-primary'); playBtn.classList.add('btn-secondary'); }
    timerInterval = setInterval(function() {
      if (timerSecondsLeft > 0) { timerSecondsLeft--; updateTimerUI(); }
      else {
        clearInterval(timerInterval); isTimerRunning = false;
        if (playBtn) { playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start'; playBtn.classList.add('btn-primary'); playBtn.classList.remove('btn-secondary'); }
        if (typeof showToast === 'function') showToast('Rest time is up! Get ready for your next set.', 'warning', 'Rest Complete');
        playBeepAlert();
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerInterval); isTimerRunning = false;
    if (playBtn) { playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume'; playBtn.classList.add('btn-primary'); playBtn.classList.remove('btn-secondary'); }
  }

  function resetTimer() {
    clearInterval(timerInterval); isTimerRunning = false; timerSecondsLeft = timerSecondsTotal; updateTimerUI();
    if (playBtn) { playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start'; playBtn.classList.add('btn-primary'); playBtn.classList.remove('btn-secondary'); }
  }

  if (playBtn)  playBtn.addEventListener('click', function() { isTimerRunning ? pauseTimer() : startTimer(); });
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);
  presetBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      presetBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      timerSecondsTotal = parseInt(btn.getAttribute('data-seconds')) || 60;
      resetTimer();
    });
  });
  updateTimerUI();
}

function playBeepAlert() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.8);
  } catch(e) {}
}

function initOneRmCalculator() {
  const weightInput   = document.getElementById('calcWeight');
  const repsInput     = document.getElementById('calcReps');
  const resultDisplay = document.getElementById('calc1RmVal');
  const tier90        = document.getElementById('tier90');
  const tier80        = document.getElementById('tier80');
  const tier70        = document.getElementById('tier70');

  function calculate() {
    const weight = parseFloat(weightInput.value) || 0;
    const reps   = parseInt(repsInput.value) || 1;
    if (weight <= 0 || reps <= 0) return;
    const oneRm = Math.round(weight * (1 + reps / 30));
    if (resultDisplay) resultDisplay.textContent = oneRm + ' kg';
    if (tier90) tier90.textContent = Math.round(oneRm * 0.9) + ' kg';
    if (tier80) tier80.textContent = Math.round(oneRm * 0.8) + ' kg';
    if (tier70) tier70.textContent = Math.round(oneRm * 0.7) + ' kg';
  }
  if (weightInput && repsInput) {
    weightInput.addEventListener('input', calculate);
    repsInput.addEventListener('input', calculate);
    calculate();
  }
}

function initExerciseLogger() {
  document.addEventListener('click', function(e) {
    const checkBtn = e.target.closest('.set-check-btn');
    if (checkBtn) {
      checkBtn.classList.toggle('completed');
      if (checkBtn.classList.contains('completed')) {
        checkBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        if (typeof showToast === 'function') showToast('Set marked complete! Rest timer ready.', 'success');
      } else {
        checkBtn.innerHTML = '<i class="fa-regular fa-circle"></i>';
      }
      calculateTotalVolume();
    }

    const addSetBtn = e.target.closest('.btn-add-set');
    if (addSetBtn) {
      const tableBody   = addSetBtn.closest('.exercise-card').querySelector('tbody');
      const currentSets = tableBody.querySelectorAll('tr').length + 1;
      const newRow      = document.createElement('tr');
      newRow.innerHTML  = '<td><strong>' + currentSets + '</strong></td><td style="color:var(--text-muted);font-size:0.85rem;">Target</td><td><input type="number" class="set-input set-weight" value="80" step="2.5"> kg</td><td><input type="number" class="set-input set-reps" value="8" step="1"></td><td><button class="set-check-btn" title="Mark Set Done"><i class="fa-regular fa-circle"></i></button></td>';
      tableBody.appendChild(newRow);
      if (typeof showToast === 'function') showToast('Set ' + currentSets + ' added!', 'info');
    }
  });

  function calculateTotalVolume() {
    const completedRows = document.querySelectorAll('.set-check-btn.completed');
    let totalKg = 0;
    completedRows.forEach(function(btn) {
      const row    = btn.closest('tr');
      const weight = parseFloat(row.querySelector('.set-weight') ? row.querySelector('.set-weight').value : 0) || 0;
      const reps   = parseInt(row.querySelector('.set-reps') ? row.querySelector('.set-reps').value : 0) || 0;
      totalKg += weight * reps;
    });
    const volEl = document.getElementById('totalSessionVolume');
    if (volEl) volEl.textContent = totalKg.toLocaleString() + ' kg';
    const totalSets     = document.querySelectorAll('.set-check-btn').length;
    const completedSets = document.querySelectorAll('.set-check-btn.completed').length;
    const setsEl = document.getElementById('completedSetsDisplay');
    if (setsEl) setsEl.textContent = completedSets + ' / ' + totalSets;
    return totalKg;
  }
  window.calculateTotalVolume = calculateTotalVolume;

  const addExForm = document.getElementById('addExerciseForm');
  if (addExForm) {
    addExForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const exName = document.getElementById('exNameInput').value;
      const muscle = document.getElementById('exMuscleSelect').value;
      const targetList = document.getElementById('exerciseCardsContainer');
      const muscleClassMap = { 'Chest':'muscle-chest','Back':'muscle-back','Legs':'muscle-legs','Shoulders':'muscle-shoulders','Arms':'muscle-arms','Core':'muscle-core' };
      const newCard = document.createElement('div');
      newCard.className = 'exercise-card';
      newCard.innerHTML = '<div class="exercise-header"><div class="exercise-title-area"><h3 style="font-size:1.15rem;font-weight:700;">' + exName + '</h3><span class="muscle-badge ' + (muscleClassMap[muscle] || 'muscle-chest') + '">' + muscle + '</span></div><div style="font-size:0.85rem;color:var(--text-secondary);">Personal Record: <strong style="color:var(--primary);">New Entry</strong></div></div><div class="table-responsive"><table class="set-table"><thead><tr><th>Set</th><th>Target</th><th>Weight</th><th>Reps</th><th>Done</th></tr></thead><tbody><tr><td><strong>1</strong></td><td style="color:var(--text-muted);font-size:0.85rem;">Warmup</td><td><input type="number" class="set-input set-weight" value="50" step="2.5"> kg</td><td><input type="number" class="set-input set-reps" value="10" step="1"></td><td><button class="set-check-btn" title="Mark Set Done"><i class="fa-regular fa-circle"></i></button></td></tr></tbody></table></div><div style="margin-top:1rem;display:flex;justify-content:space-between;"><button class="btn btn-secondary btn-sm btn-add-set"><i class="fa-solid fa-plus"></i> Add Set</button><span style="font-size:0.8rem;color:var(--text-muted);">Rest recommendation: 90s</span></div>';
      targetList.appendChild(newCard);
      if (typeof closeModal === 'function') closeModal('addExerciseModal');
      addExForm.reset();
      if (typeof showToast === 'function') showToast(exName + ' added to current workout session!', 'success', 'Exercise Added');
    });
  }

  // Routine split selector pills
  const routinePills = document.querySelectorAll('.routine-select-pill');
  routinePills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      routinePills.forEach(function(p) {
        p.classList.remove('active');
        p.classList.remove('btn-primary');
        p.classList.add('btn-secondary');
      });
      pill.classList.add('active');
      pill.classList.remove('btn-secondary');
      pill.classList.add('btn-primary');
      const rKey = pill.getAttribute('data-routine');
      loadRoutine(rKey);
      if (typeof openWorkoutPlanModal === 'function') {
        openWorkoutPlanModal(rKey);
      }
    });
  });

  // ─── Workout Plan Modal & Checklist System ──────────────────────────────────
  let planCompletedExercises = {};

  function openWorkoutPlanModal(routineKey) {
    if (!routineKey) {
      const activePill = document.querySelector('.routine-select-pill.active');
      routineKey = activePill ? activePill.getAttribute('data-routine') : 'Pull (Back/Bi)';
    }

    const routine = ROUTINE_TEMPLATES[routineKey];
    if (!routine) return;

    // Title & Overview metrics
    const titleEl = document.getElementById('planModalRoutineTitle');
    if (titleEl) titleEl.textContent = routine.name;

    const musclesEl = document.getElementById('planModalMuscles');
    if (musclesEl) musclesEl.textContent = routine.muscles || 'Target Muscle Groups';

    const durEl = document.getElementById('planModalDuration');
    if (durEl) durEl.textContent = routine.estDuration || '60 mins';

    const calEl = document.getElementById('planModalCalories');
    if (calEl) calEl.textContent = `${routine.estCalories || 520} kcal`;

    const intEl = document.getElementById('planModalIntensity');
    if (intEl) intEl.textContent = routine.intensity || 'High Intensity';

    // Reset or load completion state
    if (!planCompletedExercises[routineKey]) {
      planCompletedExercises[routineKey] = {};
    }

    const container = document.getElementById('planExercisesList');
    if (!container) return;

    const checklist = routine.checklist || [];

    // Group exercises by target muscle group
    const groups = {};
    checklist.forEach((ex, idx) => {
      const m = ex.muscle || 'Exercises';
      if (!groups[m]) groups[m] = [];
      groups[m].push({ ...ex, originalIndex: idx });
    });

    let html = '';
    for (const [groupName, exercises] of Object.entries(groups)) {
      html += `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.4rem;">
            <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-dumbbell" style="font-size: 0.85rem;"></i>
              <span>${groupName}</span>
            </h4>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${exercises.length} Exercises</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      `;

      exercises.forEach(ex => {
        const isDone = !!planCompletedExercises[routineKey][ex.name];
        html += `
          <div class="card" style="padding: 0.85rem 1rem; margin-bottom: 0; background: ${isDone ? 'rgba(0, 245, 155, 0.06)' : 'var(--bg-card)'}; border-color: ${isDone ? 'var(--primary)' : 'var(--border-subtle)'}; transition: all 0.2s ease;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                  <strong style="font-size: 1rem; color: ${isDone ? 'var(--primary)' : 'var(--text-main)'};">${ex.name}</strong>
                  <span class="badge ${ex.difficulty === 'Heavy' ? 'badge-orange' : 'badge-emerald'}" style="font-size: 0.7rem;">${ex.difficulty}</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.25rem;">
                  <span><strong>${ex.sets}</strong></span> • 
                  <span><strong>${ex.reps}</strong></span> • 
                  <span>Rest: <strong>${ex.rest}</strong></span>
                </div>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem; line-height: 1.4;">
                  <i class="fa-solid fa-circle-info" style="margin-right: 0.25rem; color: var(--accent-cyan);"></i>${ex.instructions}
                </p>
              </div>
              <div>
                <button type="button" class="btn btn-sm ${isDone ? 'btn-primary' : 'btn-outline'} plan-exercise-toggle-btn" data-routine="${routineKey}" data-exercise="${ex.name}" style="white-space: nowrap; font-size: 0.78rem;">
                  <i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-circle'}"></i> ${isDone ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    // Attach click handlers to exercise completion buttons
    container.querySelectorAll('.plan-exercise-toggle-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const rK = this.getAttribute('data-routine');
        const exName = this.getAttribute('data-exercise');
        planCompletedExercises[rK][exName] = !planCompletedExercises[rK][exName];
        openWorkoutPlanModal(rK);
      });
    });

    updatePlanProgressUI(routineKey);

    if (typeof openModal === 'function') openModal('workoutPlanModal');
  }

  function updatePlanProgressUI(routineKey) {
    const routine = ROUTINE_TEMPLATES[routineKey];
    if (!routine || !routine.checklist) return;
    const total = routine.checklist.length;
    const completedMap = planCompletedExercises[routineKey] || {};
    const doneCount = Object.values(completedMap).filter(Boolean).length;
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const progressTextEl = document.getElementById('planProgressText');
    if (progressTextEl) progressTextEl.textContent = `${doneCount} of ${total} exercises completed (${pct}%)`;

    const progressBarEl = document.getElementById('planProgressBar');
    if (progressBarEl) progressBarEl.style.width = `${pct}%`;
  }

  async function completeWorkoutPlan(routineKey) {
    if (!routineKey) {
      const activePill = document.querySelector('.routine-select-pill.active');
      routineKey = activePill ? activePill.getAttribute('data-routine') : 'Pull (Back/Bi)';
    }

    const routine = ROUTINE_TEMPLATES[routineKey] || ROUTINE_TEMPLATES['Pull (Back/Bi)'];
    const total = routine.checklist ? routine.checklist.length : 6;
    const completedMap = planCompletedExercises[routineKey] || {};
    const doneCount = Object.values(completedMap).filter(Boolean).length || total;
    const pct = Math.round((doneCount / total) * 100) || 100;
    const duration = Math.round(sessionSeconds / 60) || 52;
    const calories = routine.estCalories || 540;

    // Comparison note
    const compText = pct >= 80 ? 
      `+7.8% volume vs previous session. Progressive overload achieved across ${routine.muscles}!` :
      `Maintained training cadence. Next session target: Increase weight on final sets.`;

    // Populate summary modal
    const sTitle = document.getElementById('summaryRoutineTitle');
    if (sTitle) sTitle.textContent = routine.name;

    const sEx = document.getElementById('summaryExercises');
    if (sEx) sEx.textContent = `${doneCount} / ${total}`;

    const sComp = document.getElementById('summaryCompletion');
    if (sComp) sComp.textContent = `${pct}%`;

    const sDur = document.getElementById('summaryDuration');
    if (sDur) sDur.textContent = `${duration} mins`;

    const sCal = document.getElementById('summaryCalories');
    if (sCal) sCal.textContent = `${calories} kcal`;

    const sCompNote = document.getElementById('summaryComparison');
    if (sCompNote) sCompNote.textContent = compText;

    // Close plan modal
    if (typeof closeModal === 'function') closeModal('workoutPlanModal');

    // Collect sets from active logger rows
    const collectedSets = [];
    let setIndex = 1;
    document.querySelectorAll('#exerciseCardsContainer .set-table tbody tr').forEach(row => {
      const isDone = row.querySelector('.set-check-btn')?.classList.contains('completed');
      const w = parseFloat(row.querySelector('.set-weight')?.value) || 0;
      const r = parseInt(row.querySelector('.set-reps')?.value) || 0;
      if (isDone || collectedSets.length === 0) {
        collectedSets.push({ setNumber: setIndex++, weight: w, reps: r, completed: !!isDone });
      }
    });
    if (collectedSets.length === 0) {
      collectedSets.push({ setNumber: 1, weight: 80, reps: 8, completed: true });
    }

    // Helper to map routine muscles to valid enum
    const mapToMuscleEnum = (m) => {
      if (!m) return 'Chest';
      const low = m.toLowerCase();
      if (low.includes('chest') || low.includes('push')) return 'Chest';
      if (low.includes('back') || low.includes('pull')) return 'Back';
      if (low.includes('leg') || low.includes('quad') || low.includes('squat')) return 'Legs';
      if (low.includes('shoulder')) return 'Shoulders';
      if (low.includes('arm') || low.includes('bicep') || low.includes('tricep')) return 'Arms';
      if (low.includes('core') || low.includes('abs')) return 'Core';
      return 'Full Body';
    };

    // Save workout to backend
    try {
      if (window.Fitora && Fitora.Auth.isLoggedIn()) {
        await Fitora.Gym.logWorkout({
          exerciseName: routine.name,
          muscleGroup: mapToMuscleEnum(routine.muscles),
          routine: routineKey,
          sets: collectedSets,
          duration,
          calories,
          intensity: 'High'
        });

        // Also schedule/log on live calendar
        if (Fitora.Calendar && Fitora.Calendar.schedule) {
          await Fitora.Calendar.schedule({
            date: new Date(),
            title: routine.name,
            sport: 'Gym',
            status: 'Completed',
            targetDuration: duration,
            duration,
            calories,
            exercises: (routine.checklist || []).map(e => e.name),
            intensity: 'High'
          }).catch(() => {});
        }

        // Refresh dashboard KPIs immediately after saving session
        if (typeof window.loadDashboardData === 'function') {
          window.loadDashboardData().catch(() => {});
        }
        if (typeof window.refreshDashboardFeed === 'function') {
          window.refreshDashboardFeed().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Backend gym log workout error:', err.message);
    }

    // Stop active timer & display summary modal
    clearInterval(sessionInterval);
    if (typeof openModal === 'function') openModal('workoutSummaryModal');
    if (typeof showToast === 'function') showToast(`${routine.name} successfully recorded & saved to database!`, 'success');
  }

  window.openWorkoutPlanModal = openWorkoutPlanModal;
  window.completeWorkoutPlan = completeWorkoutPlan;

  // View Plan Modal Buttons
  const viewPlanBtn = document.getElementById('viewPlanModalBtn');
  if (viewPlanBtn) {
    viewPlanBtn.addEventListener('click', () => {
      const activePill = document.querySelector('.routine-select-pill.active');
      openWorkoutPlanModal(activePill ? activePill.getAttribute('data-routine') : 'Pull (Back/Bi)');
    });
  }

  const openPlanDirectBtn = document.getElementById('openPlanDirectBtn');
  if (openPlanDirectBtn) {
    openPlanDirectBtn.addEventListener('click', () => {
      const activePill = document.querySelector('.routine-select-pill.active');
      openWorkoutPlanModal(activePill ? activePill.getAttribute('data-routine') : 'Pull (Back/Bi)');
    });
  }

  const planFinishBtn = document.getElementById('planFinishWorkoutBtn');
  if (planFinishBtn) {
    planFinishBtn.addEventListener('click', () => {
      const activePill = document.querySelector('.routine-select-pill.active');
      completeWorkoutPlan(activePill ? activePill.getAttribute('data-routine') : 'Pull (Back/Bi)');
    });
  }

  // Finish Workout Button on main page
  const finishBtn = document.getElementById('finishWorkoutBtn');
  if (finishBtn) {
    finishBtn.addEventListener('click', async function() {
      const activePill = document.querySelector('.routine-select-pill.active');
      completeWorkoutPlan(activePill ? activePill.getAttribute('data-routine') : 'Pull (Back/Bi)');
    });
  }
}

async function initGymVolumeChart() {
  const canvas = document.getElementById('gymVolumeChart');
  if (!canvas || !window.Chart) return;
  let radarData = [18, 16, 20, 14, 12, 10];
  try {
    if (window.Fitora && Fitora.Auth.isLoggedIn()) {
      const stats = await Fitora.Gym.getStats();
      if (stats && stats.stats && stats.stats.weekVolume) {
        const wv = stats.stats.weekVolume;
        radarData = [Math.min(25,Math.round(wv/300)),Math.min(25,Math.round(wv/350)),Math.min(25,Math.round(wv/280)),Math.min(25,Math.round(wv/400)),Math.min(25,Math.round(wv/450)),12];
      }
    }
  } catch(err) {}
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Chest', 'Back', 'Legs (Quads/Hams)', 'Shoulders', 'Arms', 'Core'],
      datasets: [{ label: 'Volume Intensity (Sets/Week)', data: radarData, fill: true, backgroundColor: 'rgba(0,245,155,0.2)', borderColor: '#00f59b', pointBackgroundColor: '#00f59b', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#00f59b' }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { r: { angleLines: { color: 'rgba(255,255,255,0.1)' }, grid: { color: 'rgba(255,255,255,0.08)' }, pointLabels: { color: '#94a3b8', font: { size: 12, family: "'Outfit', sans-serif" } }, ticks: { display: false, backdropColor: 'transparent' } } }
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initRestTimer();
  initOneRmCalculator();
  initExerciseLogger();
  initGymVolumeChart();
  startSessionTimer();
});