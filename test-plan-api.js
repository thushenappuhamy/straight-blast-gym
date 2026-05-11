const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const JWT_SECRET = 'straight-blast-gym-secret-key-2024-change-in-production';
const MONGO_URI = 'mongodb+srv://gymadmin:gadaya%402003@straightblastgym.amatibx.mongodb.net/?appName=StraightBlastGym';
const BASE_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';

async function test() {
  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('gym');
    
    // Create or get test user
    let user = await db.collection('users').findOne({ email: 'apitester@test.com' });
    if (!user) {
      const result = await db.collection('users').insertOne({
        email: 'apitester@test.com',
        password: 'hashedpass',
        name: 'API Tester',
        role: 'user',
        createdAt: new Date(),
      });
      user = { _id: result.insertedId };
      console.log('✅ Created test user');
    } else {
      console.log('✅ Found existing test user');
    }
    
    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role || 'user',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Generated token:', token.substring(0, 50) + '...');
    
    // Prepare request body
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
    
    console.log('\n🔍 Testing Plan Generation API...');
    console.log('- Requesting: 4 meals per day');
    console.log('- Workouts: 4 days per week');
    
    // Call the API
    const response = await fetch(`${BASE_URL}/api/health/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authToken=${token}`,
      },
      body: JSON.stringify(testQuestionnaire),
    });
    
    const data = await response.json();
    
    if (response.status !== 200) {
      console.error('❌ API Error:', data);
      client.close();
      return;
    }
    
    console.log('✅ API Response received\n');
    
    // Analyze response
    if (data.data) {
      const wp = data.data.workoutPlan;
      const mp = data.data.mealPlan;
      
      console.log('📊 WORKOUT PLAN ANALYSIS:');
      console.log('- Title:', wp.title);
      console.log('- Level:', wp.level);
      console.log('- Full workout data:', JSON.stringify(wp.weeks?.[0]?.days?.[0], null, 2).substring(0, 300));
      if (wp.weeks && wp.weeks[0] && wp.weeks[0].days) {
        console.log('- Total workout days:', wp.weeks[0].days.length);
        wp.weeks[0].days.forEach((day, idx) => {
          console.log(`\n  Day ${idx + 1} (${day.day}):`);
          if (day.exercises && day.exercises.length > 0) {
            console.log(`    Exercises: ${day.exercises.length}`);
            day.exercises.slice(0, 3).forEach((ex, i) => {
              console.log(`      ${i + 1}. ${ex.name || '(no name)'} - Sets: ${ex.sets}, Reps: ${ex.reps}`);
            });
          } else {
            console.log('    No exercises found');
          }
        });
      }
      
      console.log('\n📊 MEAL PLAN ANALYSIS:');
      console.log('- Goal:', mp.goal);
      console.log('- Meals per day (from data):', mp.mealsPerDay);
      console.log('- Full meal data:', JSON.stringify(mp.weeks?.[0]?.days?.[0]?.meals, null, 2).substring(0, 300));
      if (mp.weeks && mp.weeks[0] && mp.weeks[0].days) {
        mp.weeks[0].days.forEach((day, idx) => {
          const mealCount = day.meals?.length || 0;
          console.log(`  Day ${idx + 1} (${day.day}): ${mealCount} meals ${mealCount === 4 ? '✅' : '❌'}`);
          if (day.meals) {
            day.meals.forEach((meal, i) => {
              console.log(`    ${i + 1}. ${meal.type || 'Unknown'} - ${meal.calories || '?'} cals`);
            });
          }
        });
      }
      
      // Check for issues
      console.log('\n🔍 ISSUE CHECK:');
      let issues = [];
      
      if (mp.weeks && mp.weeks[0] && mp.weeks[0].days) {
        mp.weeks[0].days.forEach((day) => {
          const mealCount = day.meals?.length || 0;
          if (mealCount !== 4) {
            issues.push(`❌ ${day.day}: Expected 4 meals, got ${mealCount}`);
          }
        });
      }
      
      if (wp.weeks && wp.weeks[0] && wp.weeks[0].days) {
        const exercises = new Set();
        wp.weeks[0].days.forEach((day) => {
          day.exercises?.forEach((ex) => {
            exercises.add(ex.name);
          });
        });
        
        if (exercises.size < wp.weeks[0].days.length * 2) {
          issues.push(`⚠️  Low exercise variety: only ${exercises.size} unique exercises across ${wp.weeks[0].days.length} days`);
        }
      }
      
      if (issues.length === 0) {
        console.log('✅ All checks passed!');
      } else {
        issues.forEach(issue => console.log(issue));
      }
    }
    
    client.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.status, err.response.statusText);
    }
  }
}

test();
