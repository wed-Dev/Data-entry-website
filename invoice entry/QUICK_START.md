# 🚀 Quick Start Guide (5 Minutes)

Get the Business Transaction Entry System running in 5 minutes!

## ✅ Prerequisites

- Node.js v18+
- npm or yarn
- A Supabase account (free at https://supabase.com)

## 🎯 Step 1: Download & Install (1 min)

```bash
# Navigate to project directory
cd "d:\work\invoice entry"

# Install dependencies
npm install
```

## 🔧 Step 2: Set Up Environment (2 min)

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Create Supabase project** at https://supabase.com (1-2 min)

3. **Copy API keys** from Supabase Dashboard → Settings → API
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## 🏃 Step 3: Run Application (1 min)

```bash
npm run dev
```

Visit: **http://localhost:3000**

## 🔑 Step 4: Login (1 min)

Use demo credentials:
- Email: `demo@example.com`
- Password: `Demo@123`

## ✨ You're Done!

Welcome to the dashboard! Start adding transactions.

---

## 🌐 Deploy to Vercel (Optional - 5 min)

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Visit https://vercel.com and connect your repository

3. Add environment variables in Vercel dashboard

4. Click "Deploy" 🎉

For detailed setup, see [SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md)
