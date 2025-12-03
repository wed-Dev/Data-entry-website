# ⚡ Quick Start - Vercel Deployment

## 🎯 3-Minute Deployment

### Step 1: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 2: Create Database
1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Name it (e.g., "transaction-db")
4. Click ".env.local" tab and copy all POSTGRES_* variables

### Step 3: Deploy
```powershell
cd d:\Dubai\data-entry-app
vercel
```
Follow prompts, then add environment variables and redeploy:
```powershell
vercel env add POSTGRES_URL
# (paste your database URL, select all environments)
# Repeat for all POSTGRES_* variables

vercel --prod
```

### Step 4: Done! 🎉
Your app is live at: `https://your-project.vercel.app/login.html`

**Default Login:** admin / admin123

---

## 📝 Or Use the Batch File
Just run: `DEPLOY-TO-VERCEL.bat`

---

## 📖 Full Guide
See `VERCEL-DEPLOYMENT-GUIDE.md` for detailed instructions.

---

## 🆘 Quick Fixes

**Database connection error?**
→ Check environment variables in Vercel dashboard

**404 on API routes?**
→ Make sure `vercel.json` and `api/index.js` exist

**Can't login?**
→ Database might not be initialized, redeploy once more

---

## 🔄 Update Your App
```powershell
vercel --prod
```

That's it! Any code changes will be deployed.
