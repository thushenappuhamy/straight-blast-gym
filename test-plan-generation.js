const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Create a test token
const userId = '507f1f77bcf86cd799439011'; // Test ID
const JWT_SECRET = 'straight-blast-gym-secret-key-2024-change-in-production';

const token = jwt.sign(
  {
    id: userId,
    email: 'test@example.com',
    role: 'user',
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Testing Plan Generation API...\n');

const testQuestionnaire = {
  name: 'Test User',
  age: 30,
  height: 180,
  weight: 80,
  goal: 'Muscle Gain',
  mealsPerDay: 4,
  daysPerWeek: 4,
  physicalActivityLevel: 'Sedentary',
  exerciseBackground: ['Gym'],
  exerciseCapability: 'Gym',
  commitmentPeriod: '12 weeks',
  proteinSources: ['Chicken', 'Fish'],
  carbSources: ['Rice', 'Oats'],
  medicalConditions: false,
  dietaryRestrictions: 'None',
  gerd: [],
  dietCommitment: 'Moderate',
  sleepHours: 8,
  wakeUpTime: '7:00 AM',
  exerciseHoursPerDay: 1,
  supplements: 'Yes',
  foodAllergies: false,
};

fetch('http://localhost:3000/api/health/generate-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `authToken=${token}`,
  },
  body: JSON.stringify(testQuestionnaire),
})
  .then((res) => res.json())
  .then((data) => {
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.data) {
      const wp = data.data.workoutPlan;
      const mp = data.data.mealPlan;
      
      console.log('\n📊 WORKOUT PLAN:');
      console.log('- Title:', wp.title);
      console.log('- Level:', wp.level);
      if (wp.weeks && wp.weeks[0] && wp.weeks[0].days) {
        console.log('- Workout Days:', wp.weeks[0].days.length);
        wp.weeks[0].days.forEach((day) => {
          console.log(`  ${day.day}: ${day.exercises?.length || 0} exercises`);
        });
      }
      
      console.log('\n📊 MEAL PLAN:');
      console.log('- Goal:', mp.goal);
      console.log('- Meals per day setting:', mp.mealsPerDay);
      if (mp.weeks && mp.weeks[0] && mp.weeks[0].days) {
        console.log('- Days in plan:', mp.weeks[0].days.length);
        mp.weeks[0].days.forEach((day) => {
          const mealCount = day.meals?.length || 0;
          console.log(`  ${day.day}: ${mealCount} meals`);
          if (day.meals) {
            day.meals.forEach((meal) => {
              console.log(`    - ${meal.type}: ${meal.calories} cals`);
            });
          }
        });
      }
    }
  })
  .catch((err) => console.error('❌ Error:', err));
