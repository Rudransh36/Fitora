/**
 * Fitora - INDIAN DIET & NUTRITION CONTROLLER
 * Handles fetching, rendering, and recalculating personalized Indian and Maharashtrian
 * meal plans based on athlete TDEE, macros, sport type, and dietary preferences.
 */

let dietMacroChartInstance = null;
let currentDietPlan = null;

// Default fallback diet plan in case server is unavailable
const DEFAULT_INDIAN_DIET_PLAN = {
  sport: "Gym",
  fitnessGoal: "Muscle building",
  dietaryPreference: "Vegetarian",
  estimatedDailyCalories: 3348,
  macroTargets: {
    proteinGrams: 133,
    carbsGrams: 488,
    fatsGrams: 96
  },
  sportNutritionFocus: "High-protein hypertrophy plan targeting ~133g protein with nutrient-dense Indian legumes, dairy, and whole grains.",
  hydrationGuideline: "Drink 3.2 to 3.8 Litres of water daily. Include 1 glass of Taak (buttermilk) after training for potassium and sodium replenishment.",
  disclaimer: "Disclaimer: Nutritional values and calorie counts are scientific approximations for educational and fitness monitoring purposes, not a clinical prescription.",
  meals: {
    breakfast: [
      {
        foodName: "Vegetable Upma with Roasted Peanuts & Lemon",
        portion: "1 large bowl (180g) with curry leaves & fresh coriander",
        approxCalories: 310,
        approxProtein: 9,
        approxCarbs: 54,
        approxFats: 7,
        note: "Easily digestible semolina offering rapid energy replenishment with fibre"
      },
      {
        foodName: "Moong Dal Chilla with Mint Chutney",
        portion: "2 medium chillas (150g)",
        approxCalories: 240,
        approxProtein: 14,
        approxCarbs: 32,
        approxFats: 5,
        note: "Living enzymes, plant bio-availability, and sustained morning energy"
      }
    ],
    lunch: [
      {
        foodName: "Paneer Bhurji with 3 Whole Wheat Phulkas & Dal",
        portion: "120g fresh paneer + 3 phulkas + 1 bowl yellow dal",
        approxCalories: 520,
        approxProtein: 28,
        approxCarbs: 58,
        approxFats: 18,
        note: "High calcium and casein protein for continuous muscle tissue repair"
      },
      {
        foodName: "Varan Bhaat with Ghee & Lemon (Maharashtra)",
        portion: "1.5 cups steamed rice + 1.5 bowls toor dal varan + 1 tsp pure ghee",
        approxCalories: 460,
        approxProtein: 16,
        approxCarbs: 78,
        approxFats: 8,
        note: "Complete amino acid profile (grain + legume pairing) with easy digestibility"
      }
    ],
    eveningSnack: [
      {
        foodName: "Roasted Chana (Phutana) & Jaggery with Glass of Milk (Maharashtra)",
        portion: "50g roasted chana + 10g jaggery + 1 glass warm milk",
        approxCalories: 310,
        approxProtein: 16,
        approxCarbs: 44,
        approxFats: 6,
        note: "Time-tested akhada snack rich in iron, zinc, and slow-burning energy"
      },
      {
        foodName: "Masala Taak (Fresh Spiced Buttermilk) (Maharashtra)",
        portion: "1 large glass (300ml) with roasted cumin and coriander",
        approxCalories: 85,
        approxProtein: 5,
        approxCarbs: 8,
        approxFats: 3,
        note: "Hydrating cooling drink full of natural probiotics, potassium, and sodium"
      }
    ],
    dinner: [
      {
        foodName: "Rajma / Chole with Jeera Rice & Green Salad",
        portion: "1.5 bowls red kidney beans + 1 cup jeera rice",
        approxCalories: 470,
        approxProtein: 19,
        approxCarbs: 76,
        approxFats: 7,
        note: "High fiber, complex starch, and sustained overnight amino acid release"
      },
      {
        foodName: "Multigrain Khichdi with Curd & Papad (Maharashtra)",
        portion: "1.5 cups moong dal khichdi + 1 bowl fresh curd",
        approxCalories: 410,
        approxProtein: 17,
        approxCarbs: 64,
        approxFats: 8,
        note: "Light restorative dinner promoting restful sleep and gut healing"
      }
    ],
    postWorkout: [
      {
        foodName: "Natural Sattu Protein Drink with Lemon & Cumin",
        portion: "1 tall glass (50g roasted chana flour + water/taak)",
        approxCalories: 190,
        approxProtein: 13,
        approxCarbs: 29,
        approxFats: 3,
        note: "Natural cooling whole-food protein drink with zero artificial additives"
      }
    ]
  }
};

function getOfflineDietPlan(preference = 'Vegetarian', sport = 'Gym', goal = 'Muscle building') {
  const pref = (preference || 'Vegetarian').toLowerCase();
  if (pref === 'non-vegetarian') {
    return {
      sport,
      fitnessGoal: goal,
      dietaryPreference: "Non-Vegetarian",
      estimatedDailyCalories: 2850,
      macroTargets: { proteinGrams: 160, carbsGrams: 360, fatsGrams: 75 },
      sportNutritionFocus: "Lean animal protein and complex carbohydrates optimized for progressive recovery and strength.",
      hydrationGuideline: "Drink 3.2 to 3.8 Litres of water daily. Include 1 glass of Taak (buttermilk) after training.",
      disclaimer: "Disclaimer: Nutritional values and calorie counts are scientific approximations for educational and fitness monitoring purposes, not a clinical prescription.",
      meals: {
        breakfast: [
          { foodName: "Chicken Keema Paratha with Fresh Curd", portion: "1 large paratha stuffed with 80g spiced minced chicken + 1/2 cup curd", approxCalories: 410, approxProtein: 26, approxCarbs: 42, approxFats: 14, note: "Power-packed lean poultry protein breakfast for hard-training athletes" },
          { foodName: "Vegetable Upma with Roasted Peanuts & Lemon", portion: "1 bowl (150g)", approxCalories: 260, approxProtein: 6, approxCarbs: 46, approxFats: 6, note: "Easily digestible glycogen replenishment" }
        ],
        lunch: [
          { foodName: "Home-Style Chicken Curry with 3 Phulkas & Salad", portion: "160g skinless chicken + 3 whole wheat rotis + cucumber salad", approxCalories: 510, approxProtein: 40, approxCarbs: 52, approxFats: 13, note: "Rich in complete amino acids, iron, and zinc" },
          { foodName: "Varan Bhaat with Ghee & Lemon (Maharashtra)", portion: "1 cup rice + 1 bowl toor dal varan + 1 tsp ghee", approxCalories: 420, approxProtein: 14, approxCarbs: 68, approxFats: 7, note: "Clean complex carbohydrates and soluble fiber" }
        ],
        eveningSnack: [
          { foodName: "Roasted Chana & Jaggery with Glass of Milk (Maharashtra)", portion: "50g chana + 10g jaggery + 1 glass milk", approxCalories: 310, approxProtein: 16, approxCarbs: 44, approxFats: 6, note: "Sustained mineral energy" },
          { foodName: "Masala Taak (Spiced Buttermilk) (Maharashtra)", portion: "1 tall glass (300ml)", approxCalories: 85, approxProtein: 5, approxCarbs: 8, approxFats: 3, note: "Natural probiotics and electrolytes" }
        ],
        dinner: [
          { foodName: "Grilled Tandoori Chicken Tikka with Phulkas & Salad", portion: "180g breast tikka + 2 phulkas", approxCalories: 460, approxProtein: 44, approxCarbs: 34, approxFats: 11, note: "High protein-to-calorie ratio for overnight recovery" },
          { foodName: "Multigrain Khichdi with Curd & Papad (Maharashtra)", portion: "1.5 cups moong dal khichdi + 1 bowl fresh curd", approxCalories: 410, approxProtein: 17, approxCarbs: 64, approxFats: 8, note: "Light restorative evening carbohydrate source" }
        ],
        postWorkout: [
          { foodName: "Grilled Chicken Breast (120g) with Sweet Potato", portion: "120g grilled breast + 100g sweet potato", approxCalories: 260, approxProtein: 34, approxCarbs: 24, approxFats: 3, note: "Pure lean protein and complex low-GI carbs for targeted hypertrophy" }
        ]
      }
    };
  } else if (pref === 'eggetarian') {
    return {
      sport,
      fitnessGoal: goal,
      dietaryPreference: "Eggetarian",
      estimatedDailyCalories: 2750,
      macroTargets: { proteinGrams: 145, carbsGrams: 375, fatsGrams: 70 },
      sportNutritionFocus: "Wholesome vegetarian staples enriched with high-quality egg protein for hypertrophy and stamina.",
      hydrationGuideline: "Drink 3.2 to 3.8 Litres of water daily. Include buttermilk post-session.",
      disclaimer: "Disclaimer: Nutritional values and calorie counts are scientific approximations for educational and fitness monitoring purposes, not a clinical prescription.",
      meals: {
        breakfast: [
          { foodName: "Egg Bhurji with 2 Whole Wheat Phulkas", portion: "2 eggs bhurji + 2 rotis", approxCalories: 360, approxProtein: 19, approxCarbs: 34, approxFats: 14, note: "Essential amino acids and choline" },
          { foodName: "Vegetable Upma with Roasted Peanuts & Lemon", portion: "1 bowl (150g)", approxCalories: 260, approxProtein: 6, approxCarbs: 46, approxFats: 6, note: "Natural carbohydrates and quick morning glycogen" }
        ],
        lunch: [
          { foodName: "Egg Curry with Steamed Rice & 2 Phulkas", portion: "2 whole eggs in gravy + 1 cup rice + 2 phulkas", approxCalories: 480, approxProtein: 24, approxCarbs: 64, approxFats: 12, note: "Balanced protein, B-vitamins, and stamina carbs" },
          { foodName: "Varan Bhaat with Ghee & Lemon (Maharashtra)", portion: "1 cup rice + 1 bowl toor dal varan + 1 tsp ghee", approxCalories: 420, approxProtein: 14, approxCarbs: 68, approxFats: 7, note: "Living enzymes, fiber, and clean calories" }
        ],
        eveningSnack: [
          { foodName: "Roasted Chana & Jaggery with Glass of Milk (Maharashtra)", portion: "50g chana + 10g jaggery + 1 glass milk", approxCalories: 310, approxProtein: 16, approxCarbs: 44, approxFats: 6, note: "Sustained mineral energy" },
          { foodName: "Masala Taak (Spiced Buttermilk) (Maharashtra)", portion: "1 glass (300ml)", approxCalories: 85, approxProtein: 5, approxCarbs: 8, approxFats: 3, note: "Cooling electrolyte balance" }
        ],
        dinner: [
          { foodName: "Egg Fried Rice with Mixed Vegetables & Raita", portion: "2 scrambled eggs + 1.5 cups rice + mixed veggies", approxCalories: 450, approxProtein: 20, approxCarbs: 66, approxFats: 11, note: "Comforting evening meal with complete egg protein" },
          { foodName: "Multigrain Moong Dal Khichdi with Curd (Maharashtra)", portion: "1.5 cups khichdi + 1 bowl curd", approxCalories: 410, approxProtein: 17, approxCarbs: 64, approxFats: 8, note: "Light restorative meal" }
        ],
        postWorkout: [
          { foodName: "3 Boiled Egg Whites + 1 Banana", portion: "3 whites + 1 banana", approxCalories: 175, approxProtein: 14, approxCarbs: 28, approxFats: 0.5, note: "Quick protein synthesis initiation" }
        ]
      }
    };
  } else {
    // Pure Vegetarian: Roti, rice, dal, varan, amti, vegetables, paneer, curd, thalipeeth, matki usal - NO eggs, NO chicken, NO fish
    return {
      sport,
      fitnessGoal: goal,
      dietaryPreference: "Vegetarian",
      estimatedDailyCalories: 2650,
      macroTargets: { proteinGrams: 135, carbsGrams: 390, fatsGrams: 65 },
      sportNutritionFocus: "Wholesome pure Indian vegetarian nutrition combining lentils, dairy, whole grains, and traditional legumes.",
      hydrationGuideline: "Drink 3.2 to 3.8 Litres of water daily. Include 1 glass of Taak (buttermilk) after training.",
      disclaimer: "Disclaimer: Nutritional values and calorie counts are scientific approximations for educational and fitness monitoring purposes, not a clinical prescription.",
      meals: {
        breakfast: [
          { foodName: "Vegetable Upma with Roasted Peanuts & Lemon", portion: "1 large bowl (180g)", approxCalories: 310, approxProtein: 9, approxCarbs: 54, approxFats: 7, note: "Easily digestible semolina offering rapid energy replenishment with fibre" },
          { foodName: "Moong Dal Chilla with Mint Chutney", portion: "2 chillas (150g)", approxCalories: 240, approxProtein: 14, approxCarbs: 32, approxFats: 5, note: "High plant bio-availability and sustained morning energy" }
        ],
        lunch: [
          { foodName: "Paneer Bhurji with 3 Whole Wheat Phulkas & Dal", portion: "120g fresh paneer + 3 phulkas + 1 bowl dal", approxCalories: 520, approxProtein: 28, approxCarbs: 58, approxFats: 18, note: "High calcium and slow-release casein protein" },
          { foodName: "Varan Bhaat with Ghee & Lemon (Maharashtra)", portion: "1.5 cups steamed rice + 1.5 bowls toor dal varan + 1 tsp ghee", approxCalories: 460, approxProtein: 16, approxCarbs: 78, approxFats: 8, note: "Classic complete amino acid pairing" }
        ],
        eveningSnack: [
          { foodName: "Roasted Chana & Jaggery with Glass of Milk (Maharashtra)", portion: "50g chana + 10g jaggery + 1 glass warm milk", approxCalories: 310, approxProtein: 16, approxCarbs: 44, approxFats: 6, note: "Time-tested energy and mineral boost" },
          { foodName: "Masala Taak (Fresh Spiced Buttermilk) (Maharashtra)", portion: "1 large glass (300ml)", approxCalories: 85, approxProtein: 5, approxCarbs: 8, approxFats: 3, note: "Natural probiotics, potassium, and sodium" }
        ],
        dinner: [
          { foodName: "Rajma / Chole with Jeera Rice & Green Salad", portion: "1.5 bowls kidney beans + 1 cup jeera rice", approxCalories: 470, approxProtein: 19, approxCarbs: 76, approxFats: 7, note: "Complex starch and sustained overnight amino acid release" },
          { foodName: "Multigrain Khichdi with Curd & Papad (Maharashtra)", portion: "1.5 cups moong dal khichdi + 1 bowl curd", approxCalories: 410, approxProtein: 17, approxCarbs: 64, approxFats: 8, note: "Light restorative meal promoting restful sleep" }
        ],
        postWorkout: [
          { foodName: "High-Protein Oats Bowl with Milk, Banana & Chia Seeds", portion: "50g oats + 1 glass warm milk + 1 banana + 1 tbsp chia seeds", approxCalories: 330, approxProtein: 16, approxCarbs: 56, approxFats: 6, note: "Rapid glycogen replenishment and muscle recovery" }
        ]
      }
    };
  }
}

/**
 * Initialize Macro Doughnut Chart
 */
function initMacroChart(proteinG, carbsG, fatsG) {
  const ctx = document.getElementById("dietMacroChart");
  if (!ctx) return;

  const calProtein = (proteinG || 133) * 4;
  const calCarbs = (carbsG || 488) * 4;
  const calFats = (fatsG || 96) * 9;
  const totalCal = calProtein + calCarbs + calFats || 1;

  const pctP = Math.round((calProtein / totalCal) * 100);
  const pctC = Math.round((calCarbs / totalCal) * 100);
  const pctF = 100 - pctP - pctC;

  const pEl = document.getElementById("macroPctP");
  const cEl = document.getElementById("macroPctC");
  const fEl = document.getElementById("macroPctF");
  if (pEl) pEl.textContent = `${pctP}%`;
  if (cEl) cEl.textContent = `${pctC}%`;
  if (fEl) fEl.textContent = `${pctF}%`;

  if (dietMacroChartInstance) {
    dietMacroChartInstance.destroy();
  }

  dietMacroChartInstance = new Chart(ctx.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Protein", "Carbohydrates", "Healthy Fats"],
      datasets: [
        {
          data: [calProtein, calCarbs, calFats],
          backgroundColor: ["#22c55e", "#00d2ff", "#ef4444"],
          borderColor: "#0f172a",
          borderWidth: 3,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const val = context.raw || 0;
              const pct = Math.round((val / totalCal) * 100);
              return ` ${label}: ${val} kcal (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Render single meal list
 */
function renderMealList(containerId, items = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">
        No specific items generated for this meal window.
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const isMaha = item.foodName.toLowerCase().includes("maharashtra") ||
                   item.foodName.toLowerCase().includes("bhakri") ||
                   item.foodName.toLowerCase().includes("pithla") ||
                   item.foodName.toLowerCase().includes("taak") ||
                   item.foodName.toLowerCase().includes("matki") ||
                   item.foodName.toLowerCase().includes("upma") ||
                   item.foodName.toLowerCase().includes("khichdi");

    // Clean food name of extra brackets if we show them in tag
    const cleanName = item.foodName.replace(/\(Maharashtra\)/gi, "").trim();

    return `
      <div class="food-item-row">
        <div class="food-details">
          <div class="food-name">
            <span>${cleanName}</span>
            ${isMaha ? '<span class="region-tag"><i class="fa-solid fa-pepper-hot"></i> Maharashtra Staple</span>' : ''}
          </div>
          <div class="food-portion"><i class="fa-solid fa-scale-balanced" style="font-size: 0.75rem;"></i> ${item.portion || '1 serving'}</div>
          ${item.note ? `<div class="food-note">${item.note}</div>` : ''}
        </div>
        <div class="food-macros">
          <div class="macro-pill macro-cal" title="Energy">${item.approxCalories || 0} kcal</div>
          <div class="macro-pill macro-pro" title="Protein">${item.approxProtein || 0}g P</div>
          <div class="macro-pill macro-carb" title="Carbohydrates">${item.approxCarbs || 0}g C</div>
          <div class="macro-pill macro-fat" title="Fats">${item.approxFats || 0}g F</div>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * Render entire diet plan to UI
 */
function renderDietPlan(plan) {
  if (!plan) return;
  currentDietPlan = plan;

  // Header tags
  const goalEl = document.getElementById("dietGoalLabel");
  const sportEl = document.getElementById("dietSportLabel");
  const prefEl = document.getElementById("dietPrefLabel");
  if (goalEl) goalEl.textContent = plan.fitnessGoal || "Muscle building";
  if (sportEl) sportEl.textContent = plan.sport || "Gym";
  if (prefEl) prefEl.textContent = plan.dietaryPreference || "Vegetarian";

  // KPIs
  const cals = plan.estimatedDailyCalories || 3000;
  const pGrams = plan.macroTargets ? plan.macroTargets.proteinGrams : 130;
  const cGrams = plan.macroTargets ? plan.macroTargets.carbsGrams : 450;
  const fGrams = plan.macroTargets ? plan.macroTargets.fatsGrams : 90;

  const targetCalEl = document.getElementById("kpiTargetCalories");
  const proteinEl = document.getElementById("kpiProtein");
  const carbsEl = document.getElementById("kpiCarbs");
  const fatsEl = document.getElementById("kpiFats");

  if (targetCalEl) targetCalEl.innerHTML = `${cals.toLocaleString()} <span style="font-size: 1rem; color: var(--text-muted);">kcal</span>`;
  if (proteinEl) proteinEl.innerHTML = `${pGrams} <span style="font-size: 1rem; color: var(--text-muted);">g</span>`;
  if (carbsEl) carbsEl.innerHTML = `${cGrams} <span style="font-size: 1rem; color: var(--text-muted);">g</span>`;
  if (fatsEl) fatsEl.innerHTML = `${fGrams} <span style="font-size: 1rem; color: var(--text-muted);">g</span>`;

  // Percentage calculations
  const calP = pGrams * 4;
  const calC = cGrams * 4;
  const calF = fGrams * 9;
  const sumCal = calP + calC + calF || 1;

  const pctP = Math.round((calP / sumCal) * 100);
  const pctC = Math.round((calC / sumCal) * 100);
  const pctF = 100 - pctP - pctC;

  const pPctEl = document.getElementById("kpiProteinPct");
  const cPctEl = document.getElementById("kpiCarbsPct");
  const fPctEl = document.getElementById("kpiFatsPct");
  if (pPctEl) pPctEl.textContent = `~${pctP}% of total`;
  if (cPctEl) cPctEl.textContent = `~${pctC}% of total`;
  if (fPctEl) fPctEl.textContent = `~${pctF}% of total`;

  // Render Meals
  const meals = plan.meals || {};
  renderMealList("breakfastItems", meals.breakfast || []);
  renderMealList("lunchItems", meals.lunch || []);
  renderMealList("eveningItems", meals.eveningSnack || []);
  renderMealList("dinnerItems", meals.dinner || []);
  renderMealList("postWorkoutItems", meals.postWorkout || []);

  // Hydration & Guidelines
  const hydrationEl = document.getElementById("hydrationGuidelineText");
  const sportFocusEl = document.getElementById("sportFocusText");
  const disclaimerEl = document.getElementById("disclaimerText");

  if (hydrationEl && plan.hydrationGuideline) {
    hydrationEl.textContent = plan.hydrationGuideline;
  }
  if (sportFocusEl && plan.sportNutritionFocus) {
    sportFocusEl.textContent = plan.sportNutritionFocus;
  }
  if (disclaimerEl && plan.disclaimer) {
    disclaimerEl.innerHTML = `<strong style="color: var(--text-secondary);"><i class="fa-solid fa-circle-info"></i> Academic Disclaimer:</strong> ${plan.disclaimer}`;
  }

  // Update Doughnut Chart
  initMacroChart(pGrams, cGrams, fGrams);
}

/**
 * Load Diet Plan from Backend API
 */
async function loadDietPlan() {
  try {
    if (window.Fitora && Fitora.Auth.isLoggedIn()) {
      const response = await Fitora.Diet.getPlan();
      if (response && response.dietPlan) {
        renderDietPlan(response.dietPlan);
        _syncQuickDietSelect(response.dietPlan.dietaryPreference);
        return;
      }
    }
  } catch (err) {
    console.warn("Using offline diet plan:", err.message);
  }

  // Fallback to offline plan matching stored user preferences
  const user = (window.Fitora && Fitora.getStoredUser()) || {};
  const pref = user.dietaryPreference || 'Vegetarian';
  const plan = getOfflineDietPlan(pref, user.selectedSport || 'Gym', user.fitnessGoal || 'Muscle building');
  renderDietPlan(plan);
  _syncQuickDietSelect(pref);
}

/**
 * Sync the quick diet select dropdown to the given preference value
 */
function _syncQuickDietSelect(preference) {
  const sel = document.getElementById('quickDietSelect');
  if (!sel || !preference) return;
  // Match case-insensitively
  const opt = Array.from(sel.options).find(
    o => o.value.toLowerCase() === String(preference).toLowerCase()
  );
  if (opt) sel.value = opt.value;
}

/**
 * Regenerate Diet Plan
 */
async function regenerateDietPlan() {
  const btn = document.getElementById("regeneratePlanBtn");
  const heroBtn = document.getElementById("heroRegenBtn");
  
  const originalHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Calculating...`;
  }
  if (heroBtn) {
    heroBtn.disabled = true;
  }

  try {
    if (window.Fitora && Fitora.Auth.isLoggedIn()) {
      const res = await Fitora.Diet.regeneratePlan();
      if (res && res.dietPlan) {
        renderDietPlan(res.dietPlan);
        if (typeof showToast === "function") {
          showToast("Personalized Indian diet plan regenerated!", "success", "Nutrition Recalculated");
        }
        return;
      }
    } else {
      if (typeof showToast === "function") {
        showToast("Please login to synchronize diet with your live biometrics.", "info");
      }
    }
  } catch (err) {
    if (typeof showToast === "function") {
      showToast(err.message || "Failed to regenerate plan.", "error");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
    if (heroBtn) {
      heroBtn.disabled = false;
    }
  }
}

/**
 * Setup Preferences Modal & Form
 */
function initPreferences() {
  const openBtn = document.getElementById("openPrefsBtn");
  const modal = document.getElementById("dietPrefsModal");
  const form = document.getElementById("dietPrefsForm");

  const populatePrefsForm = () => {
    const user = (window.Fitora && Fitora.getStoredUser()) || {};
    if (document.getElementById("prefSport")) {
      document.getElementById("prefSport").value = user.selectedSport || (currentDietPlan && currentDietPlan.sport) || "Gym";
    }
    if (document.getElementById("prefGoal")) {
      document.getElementById("prefGoal").value = user.fitnessGoal || (currentDietPlan && currentDietPlan.fitnessGoal) || "Muscle building";
    }
    if (document.getElementById("prefDiet")) {
      document.getElementById("prefDiet").value = user.dietaryPreference || (currentDietPlan && currentDietPlan.dietaryPreference) || "Vegetarian";
    }
    if (document.getElementById("prefWeight") && user.weight) {
      document.getElementById("prefWeight").value = user.weight;
    }
    if (document.getElementById("prefFoodsToAvoid")) {
      document.getElementById("prefFoodsToAvoid").value = Array.isArray(user.foodsToAvoid) ? user.foodsToAvoid.join(", ") : (user.foodsToAvoid || "");
    }
    if (document.getElementById("prefAllergies")) {
      document.getElementById("prefAllergies").value = user.allergies || "";
    }
  };

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      populatePrefsForm();
      if (typeof openModal === "function") openModal("dietPrefsModal");
      else if (modal) modal.classList.add("open");
    });
  }

  // Also hook up any generic customize triggers
  window.openDietPrefsModal = () => {
    populatePrefsForm();
    if (typeof openModal === "function") openModal("dietPrefsModal");
  };

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const sport = document.getElementById("prefSport").value;
      const goal = document.getElementById("prefGoal").value;
      const diet = document.getElementById("prefDiet").value;
      const weight = parseFloat(document.getElementById("prefWeight").value) || 72;
      const avoidStr = document.getElementById("prefFoodsToAvoid") ? document.getElementById("prefFoodsToAvoid").value : "";
      const allergies = document.getElementById("prefAllergies") ? document.getElementById("prefAllergies").value : "";
      const foodsToAvoid = avoidStr.split(",").map(s => s.trim()).filter(Boolean);

      try {
        if (window.Fitora && Fitora.Auth.isLoggedIn()) {
          // Update profile first
          await Fitora.Profile.update({
            selectedSport: sport,
            fitnessGoal: goal,
            dietaryPreference: diet,
            weight: weight,
            foodsToAvoid,
            allergies
          });
          // Then update local cache so other components stay in sync
          const cachedUser = (window.Fitora && Fitora.getStoredUser()) || {};
          cachedUser.selectedSport = sport;
          cachedUser.fitnessGoal = goal;
          cachedUser.dietaryPreference = diet;
          cachedUser.weight = weight;
          if (window.Fitora) Fitora.setStoredUser(cachedUser);

          // Then regenerate diet plan with the new preference
          const res = await Fitora.Diet.regeneratePlan({ dietaryPreference: diet, sport, fitnessGoal: goal });
          if (res && res.dietPlan) {
            renderDietPlan(res.dietPlan);
            if (typeof _syncQuickDietSelect === 'function') {
              _syncQuickDietSelect(res.dietPlan.dietaryPreference || diet);
            }
          }
        } else {
          // Offline mode
          const plan = getOfflineDietPlan(diet, sport, goal);
          renderDietPlan(plan);
        }

        if (typeof closeModal === "function") closeModal("dietPrefsModal");
        else if (modal) modal.classList.remove("open");

        if (typeof showToast === "function") {
          showToast("Profile preferences updated & new diet plan ready!", "success", "Saved");
        }
      } catch (err) {
        if (typeof showToast === "function") {
          showToast(err.message || "Failed to update profile", "error");
        }
      }
    });
  }
}

// ─── Hydration Tracker Logic ──────────────────────────────────────────────────

function updateHydrationUI(water) {
  if (!water) return;
  const consumed = water.consumedAmount || 0;
  const target = water.targetAmount || 2800;
  const pct = Math.min(100, Math.round((consumed / target) * 100));
  const remaining = Math.max(0, target - consumed);

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
  };

  setEl("hydroConsumed", `${consumed.toLocaleString()} <span style="font-size: 0.9rem; font-weight: 500;">ml</span>`);
  setEl("hydroTarget", `${target.toLocaleString()} <span style="font-size: 0.9rem; font-weight: 500;">ml</span>`);
  setEl("hydroPercent", `${pct}% of daily target`);
  setEl("hydroRemaining", `${remaining.toLocaleString()} ml remaining`);

  const bar = document.getElementById("hydroProgressBar");
  if (bar) bar.style.width = `${pct}%`;
}

async function openHydrationModal() {
  if (typeof openModal === "function") {
    openModal("hydrationModal");
  }

  try {
    if (window.Fitora && Fitora.Auth.isLoggedIn()) {
      const data = await Fitora.Water.getToday();
      if (data && data.water) {
        updateHydrationUI(data.water);
      }
    } else {
      // Local fallback
      const saved = JSON.parse(localStorage.getItem("Fitora_water") || '{"consumed": 0, "target": 2800}');
      updateHydrationUI({ consumedAmount: saved.consumed, targetAmount: saved.target });
    }
  } catch (err) {
    console.warn("Could not load hydration data:", err);
  }
}

function openAyurvedaModal() {
  if (typeof openModal === "function") {
    openModal("ayurvedaModal");
  }
}

window.openHydrationModal = openHydrationModal;
window.openAyurvedaModal = openAyurvedaModal;

function initHydrationListeners() {
  // Quick add buttons
  document.querySelectorAll(".hydro-quick-add").forEach(btn => {
    btn.addEventListener("click", async () => {
      const amount = parseInt(btn.getAttribute("data-amount")) || 250;
      await logWater(amount);
    });
  });

  // Custom add form
  const customForm = document.getElementById("hydroCustomForm");
  if (customForm) {
    customForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("hydroCustomInput");
      const amount = parseInt(input.value);
      if (!amount || amount <= 0) return;
      await logWater(amount);
      input.value = "";
    });
  }

  // Reset button
  const resetBtn = document.getElementById("hydroResetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      try {
        if (window.Fitora && Fitora.Auth.isLoggedIn()) {
          await Fitora.Water.reset();
          const data = await Fitora.Water.getToday();
          if (data && data.water) updateHydrationUI(data.water);
        } else {
          localStorage.setItem("Fitora_water", JSON.stringify({ consumed: 0, target: 2800 }));
          updateHydrationUI({ consumedAmount: 0, targetAmount: 2800 });
        }
        if (typeof showToast === "function") {
          showToast("Daily water intake has been reset.", "info");
        }
      } catch (err) {
        if (typeof showToast === "function") {
          showToast(err.message || "Failed to reset water", "error");
        }
      }
    });
  }
}

async function logWater(amount) {
  try {
    if (window.Fitora && Fitora.Auth.isLoggedIn()) {
      const res = await Fitora.Water.add(amount);
      if (res && res.water) {
        updateHydrationUI(res.water);
      }
    } else {
      const saved = JSON.parse(localStorage.getItem("Fitora_water") || '{"consumed": 0, "target": 2800}');
      saved.consumed = (saved.consumed || 0) + amount;
      localStorage.setItem("Fitora_water", JSON.stringify(saved));
      updateHydrationUI({ consumedAmount: saved.consumed, targetAmount: saved.target });
    }

    if (typeof showToast === "function") {
      showToast(`Added ${amount} ml water! 💧`, "success");
    }
  } catch (err) {
    if (typeof showToast === "function") {
      showToast(err.message || "Failed to log water", "error");
    }
  }
}

// ─── Initialization on DOMContentLoaded ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  if (window.Fitora && typeof Fitora.populateNavUser === "function") {
    Fitora.populateNavUser();
  }

  initPreferences();
  initHydrationListeners();

  const regenBtn = document.getElementById("regeneratePlanBtn");
  if (regenBtn) {
    regenBtn.addEventListener("click", regenerateDietPlan);
  }

  const heroRegenBtn = document.getElementById("heroRegenBtn");
  if (heroRegenBtn) {
    heroRegenBtn.addEventListener("click", regenerateDietPlan);
  }

  // ── Quick diet selector (hero dropdown) ─────────────────────────────────────
  const quickDietSel = document.getElementById("quickDietSelect");
  if (quickDietSel) {
    quickDietSel.addEventListener("change", async () => {
      const selected = quickDietSel.value; // e.g. "Vegetarian", "Eggetarian", "Non-Vegetarian"
      try {
        if (window.Fitora && Fitora.Auth.isLoggedIn()) {
          // 1. Persist preference to user profile
          await Fitora.Profile.update({ dietaryPreference: selected });
          // Update local cache so other parts of the UI stay in sync
          const cachedUser = Fitora.getStoredUser() || {};
          cachedUser.dietaryPreference = selected;
          Fitora.setStoredUser(cachedUser);
          // 2. Regenerate plan server-side with the new preference
          const res = await Fitora.Diet.regeneratePlan({ dietaryPreference: selected });
          if (res && res.dietPlan) {
            renderDietPlan(res.dietPlan);
            if (typeof showToast === "function") {
              showToast(`Diet updated to ${selected}!`, "success");
            }
          }
        } else {
          // Offline: just re-render with correct offline plan
          const user = (Fitora && Fitora.getStoredUser()) || {};
          const plan = getOfflineDietPlan(selected, user.selectedSport || 'Gym', user.fitnessGoal || 'Muscle building');
          renderDietPlan(plan);
          if (typeof showToast === "function") {
            showToast(`Showing ${selected} plan (offline mode).`, "info");
          }
        }
      } catch (err) {
        if (typeof showToast === "function") {
          showToast(err.message || "Failed to update diet preference.", "error");
        }
        console.error("Quick diet select error:", err);
      }
    });
  }

  await loadDietPlan();
});
