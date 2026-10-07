/**
 * Fitora - BIOMETRIC & FITNESS CALCULATION ENGINE
 * 
 * Clearly documented scientific formulas used:
 * 1. Body Mass Index (BMI): Quetelet's index = weight (kg) / (height (m) ^ 2)
 *    * Screening metric only, not a clinical diagnosis.
 * 2. Basal Metabolic Rate (BMR): Mifflin-St Jeor Equation
 *    - Men:   (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 *    - Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 * 3. Total Daily Energy Expenditure (TDEE): BMR × Physical Activity Factor (PAL)
 * 4. Daily Hydration Requirement: 35-40 ml/kg body weight + 500 ml exercise compensation
 * 5. Estimated Calorie Burn: MET (Metabolic Equivalent of Task) Formula
 *    - Calories = (MET × 3.5 × weight_kg / 200) × duration_minutes
 * 6. One Rep Max (1RM): Epley Formula
 *    - 1RM = weight × (1 + reps / 30)
 */

/**
 * Calculate Body Mass Index and international WHO classification
 * Note: BMI is an anthropometric screening indicator, not a definitive medical diagnosis.
 */
function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return { bmi: 0, category: 'Unknown', isScreeningOnly: true };
  }

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal weight';
  let color = 'emerald';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'cyan';
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal weight (Healthy Range)';
    color = 'emerald';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    color = 'orange';
  } else {
    category = 'Obesity Class';
    color = 'red';
  }

  return {
    bmi,
    category,
    color,
    healthNotice: 'BMI is a general screening metric for baseline athletic tracking and does not replace clinical evaluation.'
  };
}

/**
 * Calculate Basal Metabolic Rate using the Mifflin-St Jeor formula
 */
function calculateBMR(weightKg, heightCm, age, gender = 'Male') {
  const w = parseFloat(weightKg) || 70;
  const h = parseFloat(heightCm) || 175;
  const a = parseInt(age) || 24;

  let bmr;
  if (gender.toLowerCase() === 'female') {
    bmr = 10 * w + 6.25 * h - 5 * a - 161;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * a + 5;
  }

  return Math.round(bmr);
}

/**
 * Activity Level Multipliers for TDEE
 */
const ACTIVITY_MULTIPLIERS = {
  'Sedentary': 1.2,          // Desk job, little or no exercise
  'Lightly Active': 1.375,   // Light exercise 1-3 days/week
  'Moderately Active': 1.55, // Moderate sports/training 3-5 days/week
  'Very Active': 1.725,      // Hard exercise 6-7 days/week
  'Extremely Active': 1.9    // Intense daily sports conditioning / double sessions
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE) and Goal-Adjusted Calorie Target
 */
function calculateTDEE(weightKg, heightCm, age, gender, activityLevel = 'Moderately Active', fitnessGoal = 'Sports performance') {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  let targetCalories = tdee;
  let goalAdjustmentNote = 'Maintenance calories for athletic consistency';

  switch (fitnessGoal) {
    case 'Fat loss':
      targetCalories = Math.round(tdee - 450); // moderate healthy calorie deficit
      goalAdjustmentNote = 'Caloric deficit (~450 kcal) to facilitate safe fat loss while retaining lean muscle';
      break;
    case 'Muscle building':
      targetCalories = Math.round(tdee + 350); // lean surplus
      goalAdjustmentNote = 'Caloric surplus (+350 kcal) to support hypertrophy and muscle protein synthesis';
      break;
    case 'Sports performance':
      targetCalories = Math.round(tdee + 150); // fuel peak conditioning
      goalAdjustmentNote = 'Performance fueling (+150 kcal) to maximize power output and rapid recovery';
      break;
    case 'Weight maintenance':
    case 'General fitness':
    default:
      targetCalories = tdee;
      goalAdjustmentNote = 'Balanced caloric equilibrium for general vitality and sustained conditioning';
      break;
  }

  // Prevent dangerously low targets
  if (targetCalories < 1200) targetCalories = 1200;

  return {
    bmr,
    tdee,
    targetCalories,
    activityLevel,
    fitnessGoal,
    goalAdjustmentNote,
    isEstimate: true
  };
}

/**
 * Calculate recommended daily water intake (in ml)
 * Baseline: 35 ml per kg of bodyweight, plus 500-750 ml activity buffer
 */
function calculateDailyWaterTarget(weightKg, activityLevel = 'Moderately Active') {
  const w = parseFloat(weightKg) || 70;
  const baseMl = w * 35;
  const extraByActivity = {
    'Sedentary': 250,
    'Lightly Active': 400,
    'Moderately Active': 600,
    'Very Active': 850,
    'Extremely Active': 1000
  };
  const extra = extraByActivity[activityLevel] || 600;
  return Math.round(baseMl + extra);
}

/**
 * Calculate Estimated Calories Burned using METs (Metabolic Equivalent of Task)
 * Note: Labeled strictly as an ESTIMATE in all responses.
 */
function calculateEstimatedCaloriesBurned(activityType, durationMins, weightKg = 70, intensity = 'Moderate') {
  const w = parseFloat(weightKg) || 70;
  const d = parseFloat(durationMins) || 30;

  // Standard MET Values
  const MET_TABLE = {
    'gym_push': 6.0,
    'gym_pull': 6.0,
    'gym_legs': 7.0,
    'gym_general': 5.5,
    'cricket_match': 6.2,
    'cricket_nets': 5.8,
    'cricket_running': 8.5,
    'badminton_match': 7.8,
    'badminton_drills': 7.2,
    'badminton_casual': 5.0,
    'running': 9.0,
    'general': 5.0
  };

  const key = activityType.toLowerCase().replace(/[\s-]/g, '_');
  let met = MET_TABLE[key] || 5.5;

  // Intensity adjustments
  if (intensity === 'High' || intensity === 'Intense') met *= 1.15;
  else if (intensity === 'Low') met *= 0.85;

  // Formula: (MET * 3.5 * weightKg / 200) * durationMins
  const calories = Math.round((met * 3.5 * w / 200) * d);

  return {
    estimatedCalories: calories,
    durationMinutes: d,
    metValue: parseFloat(met.toFixed(2)),
    disclaimer: 'Calorie values are approximations derived from validated Metabolic Equivalent of Task (MET) indices.'
  };
}

/**
 * 1-Repetition Maximum (1RM) using Epley Formula
 */
function calculate1RM(weightKg, reps) {
  const w = parseFloat(weightKg) || 0;
  const r = parseInt(reps) || 1;

  if (w <= 0 || r <= 0) return { oneRepMax: 0, tiers: {} };
  if (r === 1) return { oneRepMax: w, tiers: { 90: Math.round(w * 0.9), 80: Math.round(w * 0.8), 70: Math.round(w * 0.7) } };

  // Epley Formula: 1RM = weight * (1 + reps / 30)
  const oneRepMax = Math.round(w * (1 + r / 30));

  return {
    oneRepMax,
    tiers: {
      tier90: Math.round(oneRepMax * 0.9), // heavy triples
      tier80: Math.round(oneRepMax * 0.8), // hypertrophy (6-8 reps)
      tier70: Math.round(oneRepMax * 0.7)  // muscular endurance (10-12 reps)
    }
  };
}

module.exports = {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateDailyWaterTarget,
  calculateEstimatedCaloriesBurned,
  calculate1RM
};
