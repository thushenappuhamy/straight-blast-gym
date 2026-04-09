# Backend Setup Guide - Straight Blast Gym

## Overview

The Straight Blast Gym application uses Next.js as both frontend and backend, with MongoDB for data storage and JWT for authentication.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## Installation

### 1. Install Dependencies

All required dependencies have been installed:
- `mongoose` - MongoDB ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `next` - Full-stack framework

```bash
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and update with your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://gymadmin:gadaya@2003@straightblastgym.amatibx.mongodb.net/?appName=StraightBlastGym

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000

# JWT Secret - CHANGE THIS IN PRODUCTION
JWT_SECRET=your-secret-key-change-in-production

# Setup Token - CHANGE THIS IN PRODUCTION
SETUP_TOKEN=sbg-setup-token-2024
```

## Creating Admin User

### Method 1: Web Setup Page (Recommended)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/admin/setup`

3. Fill in the admin details:
   - First Name: Admin
   - Last Name: User
   - Email: admin@sbgnegombo.lk
   - Password: Admin@2024 (change this!)

4. Click "Create Admin User"

5. You'll be redirected to login page. Use your admin credentials to log in.

6. **IMPORTANT**: Delete the `/app/admin/setup` directory after creating the admin user in production.

### Method 2: Command Line Script

```bash
node scripts/create-admin.js
```

This creates an admin with default credentials:
- Email: admin@sbgnegombo.lk
- Password: Admin@2024

## API Endpoints

### Authentication

#### Sign Up
- **Endpoint**: `POST /api/auth/signup`
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "gender": "Male",
    "dateOfBirth": "2000-01-01",
    "fitnessGoal": ["muscle-gain"]
  }
  ```
- **Response**: User object (password excluded) + Sets httpOnly cookie with JWT token

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "admin@sbgnegombo.lk",
    "password": "Admin@2024"
  }
  ```
- **Response**: User object + Sets httpOnly cookie with JWT token
- **Redirect Logic**:
  - Admin users → redirect to `/admin/dashboard`
  - Regular users → redirect to `/dashboard`

#### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Response**: Clears auth token cookie

#### Verify Token
- **Endpoint**: `GET /api/auth/me`
- **Response**: Current user object (requires valid token in cookie)

#### Create Admin (Setup Only)
- **Endpoint**: `POST /api/auth/create-admin`
- **Header**: `x-setup-token: sbg-setup-token-2024`
- **Body**:
  ```json
  {
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@sbgnegombo.lk",
    "password": "password123"
  }
  ```

## Authentication Flow

1. **Sign Up**:
   - User fills signup form
   - Password is hashed using bcryptjs
   - User created in MongoDB with `role: 'user'`
   - User redirected to login

2. **Login**:
   - User provides email & password
   - Password compared with hashed password
   - JWT token generated with user's id and role
   - Token stored in httpOnly cookie
   - User redirected based on role:
     - admin → `/admin/dashboard`
     - user → `/dashboard`

3. **Protected Routes**:
   - Middleware checks for valid JWT in cookies
   - Admin routes require `role === 'admin'`
   - Regular routes require valid token
   - Invalid/missing token → redirect to `/login`

## Database Schema - User Model

```typescript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed, not returned by default),
  gender: String (Male, Female, Other),
  dateOfBirth: Date,
  fitnessGoal: [String],
  role: String (user | admin), // default: user
  plan: String (basic | gold | elite), // default: basic
  membershipStatus: String (active | pending | inactive), // default: pending
  bmi: Number,
  height: Number,
  weight: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## File Structure

```
app/
  api/auth/
    signup/route.ts          - User registration
    login/route.ts           - User login
    logout/route.ts          - User logout
    me/route.ts              - Get current user
    create-admin/route.ts    - Create admin (setup)
  admin/
    setup/page.tsx           - Admin setup page (DELETE IN PRODUCTION)
    dashboard/page.tsx       - Admin dashboard (protected)
    ...

src/
  lib/
    db.ts                    - MongoDB connection
  models/
    User.ts                  - User schema & model

middleware.ts              - Authentication middleware

scripts/
  create-admin.js          - CLI script to create admin
```

## Security Considerations

1. **JWT Secret**: Change `JWT_SECRET` in `.env.local` to a secure random string
2. **Setup Token**: Change `SETUP_TOKEN` before deploying
3. **Passwords**:
   - Hashed with bcryptjs (10 salt rounds)
   - Minimum 8 characters required
   - Never returned in API responses
4. **Cookies**:
   - httpOnly flag prevents client-side JS access
   - Secure flag set in production (HTTPS only)
   - SameSite=Lax prevents CSRF attacks
5. **Admin Setup Page**:
   - Must be deleted after initial setup in production
   - Protected by SETUP_TOKEN header

## Development

### Start Dev Server
```bash
npm run dev
```
Server runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

### Test Authentication

1. **Signup**: Navigate to `http://localhost:3000/signup`
2. **Login**: Navigate to `http://localhost:3000/login`
3. **Create Admin**: Navigate to `http://localhost:3000/admin/setup` (before deleting it)

## Troubleshooting

### "Cannot find module 'mongoose'"
- Run `npm install mongoose`

### "Invalid token" on login
- Check JWT_SECRET matches in `.env.local`
- Ensure token hasn't expired (7 days default)

### Admin can't access admin routes
- Check user's role is 'admin' in database
- Clear cookies and login again
- Check middleware.ts is in root directory

### MongoDB connection fails
- Verify MONGODB_URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network access is enabled

## Next Steps

1. Create admin user via `/admin/setup`
2. Delete `/app/admin/setup` directory in production
3. Test signup and login flows
4. Configure payment gateway with admin settings
5. Set up email notifications
