const User = require('../models/User');

/**
 * Ensures demo athlete account exists for 1-click testing/viva evaluation.
 * Real registered users always receive clean zero-state data.
 */
async function seedDefaultData() {
  try {
    const existing = await User.findOne({ email: 'alex@fitora.io' });
    if (!existing) {
      await User.create({
        name: 'Alex Mercer',
        email: 'alex@fitora.io',
        password: 'athlete123',
        age: 24,
        gender: 'Male',
        height: 178,
        weight: 74,
        activityLevel: 'Very Active',
        fitnessGoal: 'Sports performance',
        selectedSport: 'Gym',
        dietaryPreference: 'Vegetarian'
      });
      console.log('✅ Demo athlete account ready: alex@fitora.io / athlete123');
    }
  } catch (err) {
    console.warn('ℹ️  Demo account check notice:', err.message);
  }
}

module.exports = { seedDefaultData };
