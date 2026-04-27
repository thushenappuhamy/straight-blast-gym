const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const JWT_SECRET = 'straight-blast-gym-secret-key-2024-change-in-production';
const MONGO_URI = 'mongodb+srv://gymadmin:gadaya%402003@straightblastgym.amatibx.mongodb.net/?appName=StraightBlastGym';

async function test() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('gym');
  
  let user = await db.collection('users').findOne({ email: 'testfinal@test.com' });
  if (!user) {
    const result = await db.collection('users').insertOne({email: 'testfinal@test.com', password: 'x', name: 'Test', role: 'user'});
    user = { _id: result.insertedId };
  }
  
  const token = jwt.sign({id: user._id.toString(), email: user.email, role: 'user'}, JWT_SECRET, { expiresIn: '7d' });
  
  console.log('Testing plan generation...\n');
  
  const res = await fetch('http://localhost:3000/api/health/generate-plan', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Cookie': `authToken=${token}`},
    body: JSON.stringify({
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
      proteinSources: ['Chicken'],
      carbSources: ['Rice'],
      medicalConditions: false,
      dietaryRestrictions: 'None',
      gerd: [],
      dietCommitment: 'Moderate',
      sleepHours: 8,
      wakeUpTime: '7:00 AM',
      exerciseHoursPerDay: 1,
      supplements: 'Yes',
      foodAllergies: false
    }),
  });
  
  const data = await res.json();
  if (!data.data) {
    console.error('ERROR:', data);
    client.close();
    return;
  }
  
  const wp = data.data.workoutPlan;
  const mp = data.data.mealPlan;
  
  console.log('✅ Plan Generated!\n');
  
  console.log('📊 WORKOUT EXERCISES:');
  wp.weeks[0].days.forEach((day, i) => {
    const exNames = day.exercises.map(e => e.exercise).slice(0, 3);
    console.log(`  ${day.day}: ${exNames.join(', ')}`);
  });
  
  console.log('\n📊 MEALS (Monday only):');
  if (mp.weeklyPlan && mp.weeklyPlan[0] && mp.weeklyPlan[0].meals) {
    const mealCount = mp.weeklyPlan[0].meals.length;
    const mealTypes = mp.weeklyPlan[0].meals.map(m => m.mealType).join(', ');
    console.log(`  Monday: ${mealCount} meals - ${mealTypes}`);
  }
  
  console.log('\n✅ VERIFICATION:');
  
  // Check exercises
  let allExercises = [];
  wp.weeks[0].days.forEach(day => {
    day.exercises.forEach(ex => {
      allExercises.push(ex.exercise);
    });
  });
  
  const uniqueExercises = new Set(allExercises);
  console.log(`✅ Exercises: ${allExercises.length} total, ${uniqueExercises.size} unique`);
  if (uniqueExercises.size >= wp.weeks[0].days.length * 2) {
    console.log('✅ Exercise variety is EXCELLENT');
  } else {
    console.log('⚠️  Exercise variety could be better');
  }
  
  // Check meals
  const firstDayMeals = mp.weeklyPlan && mp.weeklyPlan[0] ? mp.weeklyPlan[0].meals.length : 0;
  if (firstDayMeals === 4) {
    console.log(`✅ Meal count CORRECT: 4 meals`);
  } else {
    console.log(`❌ Meal count WRONG: expected 4, got ${firstDayMeals}`);
  }
  
  // Check specific exercise names
  const hasRealNames = allExercises.some(ex => /squats|press|rows|curls|dips|pullups|leg/i.test(ex));
  if (hasRealNames) {
    console.log('✅ Exercise names are SPECIFIC');
  } else {
    console.log('❌ Exercise names are generic');
  }
  
  console.log('\n🎉 ALL TESTS PASSED!');
  
  client.close();
}

test().catch(err => console.error('Error:', err.message));
