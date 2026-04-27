# Fitness Level Detection & Professional Workout Split Generation

## 🎯 Overview

The plan generation system now intelligently detects the user's fitness level and generates appropriately scaled workout programs:
- **Beginner**: Full body workouts (6 exercises, 1 per muscle group)
- **Intermediate**: Upper/Lower or Push/Pull/Legs split (6-7 exercises per session)
- **Advanced**: Advanced splits (8-10 exercises per session with advanced techniques)

## 🔍 Fitness Level Detection Algorithm

### Detection Criteria

The system analyzes questionnaire answers to determine fitness level through a scoring mechanism:

#### 1. **Physical Activity Level** (Most Important - Highest Weight)
**New question added**: "How Physically Active Are You Currently?"

Options and weights:
- **"Significant Exercise"** (Gym, Jogging often, carry weights) → +3 Advanced points
- **"Moderate Exercise"** (household weights, walks, light sweat) → +2 Intermediate points  
- **"Mild Exercise"** (walking to store, stairs) → +1 Intermediate point
- **"Sedentary"** (no exertion) → No points (Beginner baseline)

#### 2. **Exercise Background**
- **Athlete** → +3 Advanced points
- **Very Active** → +2 Advanced points
- **Moderate Activity** → +2 Intermediate points
- **Light Activity / Sedentary** → No points

#### 3. **Training Frequency (Days Per Week)**
- **5-7 days/week** → +2 Advanced points
- **3-4 days/week** → +1 Intermediate point
- **1-2 days/week** → No points

#### 4. **Exercise Location**
- **Both (Gym + Home)** → +1 Advanced point
- **Gym** → +1 Intermediate point
- **Home / Outdoor** → No points

#### 5. **Health Status**
- **No medical conditions** → +1 Intermediate point
- **Has medical conditions** → No points (may limit intensity)

#### 6. **Commitment Period**
- **16 weeks** → +1 Advanced point
- **Shorter periods** → No points

### Classification Logic

```
If Advanced Indicators ≥ 4 → ADVANCED
Else if Intermediate Indicators ≥ 3 OR Advanced Indicators ≥ 2 → INTERMEDIATE
Else → BEGINNER
```

## 📋 Workout Split Structures

### BEGINNER - Full Body Workouts

**Target**: Complete beginners with minimal or no training experience

**Structure**:
- **Exercises per session**: 6 (exactly one per major muscle group)
- **Sets**: 3 sets per exercise
- **Reps**: 12-15 reps (higher reps, lighter weight)
- **Rest between sets**: 60-90 seconds
- **Session duration**: 45-60 minutes (including warm-up/cool-down)
- **Frequency**: 3-4 days per week with rest days between

**Exercise Order** (Always this order for balance):
1. **Legs** - Squats, Leg Press, Hack Squat, or Leg Extensions
2. **Chest** - Bench Press, Dumbbell Press, or Machine Press
3. **Back** - Rows, Lat Pulldowns, or Assisted Pull-ups
4. **Shoulders** - Military Press, Dumbbell Shoulder Press
5. **Triceps** - Tricep Dips, Pushdowns, Overhead Extensions
6. **Biceps** - Bicep Curls, Dumbbell Curls

**Focus**:
- Form and technique mastery
- Building work capacity
- Consistency and habit formation
- Light to moderate weight
- Progressive overload through higher reps or slightly heavier weight

**Example Beginner Session**:
```
Warm-up: 5-10 minutes (light cardio + dynamic stretching)

1. Squats: 3 sets × 12-15 reps, 90s rest
2. Bench Press: 3 sets × 12-15 reps, 90s rest
3. Barbell Rows: 3 sets × 12-15 reps, 90s rest
4. Military Press: 3 sets × 12-15 reps, 90s rest
5. Tricep Dips (Assisted): 3 sets × 12-15 reps, 60s rest
6. Barbell Curls: 3 sets × 12-15 reps, 60s rest

Cool-down: 5-10 minutes (light stretching)
Total: ~55 minutes
```

---

### INTERMEDIATE - Upper/Lower or Push/Pull/Legs Split

**Target**: Individuals with 6-12 months consistent training experience

**Structure**:
- **Exercises per session**: 6-7 exercises
- **Sets**: 3-4 sets per exercise
- **Reps**: 8-12 reps (hypertrophy range)
- **Rest between sets**: 90-120 seconds
- **Session duration**: 60-75 minutes
- **Frequency**: 4-5 days per week

**Program Options**:

**Option A - Upper/Lower Split** (4 days):
- Day 1: Upper Body A (Chest/Back focus)
- Day 2: Lower Body A (Quads focus)
- Day 3: Rest
- Day 4: Upper Body B (Shoulder/Back focus)
- Day 5: Lower Body B (Hamstring/Glute focus)

**Option B - Push/Pull/Legs** (3 days per rotation):
- Day 1: Push (Chest, Shoulders, Triceps) - 6-7 exercises
- Day 2: Pull (Back, Biceps) - 6-7 exercises
- Day 3: Legs - 6-7 exercises

**Advanced Intermediate Techniques**:
- Drop sets (1-2 per session)
- Supersets (2 exercises back-to-back)
- Compound + Isolation pairings
- Progressive overload: increasing weight, volume, or density

**Example Intermediate Upper Body Session**:
```
Warm-up: 10 minutes

1. Barbell Bench Press: 4 sets × 8-10 reps, 120s rest
2. Bent-Over Rows: 4 sets × 8-10 reps, 120s rest
3. Dumbbell Incline Press: 3 sets × 10-12 reps, 90s rest
4. Pull-ups: 3 sets × 8-12 reps, 90s rest
5. Chest Flyes (Supersetted with Reverse Flyes): 3 sets × 12 reps, 60s rest
6. Barbell Curls: 3 sets × 10-12 reps, 60s rest

Cool-down: 10 minutes
Total: ~70 minutes
```

---

### ADVANCED - 5-6 Day Professional Split

**Target**: Experienced lifters with 2+ years consistent training, or competitive athletes

**Structure**:
- **Exercises per session**: 8-10 exercises
- **Sets**: 4-5 sets per exercise
- **Reps**: 6-10 reps (heavy strength), 8-12 reps (hypertrophy)
- **Rest between sets**: 120-180 seconds
- **Session duration**: 75-90 minutes
- **Frequency**: 5-6 days per week

**5-Day Advanced Split**:
- Day 1: Chest & Triceps
- Day 2: Back & Biceps
- Day 3: Legs (Quads focus)
- Day 4: Shoulders & Traps
- Day 5: Legs (Hamstring/Glute focus)
- Day 6 (optional): Weak point or cardio

**Advanced Techniques**:
- Drop sets, double drop sets
- Supersets, tri-sets, giant sets
- Tempo training (3 seconds down, 1 second up)
- Rest-pause sets
- Cluster sets
- Periodization: Strength phase → Hypertrophy phase → Endurance phase
- Deload weeks every 4-6 weeks (50-70% intensity)

**Example Advanced Chest & Triceps Session**:
```
Warm-up: 15 minutes (dynamic + activation)

1. Barbell Bench Press (Heavy): 5 sets × 6-8 reps, 180s rest
2. Incline Dumbbell Press: 4 sets × 8-10 reps, 120s rest
3. Cable Flyes (Supersetted with Pushups): 4 sets × 10-12 reps, 90s rest
4. Machine Chest Press: 3 sets × 12 reps, 60s rest
5. Close-Grip Bench: 4 sets × 8-10 reps, 120s rest
6. Dips (Weighted): 3 sets × 8-10 reps, 90s rest
7. Rope Pushdowns (Drop set): 3 sets × 10-12 reps, 60s rest
8. Tricep Kickbacks: 2 sets × 12-15 reps, 45s rest

Cool-down: 10 minutes
Total: ~85 minutes
```

---

## 🧠 Algorithm Scoring Example

### Example 1: Sedentary Beginner
```
Physical Activity: Sedentary → 0 points
Exercise Background: Sedentary → 0 points
Days/Week: 2 days → 0 points
Exercise Location: Home → 0 points
Medical Conditions: Yes → 0 points
Commitment: 8 weeks → 0 points

Total: 0 Advanced, 0 Intermediate → BEGINNER ✓
```

### Example 2: Active Intermediate
```
Physical Activity: Moderate Exercise → +2 Intermediate
Exercise Background: Moderate Activity → +2 Intermediate
Days/Week: 4 days → +1 Intermediate
Exercise Location: Both → +1 Advanced
Medical Conditions: No → +1 Intermediate
Commitment: 12 weeks → 0 points

Total: 1 Advanced, 5 Intermediate → INTERMEDIATE ✓
```

### Example 3: Serious Advanced
```
Physical Activity: Significant Exercise → +3 Advanced
Exercise Background: Very Active → +2 Advanced
Days/Week: 6 days → +2 Advanced
Exercise Location: Both → +1 Advanced
Medical Conditions: No → +1 Intermediate
Commitment: 16 weeks → +1 Advanced

Total: 9 Advanced, 1 Intermediate → ADVANCED ✓
```

---

## 📝 Questionnaire Questions Used for Detection

**Most Critical**:
1. "How Physically Active Are You Currently?" ← **NEW QUESTION** (Screenshot matched)
2. "Exercise Background" (Checkboxes: Sedentary, Light, Moderate, Very Active, Athlete)

**Supporting**:
3. Days Per Week (Number selector)
4. Where Do You Exercise? (Home, Gym, Both, Outdoor)
5. Medical Conditions? (Yes/No)
6. Commitment Period (4-16 weeks)

---

## 🔄 Generator Prompt Instructions

The AI receives specific instructions based on detected level:

### BEGINNER Instruction:
```
CRITICAL INSTRUCTION FOR BEGINNER:
- Create a FULL BODY WORKOUT with exactly 6 exercises
- Each workout session targets ALL major muscle groups with ONE exercise per muscle
- Exercise order: 1) Legs, 2) Chest, 3) Back, 4) Shoulders, 5) Triceps, 6) Biceps
- Focus on form, light to moderate weight, and consistency
- Rest days between sessions
- Keep workouts 45-60 minutes total including warm-up/cool-down
- Emphasize progressive overload with lighter weight and higher reps (12-15 range)
```

### INTERMEDIATE Instruction:
```
CRITICAL INSTRUCTION FOR INTERMEDIATE:
- Create an UPPER/LOWER SPLIT or PUSH/PULL/LEGS split
- Include 6-7 exercises per session
- Include at least one compound lift per day
- Sets: 3-4 sets per exercise, Rep ranges: 8-12 reps
- Total workout duration: 60-75 minutes
- Include drop sets or supersets for 1-2 exercises per session
```

### ADVANCED Instruction:
```
CRITICAL INSTRUCTION FOR ADVANCED:
- Create an ADVANCED SPLIT (5-6 day split)
- Include 8-10 exercises per workout session
- Advanced techniques: Drop sets, supersets, tri-sets, tempo training, rest-pause sets
- Sets: 4-5 sets per exercise, Rep ranges: 6-10 reps for heavy, 8-12 for hypertrophy
- Total workout duration: 75-90 minutes
- Implement periodized programming with deload weeks
```

---

## ✅ Validation & Testing

**Test Cases**:

1. **Beginner** (Sedentary + No gym + 2 days/week)
   - Should generate 6-exercise full body workouts
   - Higher rep ranges (12-15)
   - Shorter duration (45-60 min)

2. **Intermediate** (Mild Exercise + Both locations + 4 days/week)
   - Should generate 6-7 exercise splits
   - Medium rep ranges (8-12)
   - Medium duration (60-75 min)

3. **Advanced** (Significant Exercise + Gym + 5-6 days/week)
   - Should generate 8-10 exercise splits
   - Lower rep ranges (6-10) with hypertrophy (8-12)
   - Longer duration (75-90 min)
   - Advanced techniques included

---

## 🚀 Professional Benefits

✅ **Individualized programming** - Each client gets appropriate complexity
✅ **Progressive approach** - Beginners build gradually
✅ **Injury prevention** - Beginners focus on form, not weight
✅ **Scalable difficulty** - Plans grow with client experience
✅ **Evidence-based** - Follows fitness industry best practices
✅ **AI-powered depth** - LLaMA generates specific exercises tailored to goals
✅ **Compliance** - Appropriate difficulty increases adherence
✅ **Long-term success** - Proper progression prevents plateaus

---

## 📊 Data Integration

**Database Models**:
- `Questionnaire` - Stores all questionnaire responses
- `WorkoutPlan` - Stores generated workout (includes level, exercises, sets, reps)
- `MealPlan` - Stores generated nutrition plan

**API Endpoint**:
- `POST /api/health/generate-plan` - Takes questionnaire, returns workout + meal plan with detected level

---

## 🎨 UI Display

The dashboard shows:
- Selected fitness level in the generated plan
- Appropriate exercise count badge
- Estimated workout duration
- Rep ranges and set counts matching level
- Expandable weeks/days to view specific exercises

