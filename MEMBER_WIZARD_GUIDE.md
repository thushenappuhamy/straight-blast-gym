# 🏋️ Multi-Step Member Registration Wizard - Complete Guide

## 📋 Overview
A professional, multi-step member registration wizard that guides admins through a comprehensive onboarding process. This replaces the simple modal with a complete form that collects all necessary member information in logical steps.

---

## 🎯 Features Implemented

### ✅ Step 1: Personal Information
**Form Fields:**
- **First Name** (Required) - Member's first name
- **Last Name** (Required) - Member's last name
- **Email Address** (Required) - Valid email format enforced
- **Phone Number** (Required) - Contact number (e.g., +94 123 456 7890)
- **Date of Birth** (Required) - Calendar date picker for easy selection
  - 📅 Click the calendar icon to open date picker
  - Auto-validates year/month/day format
- **Age** (Auto-calculated) - Automatically fills when DOB is selected
  - Calculates accurate age in years
  - Updates in real-time as DOB changes
- **Gender** (Required) - Dropdown: Male, Female, Other

**Validation:**
- All required fields must be completed
- Email must contain '@' symbol
- Age auto-calculated from DOB (no manual entry needed)
- Cannot proceed to next step without completing Step 1

---

### ✅ Step 2: Location Information
**Form Fields:**
- **Country** (Required) - e.g., "Sri Lanka"
- **City** (Required) - e.g., "Negombo"
- **Zipcode** (Required) - Postal/ZIP code
- **Address** (Required) - Full street address

**Validation:**
- All fields required
- Cannot proceed without completing all location fields

---

### ✅ Step 3: Membership & Fitness Details
**Form Fields:**
- **Fitness Goals** (Required) - Multi-select checkboxes:
  - Weight Loss
  - Muscle Gain
  - Strength
  - Flexibility
  - Overall Health
  - Endurance
  - Can select multiple goals
  
- **Membership Package** (Required) - Dropdown:
  - Basic (LKR 2,500/month)
  - Gold (LKR 5,000/month)
  - Elite (LKR 8,000/month)

- **Membership Start Date** (Required) - Calendar date picker
  - Defaults to today's date
  - Can be changed to any future date

- **Assign Trainer** (Optional) - Dropdown:
  - Lists all available trainers from system
  - Leave empty if no trainer assignment needed
  - Dynamically loads trainer list when Step 3 opens

**Validation:**
- At least one fitness goal must be selected
- Membership package is mandatory
- Start date is mandatory

---

## 🚀 Navigation

### Next Button (Steps 1 & 2)
- Validates current step
- Shows error message if validation fails
- Moves to next step if all validations pass
- Progress bar updates to show advancement

### Back Button (Steps 2 & 3)
- Allows returning to previous step
- Retains all entered data
- No validation required when going back

### Cancel Button
- Closes wizard at any step
- Discards all entered data
- No confirmation needed

### Finish Button (Step 3 Only)
- Final validation of Step 3 fields
- Sends complete member profile to API
- Shows loading state while processing
- Closes wizard on success
- Shows error message if API call fails
- Auto-refreshes member list after successful creation

---

## 💾 Data Flow

### Input → Processing → Database

1. **Form Input**: Admin enters data across 3 steps
2. **Validation**: Local validation on navigation
3. **API Call**: Complete profile sent to `/api/admin/members` POST endpoint
4. **Password**: System generates temporary password (10 random characters)
5. **Database Storage**: All data saved with new member record:
   - Personal info (name, email, phone, DOB, age, gender)
   - Location info (country, city, zipcode, address)
   - Membership info (plan, status, start date)
   - Fitness goals array
   - Trainer assignment (if selected)
6. **Response**: Member list auto-refreshes with new member

---

## 🔒 Security & Validation

### Client-Side Validation
- Required field checks
- Email format validation
- Age auto-calculation prevents manual entry
- Fitness goals enforcement

### Server-Side Validation (API)
- Token verification (admin only)
- Email uniqueness check
- Required fields enforcement
- Password hashing with bcrypt (10 salt rounds)
- Role assignment (automatically "user" for new members)

---

## 📱 UI/UX Features

### Visual Feedback
- **Step Indicator**: Yellow progress bar shows current progress (1/3 → 2/3 → 3/3)
- **Error Messages**: Red alert boxes with clear error text
- **Loading State**: Animated spinner on Finish button
- **Button States**: Disabled Back button on Step 1, color-coded buttons

### Theme Integration
- Dark theme matching gym system (Dark Grey #2B2621, Yellow #F4D03F)
- Professional typography with font weights
- Consistent spacing and padding
- Smooth transitions and hover effects
- Mobile responsive design

### Accessibility
- Clear labels for all form fields
- Placeholder text for guidance
- Calendar icon for date fields
- Large clickable checkboxes
- Clear button hierarchy

---

## 🔧 Integration Points

### Where Add Member Wizard Is Used
1. **Admin Dashboard** (`/admin/dashboard`)
   - "+ Add Member" button in header
   
2. **Members Page** (`/admin/members`)
   - "+ Add Member" button in header
   
3. **Trainers Page** (if implemented)
   - "+ Add Member" button available

### Connected Endpoints
- **GET /api/trainers** - Fetches available trainers for Step 3
- **POST /api/admin/members** - Submits new member data
- **GET /api/admin/members** - Refreshes member list after creation

---

## 📊 Member Fields Stored

When member is created, the following data is stored:

| Field | Source | Type | Example |
|-------|--------|------|---------|
| firstName | Step 1 | String | "John" |
| lastName | Step 1 | String | "Doe" |
| email | Step 1 | String | "john@example.com" |
| password | Generated | String (hashed) | Auto-generated |
| phone | Step 1 | String | "+94123456789" |
| dateOfBirth | Step 1 | Date | "1990-05-15" |
| age | Step 1 (auto) | Number | 35 |
| gender | Step 1 | String | "Male" |
| country | Step 2 | String | "Sri Lanka" |
| city | Step 2 | String | "Negombo" |
| zipcode | Step 2 | String | "11500" |
| address | Step 2 | String | "123 Main St" |
| fitnessGoal | Step 3 | Array | ["Strength", "Muscle Gain"] |
| plan | Step 3 | String | "gold" |
| membershipStatus | System | String | "active" |
| membershipStartDate | Step 3 | Date | "2026-04-15" |
| trainerId | Step 3 | ObjectId | "69c4f2cd..." |
| role | System | String | "user" |

---

## ⚡ Performance Optimizations

1. **Lazy Loading**: Trainers list loads only when Step 3 is opened
2. **Form State**: Data persists across steps
3. **Validation**: Client-side validation prevents unnecessary API calls
4. **Error Handling**: Graceful error messages without breaking flow
5. **Auto-Refresh**: Member list refreshes after successful creation

---

## 🎨 Component Structure

```
AddMemberWizard.tsx
├── Step 1: Personal Information (renderStep1)
├── Step 2: Location Information (renderStep2)
├── Step 3: Membership & Fitness (renderStep3)
├── Navigation Controls (Back, Next, Cancel, Finish)
├── Validation Logic (validateStep1, validateStep2, validateStep3)
└── API Integration (handleFinish)
```

---

## 🔄 Developer Notes

### To Add New Fitness Goals:
Edit the fitness goals array in `renderStep3`:
```javascript
['Weight Loss', 'Muscle Gain', 'Strength', 'Flexibility', 'Overall Health', 'Endurance']
// Add your new goal here
```

### To Modify Membership Packages:
Edit the plan options in `renderStep3`:
```javascript
value="basic">Basic (LKR 2,500/month)
// Modify price and add/remove options
```

### To Add Required Fields:
1. Add to form state in `formData`
2. Add input to relevant step
3. Add validation in `validateStepX()`
4. Add to API payload in `handleFinish()`

---

## ✨ Future Enhancements (Optional)

- Email verification confirmation
- Import member profile picture
- Role-based access levels
- Integration with payment gateway
- Automated welcome email
- Member ID generation
- Document upload (proof of identity)
- Emergency contact information
- Medical history questionnaire
