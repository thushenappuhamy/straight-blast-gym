const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const JWT_SECRET = 'straight-blast-gym-secret-key-2024-change-in-production';
const MONGO_URI = 'mongodb+srv://gymadmin:gadaya%402003@straightblastgym.amatibx.mongodb.net/?appName=StraightBlastGym';
const BASE_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';

async function test() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('gym');
  
  let user = await db.collection('users').findOne({ email: 'testdebug@test.com' });
  if (!user) {
    const result = await db.collection('users').insertOne({email: 'testdebug@test.com', password: 'x', name: 'Test', role: 'user'});
    user = { _id: result.insertedId };
  }
  
  const token = jwt.sign({id: user._id.toString(), email: user.email, role: 'user'}, JWT_SECRET, { expiresIn: '7d' });
  
  console.log('Testing plan generation...\n');
  
  const res = await fetch(`${BASE_URL}/api/health/generate-plan`, {
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
  
  console.log('Full Response Structure:');
  console.log('Workout Plan keys:', Object.keys(wp));
  console.log('Meal Plan keys:', Object.keys(mp));
  
  console.log('\nWorkout Day 0 structure:', JSON.stringify(wp?.weeks?.[0]?.days?.[0], null, 2).substring(0, 300));
  console.log('\nMeal Plan days structure:', JSON.stringify(mp?.weeks?.[0]?.days, null, 2).substring(0, 200));
  
  if (wp?.weeks?.[0]?.days?.[0]?.exercises) {
    console.log('\n✅ Exercises found!');
    console.log('First 3 exercises:', wp.weeks[0].days[0].exercises.slice(0, 3).map(e => ({name: e.name, sets: e.sets})));
  } else {
    console.log('\n❌ No exercises in structure');
  }
  
  if (mp?.weeks?.[0]?.days?.[0]?.meals) {
    console.log('\n✅ Meals found!');
    console.log('Meals:', mp.weeks[0].days[0].meals.map(m => ({type: m.type, calories: m.calories})));
  } else {
    console.log('\n❌ No meals in structure');
  }
  
  client.close();
}

test().catch(err => console.error('Error:', err.message));
