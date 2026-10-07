const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Handles user authentication, demographic details, fitness preferences, and sport selection.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a valid full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      default: function () {
        return this.email ? this.email.split('@')[0] : 'athlete_' + Date.now();
      }
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Exclude password from query results by default
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    age: {
      type: Number,
      min: [10, 'Age must be at least 10 years'],
      max: [100, 'Age cannot exceed 100 years'],
      default: 24
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    height: {
      type: Number, // in centimeters
      min: [90, 'Height must be at least 90 cm'],
      max: [250, 'Height cannot exceed 250 cm'],
      default: 175
    },
    weight: {
      type: Number, // in kilograms
      min: [30, 'Weight must be at least 30 kg'],
      max: [300, 'Weight cannot exceed 300 kg'],
      default: 72
    },
    activityLevel: {
      type: String,
      enum: [
        'Sedentary',
        'Lightly Active',
        'Moderately Active',
        'Very Active',
        'Extremely Active'
      ],
      default: 'Moderately Active'
    },
    fitnessGoal: {
      type: String,
      enum: [
        'Fat loss',
        'Muscle building',
        'General fitness',
        'Weight maintenance',
        'Sports performance'
      ],
      default: 'Sports performance'
    },
    selectedSport: {
      type: String,
      enum: ['Gym', 'Cricket', 'Badminton'],
      default: 'Gym'
    },
    dietaryPreference: {
      type: String,
      enum: ['Vegetarian', 'Eggetarian', 'Non-Vegetarian'],
      default: 'Vegetarian'
    },
    streakDays: {
      type: Number,
      default: 0
    },
    primarySports: {
      type: [String],
      default: ['Gym', 'Cricket', 'Badminton']
    },
    restingHeartRate: {
      type: Number,
      min: [30, 'Resting heart rate must be at least 30 bpm'],
      max: [200, 'Resting heart rate cannot exceed 200 bpm'],
      default: 72
    },
    foodsToAvoid: {
      type: [String],
      default: []
    },
    allergies: {
      type: String,
      default: ''
    },
    googleFit: {
      connected: { type: Boolean, default: false },
      accessToken: { type: String, select: false },
      refreshToken: { type: String, select: false },
      tokenExpiry: { type: Date, select: false },
      connectedAt: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify entered password against hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
