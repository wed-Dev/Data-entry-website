# Business Transaction Entry System - Setup & Deployment Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Local Setup](#local-setup)
4. [Supabase Configuration](#supabase-configuration)
5. [Database Schema & Migrations](#database-schema--migrations)
6. [Vercel Deployment](#vercel-deployment)
7. [Testing the Application](#testing-the-application)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

This is a full-stack Business Transaction Entry System built with:

- **Frontend**: Next.js 14 with App Router, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT-based with Supabase Auth
- **Deployment**: Vercel (free tier compatible)

### Features

✅ User authentication (Sign up / Login)
✅ Dashboard with real-time metrics
✅ Transaction entry form with validation
✅ Transactions list with filtering & search
✅ Month-wise filtering
✅ Revenue calculations
✅ Row-level security (RLS) for data privacy
✅ Responsive mobile-friendly design
✅ Clean modern UI with animations

---

## 📦 Prerequisites

Before starting, ensure you have:

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **npm or yarn**
   ```bash
   npm --version
   ```

3. **Git** (for version control and deployment)
   ```bash
   git --version
   ```

4. **Vercel Account** (free tier available at https://vercel.com)

5. **Supabase Account** (free tier available at https://supabase.com)

6. **GitHub Account** (for connecting to Vercel)

---

## 🚀 Local Setup

### Step 1: Install Dependencies

```bash
cd "d:\work\invoice entry"
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TailwindCSS
- Supabase JS client
- Axios for HTTP requests
- Lucide React for icons

### Step 2: Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

Leave it blank for now - we'll populate it after setting up Supabase.

### Step 3: Run Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

### Step 4: Test Login

Use demo credentials:
- **Email**: demo@example.com
- **Password**: Demo@123

---

## 🔐 Supabase Configuration

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" (sign up if needed)
3. Click "New Project"
4. Fill in project details:
   - **Name**: business-transaction-entry
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
5. Click "Create new project" and wait (2-3 minutes)

### Step 2: Get API Keys

1. Once project is created, go to **Settings → API**
2. Copy the following keys:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Update .env.local

Open `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 🗄 Database Schema & Migrations

### Step 1: Create Tables

Go to Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Create users table (Supabase Auth handles this, but we'll create a custom users table)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id VARCHAR(255) NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  destination_location VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
```

### Step 2: Enable Row Level Security (RLS)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert transactions only for themselves
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update only their own transactions
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete only their own transactions
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

### Step 3: Set Up Authentication

1. In Supabase Dashboard, go to **Authentication → Providers**
2. Enable "Email" (should be enabled by default)
3. Configure email templates if needed

### Step 4: Create Test User

In Supabase Dashboard:

1. Go to **Authentication → Users**
2. Click "Create new user"
3. Email: `test@example.com`
4. Password: `Test@123`
5. Click "Create user"

Now you can test login with these credentials.

---

## 🌐 Vercel Deployment

### Step 1: Push Code to GitHub

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Business Transaction Entry System"

# Create repository on GitHub (https://github.com/new)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/business-transaction-entry.git
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in (or sign up with GitHub)
3. Click "Add New..." → "Project"
4. Select your GitHub repository
5. Click "Import"

### Step 3: Configure Environment Variables

In Vercel dashboard:

1. Go to **Project Settings → Environment Variables**
2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=generate-a-random-32-character-string
DATABASE_URL=your-database-url-from-supabase
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy

1. In Vercel, click the "Deploy" button
2. Wait for deployment to complete (usually 2-3 minutes)
3. Once complete, you'll get a URL like: `https://business-transaction-entry.vercel.app`

### Step 5: Update Supabase Auth Redirect URLs

1. Go to Supabase Dashboard → **Authentication → URL Configuration**
2. Add redirect URLs:
   - `http://localhost:3000/**` (for local development)
   - `https://your-app.vercel.app/**` (for production)

---

## ✅ Testing the Application

### Local Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Test Login:
   - Visit `http://localhost:3000`
   - Email: `test@example.com`
   - Password: `Test@123`

3. Test Dashboard:
   - Add new transactions
   - Verify metrics update
   - Test filtering and search

4. Test Data Privacy:
   - Create different users
   - Verify each user only sees their own data

### Production Testing

1. Visit your Vercel deployment URL
2. Test the same scenarios as above
3. Verify all features work on mobile

### API Testing

Test API endpoints using curl:

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'

# Test creating transaction (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/transactions/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "customer_id":"CUST001",
    "pickup_location":"Downtown",
    "destination_location":"Marina",
    "date":"2025-12-04",
    "time":"10:30",
    "price":150.00
  }'

# Test getting metrics
curl -X GET http://localhost:3000/api/transactions/metrics \
  -H "Authorization: Bearer TOKEN"
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution:**
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
```

### Issue: Environment variables not loading

**Solution:**
1. Check `.env.local` exists in project root
2. Restart dev server: `npm run dev`
3. In Vercel, ensure variables are set in all environments (Production, Preview, Development)

### Issue: "Failed to connect to database"

**Solution:**
1. Verify DATABASE_URL in `.env.local`
2. Check database is running (Supabase)
3. Verify IP whitelist in database settings

### Issue: RLS policies blocking queries

**Solution:**
1. Verify user is authenticated
2. Check RLS policy conditions
3. Use service role key for admin operations (with caution)
4. Test RLS in Supabase SQL Editor

### Issue: CORS errors

**Solution:**
1. Ensure API calls include proper headers
2. In Supabase, add your domain to CORS settings
3. Check request format (JSON, correct headers)

### Issue: Authentication token expired

**Solution:**
1. Implement token refresh logic
2. Clear localStorage and re-login
3. Use Supabase session management

---

## 📈 Performance Optimization

### Caching

Add caching headers in `next.config.js`:

```javascript
headers: async () => {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
      ],
    },
  ]
}
```

### Database Indexes

Already created for:
- `user_id` - for filtering transactions by user
- `date` - for date-based queries
- `customer_id` - for search functionality

### Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image'
```

---

## 🔄 Continuous Deployment

Vercel automatically deploys on:
- Push to main branch
- Pull request created
- Manual deployment from dashboard

### Disable Automatic Deployments

In **Project Settings → Git → Auto-deploy from Git**:
- Uncheck to disable auto-deploy

---

## 📞 Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## 🎉 Success!

Your Business Transaction Entry System is now deployed and ready to use! 

Key features:
- ✅ Secure user authentication
- ✅ Real-time transaction tracking
- ✅ Advanced filtering and search
- ✅ Revenue analytics
- ✅ Mobile responsive design
- ✅ Row-level data security

Start tracking transactions now!
