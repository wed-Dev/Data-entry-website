# Vercel Deployment Checklist

## ✅ Pre-Deployment Verification

- [x] Build passes locally (`npm run build`)
- [x] MongoDB Atlas connection string configured
- [x] Environment variables identified
- [x] Next.js configuration optimized
- [x] Root route properly redirects
- [x] All API routes use MongoDB
- [x] Git repository up to date

## 🚀 Deployment Steps

### Step 1: Configure MongoDB Atlas Network Access

**CRITICAL: Do this BEFORE deploying to Vercel**

1. Go to https://cloud.mongodb.com
2. Select your project
3. Navigate to **Network Access** (left sidebar)
4. Click **"Add IP Address"**
5. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **"Confirm"**

### Step 2: Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Visit https://vercel.com/new
2. Sign in with GitHub
3. Import repository: `Abb561/Data-Entry-App`
4. Configure project settings:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Add Environment Variables** (Click "Add" for each):

```bash
# Variable 1: MongoDB Connection
Name: MONGODB_URI
Value: mongodb+srv://mudassir_abbassi:abbassi32304@cluster0.rzgg9xr.mongodb.net/invoice-entry?retryWrites=true&w=majority
Environment: Production, Preview, Development

# Variable 2: NextAuth Secret
Name: NEXTAUTH_SECRET
Value: ojwWGrJKtIIr56++RuPsFJ4ESJDpPHaRtcf77EPlWBQ=
Environment: Production, Preview, Development

# Variable 3: NextAuth URL (IMPORTANT!)
Name: NEXTAUTH_URL
Value: https://your-project-name.vercel.app
Environment: Production

# For Development Preview (Optional)
Name: NEXTAUTH_URL
Value: http://localhost:3000
Environment: Development
```

6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment

#### Option B: Vercel CLI

```powershell
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 3: Update NEXTAUTH_URL (CRITICAL!)

After first deployment:

1. Copy your Vercel deployment URL (e.g., `https://data-entry-app.vercel.app`)
2. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL` variable
4. Edit the **Production** value to match your actual Vercel URL
5. Click **"Save"**
6. Go to **Deployments** tab
7. Find latest deployment → Click **"..."** → **"Redeploy"**
8. Confirm redeploy

### Step 4: Verify Deployment

Visit your Vercel URL and test:

- [ ] Homepage redirects to `/auth/login`
- [ ] Sign up page loads (`/auth/signup`)
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] Dashboard loads (`/dashboard`)
- [ ] Can create transaction (`/transactions/new`)
- [ ] Transactions list displays (`/transactions`)
- [ ] Analytics page shows charts (`/analytics`)
- [ ] Can edit/delete transactions
- [ ] Can logout

## 🔧 Configuration Files Reference

### Required Files (All Present ✅)

```
✅ vercel.json          - Vercel deployment config
✅ next.config.js       - Next.js configuration
✅ package.json         - Dependencies
✅ .env.example         - Environment template
✅ .gitignore           - Secrets protection
✅ tsconfig.json        - TypeScript config
```

### Environment Variables Required

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | MongoDB Atlas connection | `mongodb+srv://...` |
| `NEXTAUTH_SECRET` | JWT signing secret | Random 32-byte string |
| `NEXTAUTH_URL` | Application URL | `https://your-app.vercel.app` |

## ⚠️ Common Issues & Solutions

### Issue 1: 404 Error on Root Page
**Cause**: NEXTAUTH_URL not updated after deployment  
**Solution**: Update NEXTAUTH_URL env var with actual Vercel URL and redeploy

### Issue 2: Database Connection Failed
**Cause**: MongoDB Atlas blocking Vercel IPs  
**Solution**: Enable "Allow Access from Anywhere" in Network Access

### Issue 3: Authentication Not Working
**Cause**: NEXTAUTH_URL mismatch or NEXTAUTH_SECRET missing  
**Solution**: Verify all 3 env vars are set correctly in Vercel

### Issue 4: API Routes Return 500
**Cause**: MONGODB_URI not set or incorrect  
**Solution**: Check Vercel env vars, ensure connection string is correct

### Issue 5: Build Fails on Vercel
**Cause**: TypeScript or ESLint errors  
**Solution**: Run `npm run build` locally first, fix all errors

## 📊 Deployment Status Check

After deployment, check these:

1. **Vercel Build Logs**
   - Go to Deployments → Click on deployment → View "Building" logs
   - Should show: "✓ Compiled successfully"

2. **Function Logs**
   - Deployments → Click deployment → "Functions" tab
   - Check for MongoDB connection logs
   - Look for any error messages

3. **Environment Variables**
   - Settings → Environment Variables
   - Verify all 3 variables are set
   - Check they're applied to correct environments

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Homepage redirects to login
- ✅ Can sign up new user
- ✅ Can login successfully
- ✅ Dashboard displays data
- ✅ Can create/edit/delete transactions
- ✅ Analytics charts render
- ✅ MongoDB connection working
- ✅ No console errors in browser

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify MongoDB Atlas network access
3. Confirm all environment variables are set
4. Test locally with `npm run build && npm start`
5. Check browser console for errors

## 🔄 Redeployment

To redeploy after making changes:

```powershell
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically redeploy on push to main branch.

## 💰 Cost

- **Vercel**: Free (Hobby tier)
- **MongoDB Atlas**: Free (M0 cluster)
- **Total**: $0/month

---

**Last Updated**: December 10, 2025
**Status**: Ready for Deployment ✅
