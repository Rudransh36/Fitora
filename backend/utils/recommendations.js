/**
 * Fitora - INDIAN DIET & ATHLETIC RECOMMENDATION ENGINE
 * 
 * Built specifically for Indian athletes and sports enthusiasts:
 * 1. Indian Food Database featuring diverse North, South, and West Indian staple foods.
 * 2. Strict dietary preference filtering:
 *    - Vegetarian: Dal, paneer, sprouts, curd, chana, roti/chapati, khichdi, soya chunks (NO meat/fish/eggs).
 *    - Eggetarian: Includes eggs (boiled eggs, bhurji) + all vegetarian staples (NO chicken/fish).
 *    - Non-Vegetarian: Includes chicken curry, fish, eggs + traditional Indian whole grains.
 * 3. Sport-Specific Nutritional Adaptations:
 *    - Gym: Muscle protein synthesis, progressive recovery, amino acid availability.
 *    - Cricket: Extended glycogen stores, pitch stamina, hydration & electrolyte balance.
 *    - Badminton: Rapid agility, sustained stamina, anti-inflammatory whole foods.
 * 4. Weekly Custom Training Schedules (Monday - Sunday) for Gym, Cricket, and Badminton.
 */

// Comprehensive Master Indian Food Catalog
const INDIAN_FOODS_DATABASE = [
  // BREAKFAST
  {
    name: 'Vegetable Upma with Roasted Peanuts & Lemon',
    regionalName: 'उपमा',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1 medium plate (180g)',
    approxCalories: 260,
    approxProtein: 6,
    approxCarbs: 46,
    approxFats: 6,
    benefits: 'Easily digestible semolina with roasted peanuts, mustard seeds, curry leaves, and a squeeze of lemon'
  },
  {
    name: 'Rolled Oats Porridge with Milk, Honey & Almonds',
    regionalName: 'दूध आणि बदामाचे ओट्स',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1 bowl (50g rolled oats cooked in 250ml milk + 10 almonds)',
    approxCalories: 320,
    approxProtein: 14,
    approxCarbs: 48,
    approxFats: 7,
    benefits: 'Beta-glucan soluble fiber for cholesterol regulation, steady energy release, and heart health'
  },
  {
    name: 'Masala Vegetable Oats with Roasted Peanuts',
    regionalName: 'मसाला व्हेजिटेबल ओट्स',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1 medium plate (60g oats cooked with veggies, cumin, turmeric + 15g roasted peanuts)',
    approxCalories: 290,
    approxProtein: 11,
    approxCarbs: 44,
    approxFats: 8,
    benefits: 'Savory Indian oats with dietary fiber, antioxidant spices, and plant-based healthy fats'
  },
  {
    name: 'Egg White Scramble with Savory Masala Oats',
    regionalName: 'अंडा भुर्जी आणि मसाला ओट्स',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: false,
    portion: '3 egg whites scrambled + 1 bowl spiced vegetable oats',
    approxCalories: 340,
    approxProtein: 23,
    approxCarbs: 42,
    approxFats: 7,
    benefits: 'High biological value egg protein combined with complex low-glycemic beta-glucan carbs'
  },
  {
    name: 'Moong Dal Chilla with Mint Chutney',
    regionalName: 'मूग डाळ चिला',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '2 chillas (150g)',
    approxCalories: 240,
    approxProtein: 14,
    approxCarbs: 32,
    approxFats: 5,
    benefits: 'High plant protein and complex carbohydrates for steady morning energy'
  },
  {
    name: 'Thalipeeth with Dahi',
    regionalName: 'भाजणीचे थालीपीठ आणि दही (Maharashtra)',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '2 multigrain thalipeeth (140g) + 1/2 bowl curd',
    approxCalories: 310,
    approxProtein: 11,
    approxCarbs: 46,
    approxFats: 9,
    benefits: 'Nutrient-dense roasted multigrain (jowar, bajra, chana, wheat) flour flatbread'
  },
  {
    name: 'Vegetable Upma',
    regionalName: 'उप्पीट / उपमा',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '1 medium bowl (200g)',
    approxCalories: 250,
    approxProtein: 6,
    approxCarbs: 42,
    approxFats: 6,
    benefits: 'Semolina cooked with mustard seeds, curry leaves, carrots, and peas'
  },
  {
    name: 'Steamed Idli with Sambar & Coconut Chutney',
    regionalName: 'इडली सांबार',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '3 idlis (150g) + 1 bowl sambar',
    approxCalories: 280,
    approxProtein: 9,
    approxCarbs: 52,
    approxFats: 4,
    benefits: 'Fermented, gut-friendly breakfast with bioavailable B-vitamins'
  },
  {
    name: 'Egg Bhurji with 2 Phulkas',
    regionalName: 'अंडा भुर्जी आणि चपाती',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: true,
    portion: '2 eggs bhurji + 2 whole wheat rotis',
    approxCalories: 360,
    approxProtein: 19,
    approxCarbs: 34,
    approxFats: 14,
    benefits: 'High biological value protein with essential amino acids and B12'
  },
  {
    name: 'Boiled Eggs (3 whites + 1 whole) with Whole Wheat Toast',
    regionalName: 'उकडलेले अंडे',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: false,
    portion: '4 eggs (3 whites, 1 whole) + 2 slices toast',
    approxCalories: 320,
    approxProtein: 22,
    approxCarbs: 26,
    approxFats: 9,
    benefits: 'Lean protein source to initiate muscle protein synthesis'
  },
  {
    name: 'Masala Dosa with Sambar & Coconut Chutney',
    regionalName: 'मसाला डोसा',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1 crisp dosa + 1 bowl sambar',
    approxCalories: 310,
    approxProtein: 7,
    approxCarbs: 52,
    approxFats: 8,
    benefits: 'Fermented complex carbohydrates providing quick morning glycogen replenishment'
  },
  {
    name: 'Paneer Paratha with Mint Curd',
    regionalName: 'पनीर पराठा आणि दही',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '2 medium parathas (160g) + 1/2 bowl curd',
    approxCalories: 380,
    approxProtein: 18,
    approxCarbs: 48,
    approxFats: 14,
    benefits: 'Whole wheat flatbread stuffed with fresh cottage cheese for sustained release'
  },
  {
    name: 'Masala Omelette with Whole Wheat Toast & Tea',
    regionalName: 'मसाला ऑम्लेट आणि टोस्ट',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: false,
    portion: '2-egg omelette with onions/tomatoes + 2 slices toast',
    approxCalories: 340,
    approxProtein: 20,
    approxCarbs: 28,
    approxFats: 12,
    benefits: 'High biological value protein with essential choline for focus and recovery'
  },
  {
    name: 'Scrambled Eggs with 2 Multigrain Toasts & Fruit',
    regionalName: 'स्क्रॅम्बल्ड एग्ज आणि टोस्ट',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: false,
    portion: '3 scrambled eggs (2 whites, 1 whole) + 2 slices toast + sliced apple',
    approxCalories: 330,
    approxProtein: 21,
    approxCarbs: 30,
    approxFats: 10,
    benefits: 'High biological value protein with essential choline for focus and endurance'
  },
  {
    name: 'Chicken Keema Paratha with Fresh Curd',
    regionalName: 'चिकन खिमा पराठा',
    category: 'Breakfast',
    mealSlot: 'Breakfast',
    dietaryPreference: 'Non-Vegetarian',
    isMaharashtrian: false,
    portion: '1 large paratha stuffed with 80g spiced minced chicken + 1/2 cup curd',
    approxCalories: 410,
    approxProtein: 26,
    approxCarbs: 42,
    approxFats: 14,
    benefits: 'Power-packed lean poultry protein breakfast for hard-training athletes'
  },

  // MID-MORNING SNACKS
  {
    name: 'Sprouts Salad (Matki / Moong)',
    regionalName: 'उसळ / मोड आलेली मटकी (Maharashtra)',
    category: 'Snack',
    mealSlot: 'Mid-Morning',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '1 medium bowl (150g)',
    approxCalories: 140,
    approxProtein: 10,
    approxCarbs: 22,
    approxFats: 1.5,
    benefits: 'Rich in living enzymes, soluble fiber, iron, and folate'
  },
  {
    name: 'Fresh Seasonal Fruit Bowl (Papaya, Apple & Pomegranate)',
    regionalName: 'ताजी फळे',
    category: 'Fruit',
    mealSlot: 'Mid-Morning',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1 bowl (200g)',
    approxCalories: 120,
    approxProtein: 2,
    approxCarbs: 28,
    approxFats: 0.5,
    benefits: 'Natural electrolytes, polyphenols, and Vitamin C for cellular recovery'
  },
  {
    name: 'Roasted Makhana (Foxnuts) with Turmeric',
    regionalName: 'भाजलेले मखाणे',
    category: 'Snack',
    mealSlot: 'Mid-Morning',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1 big cup (40g)',
    approxCalories: 145,
    approxProtein: 4,
    approxCarbs: 26,
    approxFats: 2.5,
    benefits: 'Low glycemic index, rich in magnesium, calcium, and antioxidants'
  },

  // LUNCH
  {
    name: 'Rajma Chawal with Green Salad',
    regionalName: 'राजमा चावल',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1.5 bowls red kidney bean curry + 1 cup steamed rice + cucumber salad',
    approxCalories: 460,
    approxProtein: 17,
    approxCarbs: 74,
    approxFats: 8,
    benefits: 'High fiber, plant protein, and complex starch for sustained energy'
  },
  {
    name: 'Aloo Gobi with 3 Chapati & Dal',
    regionalName: 'आलू गोभी और चपाती',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '3 whole wheat chapatis + 1 bowl aloo gobi sabzi + 1 bowl yellow dal',
    approxCalories: 470,
    approxProtein: 16,
    approxCarbs: 72,
    approxFats: 10,
    benefits: 'Classic North Indian comfort meal providing complex carbs, fiber, and plant protein'
  },
  {
    name: 'Varan Bhaat with Ghee & Lemon',
    regionalName: 'वरण भात आणि तूप (Maharashtra Staple)',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '1.5 cups steamed rice + 1.5 bowls Toor dal varan + 1 tsp pure ghee',
    approxCalories: 460,
    approxProtein: 16,
    approxCarbs: 78,
    approxFats: 8,
    benefits: 'Complete amino acid profile (grain + legume pairing) with easy digestibility'
  },
  {
    name: 'Paneer Bhurji with 3 Chapati & Dal',
    regionalName: 'पनीर भुर्जी आणि चपाती',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '120g fresh paneer + 3 phulkas + 1 bowl yellow dal',
    approxCalories: 550,
    approxProtein: 28,
    approxCarbs: 58,
    approxFats: 19,
    benefits: 'High calcium and casein protein for continuous muscle tissue repair'
  },
  {
    name: 'Home-Style Chicken Curry with 3 Phulkas & Salad',
    regionalName: 'चिकन करी और फुलका',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Non-Vegetarian',
    isMaharashtrian: false,
    portion: '150g skinless chicken curry + 3 whole wheat phulkas + sliced onion/cucumber',
    approxCalories: 520,
    approxProtein: 38,
    approxCarbs: 56,
    approxFats: 14,
    benefits: 'Complete animal protein rich in zinc, niacin, and phosphorus'
  },
  {
    name: 'Fish Curry with Steamed Rice (Pomfret / Surmai / Rohu)',
    regionalName: 'मच्छी रस्सा आणि भात (Konkani / Indian Coast)',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Non-Vegetarian',
    isMaharashtrian: true,
    portion: '150g fish in mild coconut-kokum curry + 1.5 cups rice',
    approxCalories: 480,
    approxProtein: 32,
    approxCarbs: 60,
    approxFats: 11,
    benefits: 'Rich in anti-inflammatory Omega-3 fatty acids for joint and cardiac health'
  },
  {
    name: 'Dal Tadka with Steamed Basmati Rice & 2 Phulkas',
    regionalName: 'दाल तडका, जिरा राईस आणि फुलका',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1.5 bowls yellow toor dal + 1 cup rice + 2 phulkas',
    approxCalories: 490,
    approxProtein: 18,
    approxCarbs: 82,
    approxFats: 8,
    benefits: 'Classic Indian staple delivering clean energy and complete amino acid profile'
  },
  {
    name: 'Egg Curry with Steamed Rice & 2 Phulkas',
    regionalName: 'अंडा रस्सा, भात आणि चपाती',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: true,
    portion: '2 whole eggs in tomato-onion gravy + 1 cup rice + 2 phulkas',
    approxCalories: 470,
    approxProtein: 24,
    approxCarbs: 62,
    approxFats: 12,
    benefits: 'Sustained muscular fuel with vital B-complex vitamins and minerals'
  },
  {
    name: 'Chicken Tikka Rice Bowl with Green Salad',
    regionalName: 'चिकन टिक्का राईस बाऊल',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Non-Vegetarian',
    isMaharashtrian: false,
    portion: '160g roasted chicken tikka + 1.5 cups steamed brown/white rice + cucumber salad',
    approxCalories: 510,
    approxProtein: 42,
    approxCarbs: 64,
    approxFats: 9,
    benefits: 'Ultra-clean lean protein source ideal for recovery and body recomposition'
  },
  {
    name: 'Methi Bhaji with 3 Phulkas & Toor Dal Amti',
    regionalName: 'मेथीची भाजी, फुलके आणि आमटी (Maharashtra)',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '1 bowl fresh fenugreek greens + 3 whole wheat rotis + 1 bowl sweet-tangy toor dal amti',
    approxCalories: 430,
    approxProtein: 16,
    approxCarbs: 68,
    approxFats: 7,
    benefits: 'Rich in iron, plant dietary fiber, and easily digestible dal protein'
  },
  {
    name: 'Egg Biryani with Cucumber & Mint Raita',
    regionalName: 'अंडा बिर्याणी आणि रायता',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: false,
    portion: '2 boiled eggs in fragrant spiced basmati rice + 1 bowl curd raita',
    approxCalories: 490,
    approxProtein: 22,
    approxCarbs: 70,
    approxFats: 12,
    benefits: 'Nutrient-rich complex carbohydrates paired with complete egg protein'
  },
  {
    name: 'Home-Style Chicken Curry with 3 Phulkas & Salad',
    regionalName: 'चिकन रस्सा, फुलके आणि सॅलड',
    category: 'Lunch',
    mealSlot: 'Lunch',
    dietaryPreference: 'Non-Vegetarian',
    isMaharashtrian: false,
    portion: '160g skinless chicken in light home gravy + 3 whole wheat rotis + green salad',
    approxCalories: 510,
    approxProtein: 40,
    approxCarbs: 52,
    approxFats: 13,
    benefits: 'Lean poultry protein delivering complete essential amino acids and zinc'
  },

  // EVENING SNACK
  {
    name: 'Roasted Chana (Phutana) & Jaggery with Glass of Milk',
    regionalName: 'फुटाणे, गूळ आणि दूध (Traditional Wrestling Staple)',
    category: 'Snack',
    mealSlot: 'Evening-Snack',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '50g roasted chana + 10g jaggery + 1 glass warm milk',
    approxCalories: 310,
    approxProtein: 16,
    approxCarbs: 44,
    approxFats: 6,
    benefits: 'Time-tested akhada snack rich in iron, zinc, and slow-burning energy'
  },
  {
    name: 'Masala Taak (Fresh Spiced Buttermilk)',
    regionalName: 'मसाला ताक (Maharashtra)',
    category: 'Beverage',
    mealSlot: 'Evening-Snack',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '1 large glass (300ml) with roasted cumin and coriander',
    approxCalories: 85,
    approxProtein: 5,
    approxCarbs: 8,
    approxFats: 3,
    benefits: 'Hydrating cooling drink full of natural probiotics, potassium, and sodium'
  },
  {
    name: 'Boiled Peanut Chaat with Onion & Tomatoes',
    regionalName: 'शेंगदाणा चाट',
    category: 'Snack',
    mealSlot: 'Evening-Snack',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '1 small bowl (80g)',
    approxCalories: 220,
    approxProtein: 9,
    approxCarbs: 16,
    approxFats: 14,
    benefits: 'Monounsaturated healthy fats, Vitamin E, and resveratrol'
  },
  {
    name: 'Boiled Eggs (2 whole) with Chaat Masala & Lemon',
    regionalName: 'मसाला उकडलेले अंडे',
    category: 'Snack',
    mealSlot: 'Evening-Snack',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: false,
    portion: '2 whole hard-boiled eggs with black pepper & lime',
    approxCalories: 155,
    approxProtein: 13,
    approxCarbs: 2,
    approxFats: 10,
    benefits: 'Fast, portable high-density protein snack packed with choline and lutein'
  },

  // DINNER
  {
    name: 'Multigrain Khichdi with Curd & Papad',
    regionalName: 'मूग डाळ खिचडी आणि दही',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '1.5 cups moong dal khichdi + 1 bowl fresh curd',
    approxCalories: 410,
    approxProtein: 17,
    approxCarbs: 64,
    approxFats: 8,
    benefits: 'Light restorative dinner promoting restful sleep and gut healing'
  },
  {
    name: 'Rajma / Chole with Jeera Rice & Green Salad',
    regionalName: 'राजमा / छोले भात',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1.5 bowls red kidney beans + 1 cup jeera rice',
    approxCalories: 470,
    approxProtein: 19,
    approxCarbs: 76,
    approxFats: 7,
    benefits: 'High fiber, complex starch, and sustained overnight amino acid release'
  },
  {
    name: 'Soy Chunks Curry with 3 Phulkas',
    regionalName: 'सोया चंक्स भाजी',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '50g dry soya chunks (cooked) + 3 whole wheat rotis',
    approxCalories: 440,
    approxProtein: 32,
    approxCarbs: 58,
    approxFats: 6,
    benefits: 'Extremely high vegetarian protein density (52% protein by dry weight)'
  },
  {
    name: 'Grilled Tandoori Chicken Tikka with Roti & Salad',
    regionalName: 'तंदुरी चिकन आणि फुलका',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Non-Vegetarian',
    isMaharashtrian: false,
    portion: '180g lean chicken breast tikka + 2 phulkas',
    approxCalories: 460,
    approxProtein: 44,
    approxCarbs: 34,
    approxFats: 11,
    benefits: 'High protein-to-calorie ratio, perfect for lean muscle and recovery'
  },
  {
    name: 'Egg Curry with 2 Phulkas & Rice',
    regionalName: 'अंडा करी और फुलका',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: false,
    portion: '2 whole eggs in onion-tomato gravy + 2 phulkas + half cup steamed rice',
    approxCalories: 440,
    approxProtein: 22,
    approxCarbs: 54,
    approxFats: 13,
    benefits: 'Easily assimilated nighttime protein with choline for neurological recovery'
  },
  {
    name: 'Palak Paneer with 3 Phulkas & Salad',
    regionalName: 'पालक पनीर आणि फुलका',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '120g paneer in fresh spinach gravy + 3 whole wheat rotis',
    approxCalories: 460,
    approxProtein: 22,
    approxCarbs: 52,
    approxFats: 15,
    benefits: 'High iron, calcium, and sustained-release micellar casein'
  },
  {
    name: 'Coastal Fish Fry with Yellow Dal & Steamed Rice',
    regionalName: 'तवा सुरमई / पापलेट फ्राय आणि वरण भात',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Non-Vegetarian',
    isMaharashtrian: true,
    portion: '150g pan-seared fish with semolina crust + 1 bowl dal + 1 cup rice',
    approxCalories: 490,
    approxProtein: 36,
    approxCarbs: 54,
    approxFats: 12,
    benefits: 'High omega-3 fatty acids, zinc, and pure muscle building lean protein'
  },
  {
    name: 'Matki Usal with 3 Phulkas & Fresh Curd',
    regionalName: 'मटकीची उसळ, फुलके आणि दही (Maharashtra)',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '1 bowl sprouted moth beans usal + 3 whole wheat rotis + 1 bowl curd',
    approxCalories: 420,
    approxProtein: 19,
    approxCarbs: 64,
    approxFats: 7,
    benefits: 'Living enzymes, plant protein, and slow-burning complex carbs for evening recovery'
  },
  {
    name: 'Egg Fried Rice with Mixed Vegetables & Raita',
    regionalName: 'एग फ्राईड राईस आणि रायता',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: false,
    portion: '2 scrambled eggs with 1.5 cups rice, carrots, beans + 1 bowl raita',
    approxCalories: 450,
    approxProtein: 20,
    approxCarbs: 66,
    approxFats: 11,
    benefits: 'Light, comforting evening meal rich in complete protein and potassium'
  },
  {
    name: 'Chicken Keema Curry with 3 Whole Wheat Phulkas & Salad',
    regionalName: 'चिकन खिमा आणि फुलके',
    category: 'Dinner',
    mealSlot: 'Dinner',
    dietaryPreference: 'Non-Vegetarian',
    isMaharashtrian: false,
    portion: '150g spiced lean minced chicken + 3 whole wheat rotis + cucumber tomato salad',
    approxCalories: 470,
    approxProtein: 42,
    approxCarbs: 48,
    approxFats: 12,
    benefits: 'Easily digestible nighttime lean protein for overnight muscle protein synthesis'
  },

  // POST-WORKOUT / ATHLETIC RECOVERY
  {
    name: 'Whey Protein Shake with Banana & Milk',
    regionalName: 'व्हे प्रोटीन शेक',
    category: 'Snack',
    mealSlot: 'Post-Workout',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1 scoop whey protein (30g) + 1 medium banana + 250ml low-fat milk',
    approxCalories: 310,
    approxProtein: 30,
    approxCarbs: 38,
    approxFats: 4,
    benefits: 'Fast-absorbing complete protein with potassium and natural sugars for rapid post-workout recovery'
  },
  {
    name: 'High-Protein Oats Bowl with Milk, Banana & Chia Seeds',
    regionalName: 'हाय-प्रोटीन ओट्स बाऊल',
    category: 'Snack',
    mealSlot: 'Post-Workout',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '50g oats + 1 glass warm milk + 1 banana + 1 tbsp chia seeds',
    approxCalories: 330,
    approxProtein: 16,
    approxCarbs: 56,
    approxFats: 6,
    benefits: 'Rapid glycogen replenishment, potassium for muscle cramping prevention, and healthy omega-3s'
  },
  {
    name: 'Overnight Oats with Fresh Dahi (Curd), Berries & Walnuts',
    regionalName: 'दही आणि ओट्स (Overnight Oats)',
    category: 'Snack',
    mealSlot: 'Post-Workout',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1 jar (50g rolled oats soaked in 150g fresh dahi + berries + 4 walnut halves)',
    approxCalories: 280,
    approxProtein: 14,
    approxCarbs: 42,
    approxFats: 7,
    benefits: 'Natural probiotics from fresh curd combined with prebiotic oat fiber for optimal digestion and recovery'
  },
  {
    name: 'Whey Protein Oats Bowl with Milk & Sliced Apples',
    regionalName: 'व्हे प्रोटीन ओट्स',
    category: 'Snack',
    mealSlot: 'Post-Workout',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: false,
    portion: '1 scoop whey protein (30g) + 40g oats + 200ml milk + 1/2 sliced apple',
    approxCalories: 360,
    approxProtein: 34,
    approxCarbs: 46,
    approxFats: 5,
    benefits: 'Fast-acting whey protein combined with sustaining oat carbs for ultimate post-workout muscle repair'
  },
  {
    name: 'Paneer Cubes with Black Pepper & 1 Ripe Banana',
    regionalName: 'पनीर आणि केळं',
    category: 'Snack',
    mealSlot: 'Post-Workout',
    dietaryPreference: 'Vegetarian',
    isMaharashtrian: true,
    portion: '80g raw/lightly tossed paneer + 1 Elaichi banana',
    approxCalories: 270,
    approxProtein: 16,
    approxCarbs: 31,
    approxFats: 12,
    benefits: 'Quick potassium for glycogen replenishment and protein for muscle synthesis'
  },
  {
    name: '3 Boiled Egg Whites + 1 Banana',
    regionalName: 'अंड्याचे पांढरे भाग आणि केळं',
    category: 'Snack',
    mealSlot: 'Post-Workout',
    dietaryPreference: 'Eggetarian',
    isMaharashtrian: false,
    portion: '3 egg whites + 1 medium Robusta banana',
    approxCalories: 175,
    approxProtein: 14,
    approxCarbs: 28,
    approxFats: 0.5,
    benefits: 'Ultra-fast gastric emptying and rapid insulin spike for glycogen storage'
  },
  {
    name: 'Grilled Chicken Breast (120g) with Sweet Potato',
    regionalName: 'ग्रिल्ड चिकन आणि रताळे',
    category: 'Snack',
    mealSlot: 'Post-Workout',
    dietaryPreference: 'Non-Vegetarian',
    isMaharashtrian: false,
    portion: '120g grilled breast + 100g steamed sweet potato with chaat masala',
    approxCalories: 260,
    approxProtein: 34,
    approxCarbs: 24,
    approxFats: 3,
    benefits: 'Pure lean protein and complex low-GI carbs for targeted muscle hypertrophy'
  }
];

/**
 * Filter foods strictly respecting the user's dietary preference
 */
function filterFoodsByDiet(foods, preference) {
  const pref = (preference || 'Vegetarian').toLowerCase();

  return foods.filter(food => {
    const foodPref = food.dietaryPreference.toLowerCase();

    if (pref === 'vegetarian') {
      return foodPref === 'vegetarian';
    } else if (pref === 'eggetarian') {
      return foodPref === 'vegetarian' || foodPref === 'eggetarian';
    } else {
      // Non-Vegetarian has access to all wholesome categories
      return true;
    }
  });
}

/**
 * Generate a complete, balanced Indian Meal Plan tailored to user's sport and biometrics
 */
function generateIndianMealPlan(userBiometrics = {}) {
  const {
    weight = 72,
    fitnessGoal = 'Sports performance',
    selectedSport = 'Gym',
    dietaryPreference = 'Vegetarian',
    targetCalories = 2500
  } = userBiometrics;

  const validFoods = filterFoodsByDiet(INDIAN_FOODS_DATABASE, dietaryPreference);
  const prefLower = (dietaryPreference || 'Vegetarian').toLowerCase();

  // Helper to pick items for a slot with preference prioritization and variety
  const pickMeal = (slot, count = 1) => {
    let slotFoods = validFoods.filter(f => f.mealSlot === slot);
    if (slotFoods.length === 0) {
      slotFoods = validFoods.slice();
    }

    const selected = [];

    if (prefLower === 'non-vegetarian') {
      const nonVegItems = slotFoods.filter(f => f.dietaryPreference === 'Non-Vegetarian');
      const eggItems = slotFoods.filter(f => f.dietaryPreference === 'Eggetarian');
      const vegItems = slotFoods.filter(f => f.dietaryPreference === 'Vegetarian');

      if (['Lunch', 'Dinner'].includes(slot) && nonVegItems.length > 0) {
        selected.push(nonVegItems[0]);
        if (count > 1) {
          const comp = vegItems.find(v => !v.name.includes('Bhakri') && !v.name.includes('bhakri')) || vegItems[0] || (nonVegItems.length > 1 ? nonVegItems[1] : null);
          if (comp) selected.push(comp);
        }
      } else if (slot === 'Breakfast') {
        const primary = nonVegItems[0] || eggItems[0] || vegItems[0];
        if (primary) selected.push(primary);
        if (count > 1) {
          const second = vegItems.find(v => v !== primary) || eggItems.find(e => e !== primary);
          if (second) selected.push(second);
        }
      } else if (slot === 'Post-Workout') {
        const pw = nonVegItems[0] || eggItems[0] || slotFoods[0];
        if (pw) selected.push(pw);
      } else {
        // Mid-morning and evening snack
        for (let i = 0; i < count && i < slotFoods.length; i++) {
          selected.push(slotFoods[i]);
        }
      }
    } else if (prefLower === 'eggetarian') {
      const eggItems = slotFoods.filter(f => f.dietaryPreference === 'Eggetarian');
      const vegItems = slotFoods.filter(f => f.dietaryPreference === 'Vegetarian');

      if (['Breakfast', 'Lunch', 'Dinner'].includes(slot) && eggItems.length > 0) {
        selected.push(eggItems[0]);
        if (count > 1) {
          const comp = vegItems.find(v => !v.name.includes('Bhakri') && !v.name.includes('bhakri')) || vegItems[0];
          if (comp) selected.push(comp);
        }
      } else if (slot === 'Post-Workout' && eggItems.length > 0) {
        selected.push(eggItems[0]);
      } else {
        for (let i = 0; i < count && i < slotFoods.length; i++) {
          selected.push(slotFoods[i]);
        }
      }
    } else {
      // Vegetarian: pick balanced variety (dal, paneer, roti, rice, idli - not all bhakri)
      if (slot === 'Lunch') {
        const protein = slotFoods.find(f => f.name.includes('Paneer') || f.name.includes('Dal') || f.name.includes('Rajma')) || slotFoods[0];
        const staple = slotFoods.find(f => f !== protein && (f.name.includes('Rice') || f.name.includes('Chawal') || f.name.includes('Varan') || f.name.includes('Chapati') || f.name.includes('Phulka') || f.name.includes('Roti'))) || slotFoods[1] || slotFoods[0];
        selected.push(protein);
        if (count > 1 && staple && staple !== protein) selected.push(staple);
      } else if (slot === 'Dinner') {
        const protein = slotFoods.find(f => f.name.includes('Soya') || f.name.includes('Rajma') || f.name.includes('Paneer')) || slotFoods[0];
        const staple = slotFoods.find(f => f !== protein && (f.name.includes('Khichdi') || f.name.includes('Rice') || f.name.includes('Roti') || f.name.includes('Phulkas'))) || slotFoods[1] || slotFoods[0];
        selected.push(protein);
        if (count > 1 && staple && staple !== protein) selected.push(staple);
      } else {
        for (let i = 0; i < count && i < slotFoods.length; i++) {
          selected.push(slotFoods[i]);
        }
      }
    }

    // Fill up to count if not reached
    while (selected.length < count && slotFoods.length > selected.length) {
      const next = slotFoods.find(f => !selected.includes(f));
      if (!next) break;
      selected.push(next);
    }

    return selected.map(f => ({
      foodName: f.name + (f.isMaharashtrian ? ' (Maharashtra)' : ''),
      portion: f.portion,
      approxCalories: f.approxCalories,
      approxProtein: f.approxProtein,
      approxCarbs: f.approxCarbs,
      approxFats: f.approxFats,
      note: f.benefits
    }));
  };

  const breakfast = pickMeal('Breakfast', 2);
  const midMorningSnack = pickMeal('Mid-Morning', 1);
  const lunch = pickMeal('Lunch', 2);
  const eveningSnack = pickMeal('Evening-Snack', 2);
  const dinner = pickMeal('Dinner', 2);
  const postWorkout = pickMeal('Post-Workout', 1);

  // Calculate approximate total macros
  const allItems = [...breakfast, ...midMorningSnack, ...lunch, ...eveningSnack, ...dinner, ...postWorkout];
  const totalCalories = allItems.reduce((s, i) => s + (i.approxCalories || 0), 0);
  const totalProtein = allItems.reduce((s, i) => s + (i.approxProtein || 0), 0);
  const totalCarbs = allItems.reduce((s, i) => s + (i.approxCarbs || 0), 0);
  const totalFats = allItems.reduce((s, i) => s + (i.approxFats || 0), 0);

  // Sport-specific focus statement
  let sportNutritionFocus = '';
  if (selectedSport === 'Gym') {
    sportNutritionFocus = `High-protein hypertrophy plan targeting ~${Math.round(weight * 1.8)}g protein with nutrient-dense Indian whole foods, high biological value protein, and complex grains.`;
  } else if (selectedSport === 'Cricket') {
    sportNutritionFocus = `Stamina and hydration endurance plan with complex carbohydrates (Roti, Upma, Fruits) and electrolyte recovery (Taak / Lemon water).`;
  } else {
    // Badminton
    sportNutritionFocus = `High-speed court agility plan focusing on rapid glycogen restoration, light gastric footprint, anti-inflammatory whole foods, and hydration.`;
  }

  return {
    selectedSport,
    dietaryPreference,
    fitnessGoal,
    targetDailyCalories: targetCalories,
    computedMealTotals: {
      calories: totalCalories,
      proteinGrams: totalProtein,
      carbsGrams: totalCarbs,
      fatsGrams: totalFats
    },
    sportNutritionFocus,
    hydrationGuideline: `Drink 3.2 to 3.8 Litres of water daily. Include 1 glass of Taak (buttermilk) after training for potassium and sodium replenishment.`,
    meals: {
      breakfast,
      midMorningSnack,
      lunch,
      eveningSnack,
      dinner,
      postWorkout
    },
    disclaimer: 'Nutritional figures are practical approximations calibrated from national Indian nutritional databases (NIN / ICMR) for general sports fitness monitoring.'
  };
}

/**
 * Generate 7-Day Weekly Training Schedule for Selected Sport
 */
function generateWeeklyWorkoutPlan(sport = 'Gym', goal = 'Sports performance') {
  if (sport === 'Cricket') {
    return [
      {
        day: 'Monday',
        focus: 'Interval Sprinting & Aerobic Base',
        isRestDay: false,
        exercises: [
          { name: '100m Shuttle Runs', sets: 6, reps: 'Max sprint', duration: '20 mins', restPeriod: '60s', completed: true },
          { name: 'Pitch Running Drill (2s & 3s simulation)', sets: 5, reps: 'Game speed', duration: '20 mins', restPeriod: '90s', completed: true },
          { name: 'Plank & Rotational Oblique Holds', sets: 3, reps: '60s each', duration: '15 mins', restPeriod: '45s', completed: false }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Net Batting & Footwork Precision',
        isRestDay: false,
        exercises: [
          { name: 'Front Foot Drive Repetitions (Throwdowns)', sets: 4, reps: '25 balls each', duration: '35 mins', restPeriod: '120s', completed: false },
          { name: 'Short Ball Defense & Pull Shots', sets: 4, reps: '20 balls each', duration: '30 mins', restPeriod: '120s', completed: false },
          { name: 'Ladder Footwork Drills', sets: 4, reps: '4 patterns', duration: '15 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Bowling Run-up Power & Shoulder Stability',
        isRestDay: false,
        exercises: [
          { name: 'Target Bowling (Spot bowling on good length)', sets: 6, reps: '6 balls per over', duration: '40 mins', restPeriod: '90s', completed: false },
          { name: 'Resistance Band Shoulder External Rotations', sets: 3, reps: '15 reps', duration: '15 mins', restPeriod: '45s', completed: false },
          { name: 'Medicine Ball Overhead Slams', sets: 4, reps: '12 reps', duration: '15 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Active Mobility & Lower Back Recovery',
        isRestDay: true,
        exercises: [
          { name: 'Hamstring & Hip Flexor PNF Stretching', sets: 3, reps: '45s holds', duration: '25 mins', restPeriod: '30s', completed: false },
          { name: 'Foam Rolling (Thoracic spine, quads, calves)', sets: 1, reps: 'Full body', duration: '20 mins', restPeriod: 'None', completed: false }
        ]
      },
      {
        day: 'Friday',
        focus: 'High Catching, Ground Fielding & Direct Hits',
        isRestDay: false,
        exercises: [
          { name: 'Slip Catcher Reaction Drills', sets: 5, reps: '15 catches', duration: '20 mins', restPeriod: '60s', completed: false },
          { name: 'Boundary Chasing & Slide Throw', sets: 6, reps: 'Max effort', duration: '25 mins', restPeriod: '90s', completed: false },
          { name: 'Single Stump Direct Hit Practice', sets: 4, reps: '10 throws', duration: '20 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Saturday',
        focus: 'Match Day (T20 League / Weekend Fixture)',
        isRestDay: false,
        exercises: [
          { name: 'Dynamic Pre-Match Activation', sets: 1, reps: '15 mins', duration: '15 mins', restPeriod: 'None', completed: false },
          { name: 'Full Competitive Match Session', sets: 1, reps: 'Match play', duration: '180 mins', restPeriod: 'Innings break', completed: false }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Complete Physiological Rest & Hydration',
        isRestDay: true,
        exercises: [
          { name: 'Gentle Walk or Light Swim', sets: 1, reps: 'Casual pace', duration: '30 mins', restPeriod: 'None', completed: false },
          { name: 'Mindfulness & Match Tape Review', sets: 1, reps: '1 session', duration: '30 mins', restPeriod: 'None', completed: false }
        ]
      }
    ];
  } else if (sport === 'Badminton') {
    return [
      {
        day: 'Monday',
        focus: 'Court Footwork Patterns (Shadow Badminton)',
        isRestDay: false,
        exercises: [
          { name: '6-Corner Shadow Footwork', sets: 5, reps: '2 mins continuous', duration: '25 mins', restPeriod: '60s', completed: true },
          { name: 'Split-Step & Chassé Drills', sets: 4, reps: '15 reps each side', duration: '20 mins', restPeriod: '45s', completed: true },
          { name: 'Jump Rope High-Speed Double Unders', sets: 4, reps: '100 skips', duration: '15 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Smash Power & Rotational Torso Strength',
        isRestDay: false,
        exercises: [
          { name: 'Steep Jump Smash Drills (Feeding)', sets: 5, reps: '20 smashes', duration: '30 mins', restPeriod: '90s', completed: false },
          { name: 'Dumbbell Wrist Curls & Forearm Pronation', sets: 4, reps: '15 reps', duration: '15 mins', restPeriod: '45s', completed: false },
          { name: 'Lateral Speed Bounders', sets: 4, reps: '12 bounds', duration: '15 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Net Play, Drops & Tactical Control',
        isRestDay: false,
        exercises: [
          { name: 'Tight Net Tumbling Spinning Shots', sets: 4, reps: '30 shuttles', duration: '25 mins', restPeriod: '60s', completed: false },
          { name: 'Fast Flat Drive Rallies (Half Court)', sets: 5, reps: '3 mins non-stop', duration: '25 mins', restPeriod: '90s', completed: false },
          { name: 'Reaction Light / Pointer Drill', sets: 4, reps: '1 min burst', duration: '15 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Active Mobility & Shoulder Decompression',
        isRestDay: true,
        exercises: [
          { name: 'Ankle Stability & Achilles Tendon Stretches', sets: 3, reps: '60s holds', duration: '20 mins', restPeriod: '30s', completed: false },
          { name: 'Rotator Cuff Theraband Conditioning', sets: 3, reps: '15 reps', duration: '15 mins', restPeriod: '45s', completed: false }
        ]
      },
      {
        day: 'Friday',
        focus: 'High Intensity Interval Rally Simulation',
        isRestDay: false,
        exercises: [
          { name: '2-on-1 Fast Attacking Drill', sets: 6, reps: '2 mins each', duration: '30 mins', restPeriod: '90s', completed: false },
          { name: 'Defensive Lift to Smash Counter-Attack', sets: 4, reps: '25 shuttles', duration: '20 mins', restPeriod: '60s', completed: false },
          { name: 'Core Hollow Body Holds', sets: 4, reps: '45s', duration: '15 mins', restPeriod: '45s', completed: false }
        ]
      },
      {
        day: 'Saturday',
        focus: 'Competitive Match Play (Best of 3 Sets)',
        isRestDay: false,
        exercises: [
          { name: 'Full Dynamic Warm-Up & Racket Clears', sets: 1, reps: '15 mins', duration: '15 mins', restPeriod: 'None', completed: false },
          { name: 'Singles League / Arena Matches', sets: 3, reps: 'To 21 points', duration: '75 mins', restPeriod: '10 mins', completed: false }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Joint Recovery & Epsom Salt Bath',
        isRestDay: true,
        exercises: [
          { name: 'Gentle Yoga / Prasarita Padottanasana', sets: 1, reps: '30 mins', duration: '30 mins', restPeriod: 'None', completed: false }
        ]
      }
    ];
  } else {
    // Gym / Hypertrophy Default Plan
    return [
      {
        day: 'Monday',
        focus: 'Push Day (Chest, Shoulders & Triceps)',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: 4, reps: '6-8 reps', duration: '18 mins', restPeriod: '120s', completed: true },
          { name: 'Standing Military Overhead Press', sets: 3, reps: '8-10 reps', duration: '15 mins', restPeriod: '90s', completed: true },
          { name: 'Incline Dumbbell Press (30° angle)', sets: 3, reps: '10-12 reps', duration: '14 mins', restPeriod: '90s', completed: true },
          { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12-15 reps', duration: '10 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Pull Day (Back, Rear Delts & Biceps)',
        isRestDay: false,
        exercises: [
          { name: 'Conventional Deadlift', sets: 4, reps: '5 reps', duration: '20 mins', restPeriod: '150s', completed: false },
          { name: 'Weighted Pull-Ups', sets: 3, reps: '6-8 reps', duration: '15 mins', restPeriod: '90s', completed: false },
          { name: 'Chest Supported T-Bar Row', sets: 3, reps: '10-12 reps', duration: '14 mins', restPeriod: '90s', completed: false },
          { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '12 reps', duration: '10 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Legs & Core Power',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, reps: '6-8 reps', duration: '20 mins', restPeriod: '120s', completed: false },
          { name: 'Romanian Deadlift (Hamstrings)', sets: 3, reps: '8-10 reps', duration: '15 mins', restPeriod: '90s', completed: false },
          { name: 'Bulgarian Split Squats', sets: 3, reps: '10 reps/leg', duration: '15 mins', restPeriod: '90s', completed: false },
          { name: 'Hanging Leg Raises', sets: 3, reps: '15 reps', duration: '10 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Active Rest & Dynamic Mobility',
        isRestDay: true,
        exercises: [
          { name: 'Thoracic & Hip Mobility Flow', sets: 1, reps: '20 mins', duration: '20 mins', restPeriod: 'None', completed: false },
          { name: 'Light Cardio (20 min brisk walk)', sets: 1, reps: 'Continuous', duration: '20 mins', restPeriod: 'None', completed: false }
        ]
      },
      {
        day: 'Friday',
        focus: 'Upper Body Hypertrophy Focus',
        isRestDay: false,
        exercises: [
          { name: 'Dumbbell Flat Bench Press', sets: 3, reps: '10-12 reps', duration: '15 mins', restPeriod: '90s', completed: false },
          { name: 'Lat Pulldowns (Wide Grip)', sets: 3, reps: '10-12 reps', duration: '14 mins', restPeriod: '75s', completed: false },
          { name: 'Dumbbell Lateral Raises (Side Delts)', sets: 4, reps: '15 reps', duration: '12 mins', restPeriod: '60s', completed: false },
          { name: 'Overhead Ez-Bar Skullcrushers', sets: 3, reps: '12 reps', duration: '12 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Saturday',
        focus: 'Lower Body Pump & Posterior Chain',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Hip Thrusts (Glutes)', sets: 4, reps: '10-12 reps', duration: '18 mins', restPeriod: '90s', completed: false },
          { name: 'Leg Press', sets: 3, reps: '12-15 reps', duration: '15 mins', restPeriod: '90s', completed: false },
          { name: 'Lying Hamstring Leg Curls', sets: 3, reps: '12 reps', duration: '12 mins', restPeriod: '60s', completed: false },
          { name: 'Standing Calf Raises', sets: 4, reps: '15-20 reps', duration: '10 mins', restPeriod: '60s', completed: false }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Complete Systemic Recovery',
        isRestDay: true,
        exercises: [
          { name: 'Hydration & Nutrition Prep', sets: 1, reps: 'Full day', duration: '15 mins', restPeriod: 'None', completed: false }
        ]
      }
    ];
  }
}

/**
 * High-level Diet Plan Generator compatible with dietRoutes.js
 */
function generateDietPlan(params = {}) {
  const mealPlan = generateIndianMealPlan({
    weight: params.weight || 72,
    fitnessGoal: params.fitnessGoal || 'General fitness',
    selectedSport: params.sport || 'Gym',
    dietaryPreference: params.dietaryPreference || 'Vegetarian',
    targetCalories: params.targetCalories || 2500
  });

  return {
    ...mealPlan,
    macroTargets: {
      proteinGrams: mealPlan.computedMealTotals.proteinGrams,
      carbsGrams: mealPlan.computedMealTotals.carbsGrams,
      fatsGrams: mealPlan.computedMealTotals.fatsGrams
    }
  };
}

/**
 * Sport-specific AI training recommendation generators
 */
function getGymRecommendations(user = {}, recentWorkouts = []) {
  const goal = user.fitnessGoal || 'Hypertrophy / Muscle Building';
  return {
    routineFocus: goal.includes('Weight Loss') ? 'Metabolic Resistance & High Density' : 'Hypertrophy & Progressive Overload',
    targetVolume: '14-18 sets per muscle group / week',
    recoveryAdvice: 'Allow 48-72 hours between heavy sessions targeting the same muscle group.',
    nutritionTip: `Aim for ${Math.round((user.weight || 72) * 1.8)}g protein daily using wholesome Indian legumes, paneer, and eggs/chicken.`,
    nextSuggestedWorkouts: [
      { name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10', targetRPE: 8 },
      { name: 'Barbell Back Squat', sets: 4, reps: '6-8', targetRPE: 8 },
      { name: 'Bent Over Barbell Rows', sets: 4, reps: '8-10', targetRPE: 8 }
    ],
    weeklyPlan: generateWeeklyWorkoutPlan('Gym', goal)
  };
}

function getCricketRecommendations(user = {}, recentSessions = []) {
  return {
    staminaFocus: 'Aerobic Base & High-Intensity Interval Running',
    bowlingAdvice: 'Target steady 4-6 over spells; maintain rotator cuff stability with resistance bands.',
    battingTip: 'Focus on front foot balance and quick 2s pitch sprinting drills.',
    hydrationTip: 'Hydrate with nimbu pani or electrolyte water every 30 minutes in outdoor conditions.',
    weeklyPlan: generateWeeklyWorkoutPlan('Cricket', user.fitnessGoal)
  };
}

function getBadmintonRecommendations(user = {}, recentSessions = []) {
  return {
    agilityFocus: '6-corner shadow footwork and explosive split-step reaction.',
    smashAdvice: 'Engage forearm pronation and core torque rather than pure arm pulling.',
    recoveryAdvice: 'Perform deep static stretching for calves, Achilles tendon, and hamstrings.',
    nutritionTip: 'Light pre-match meal 90 mins prior; replenish with coconut water / Taak after matches.',
    weeklyPlan: generateWeeklyWorkoutPlan('Badminton', user.fitnessGoal)
  };
}

module.exports = {
  INDIAN_FOODS_DATABASE,
  filterFoodsByDiet,
  generateIndianMealPlan,
  generateDietPlan,
  generateWeeklyWorkoutPlan,
  getGymRecommendations,
  getCricketRecommendations,
  getBadmintonRecommendations
};
