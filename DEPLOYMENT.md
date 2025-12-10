# Deployment Guide - Vercel

Complete step-by-step guide to deploy Invoice Entry on Vercel with Supabase.

## Prerequisites

- GitHub account with the repository
- Supabase project created
- Vercel account

## Step 1: Prepare Your Project

### 1.1 Ensure All Files Are Committed
```bash
cd invoice-entry
git add .
git commit -m "Ready for deployment"
```

### 1.2 Create Environment Configuration
Ensure `.env.example` exists with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 1.3 Build Test
```bash
npm run build
```
This should complete without errors.

## Step 2: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to Settings > API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/yourusername/invoice-entry.git
git push -u origin main
```

## Step 4: Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts:
# - Select project name: invoice-entry
# - Select default settings
# - Confirm deployment
```

### Method 2: Using Vercel Web Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Paste your GitHub repository URL
4. Click "Import"
5. Configure project:
   - Framework: Next.js
   - Root directory: ./
   - Build command: `npm run build`
   - Output directory: .next
6. Add Environment Variables (see Step 5)
7. Click "Deploy"

## Step 5: Configure Environment Variables in Vercel

### Via Web Dashboard

1. Go to your Vercel project
2. Settings > Environment Variables
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL     = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
SUPABASE_SERVICE_ROLE_KEY    = your_service_role_key
```

4. Set environment for each:
   - Production
   - Preview
   - Development

### Via Vercel CLI

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy again to apply variables
vercel --prod
```

## Step 6: Configure Supabase for Production

### Update Redirect URLs

1. Go to Supabase Dashboard
2. Navigate to Settings > Auth > Redirect URLs
3. Add your Vercel URL:
   ```
   https://your-project-name.vercel.app/auth/callback
   ```
4. Save

### Allow Production Domain

1. Settings > API > CORS
2. Add your Vercel domain:
   ```
   https://your-project-name.vercel.app
   ```

## Step 7: Run Database Migrations

Execute the SQL schema in Supabase SQL Editor:

1. Go to Supabase Dashboard
2. SQL Editor > New Query
3. Paste the SQL from README.md "Set Up Supabase Database" section
4. Click "Run"

## Step 8: Test Deployment

1. Go to `https://your-project-name.vercel.app`
2. Test the complete flow:
   - Sign up with test email
   - Verify email (check inbox)
   - Login
   - Create a transaction
   - View dashboard
   - View analytics
   - Logout

## Step 9: Production Checklist

- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] Auth redirect URLs configured
- [ ] CORS domains configured
- [ ] Test signup/login flow
- [ ] Test transaction creation
- [ ] Test analytics loading
- [ ] Check error logs in Vercel
- [ ] Monitor database in Supabase
- [ ] Set up error tracking (optional: Sentry)

## Monitoring & Maintenance

### View Logs
```bash
# Real-time logs
vercel logs --tail

# Past logs
vercel logs
```

### Database Monitoring
1. Supabase Dashboard > Database > Connection Pooler
2. Monitor active connections
3. Check slow query logs

### Performance Monitoring
1. Vercel Dashboard > Analytics
2. Monitor response times
3. Check build times

## Common Issues & Solutions

### Issue: 500 Internal Server Error
**Solution:**
1. Check Vercel logs: `vercel logs --tail`
2. Verify environment variables are set
3. Verify database schema is created
4. Check Supabase service status

### Issue: Auth Redirect Loop
**Solution:**
1. Verify auth callback URL is configured in Supabase
2. Check if environment variables are correct
3. Clear browser cookies and try again

### Issue: Transactions Not Saving
**Solution:**
1. Check if user is authenticated
2. Verify RLS policies are enabled
3. Check API error response in browser DevTools
4. Verify database tables exist

### Issue: Build Fails on Vercel
**Solution:**
1. Check build logs for errors
2. Run `npm run build` locally to reproduce
3. Ensure all dependencies are in package.json
4. Check for TypeScript errors: `npx tsc --noEmit`

### Issue: Slow Performance
**Solution:**
1. Check database query performance
2. Verify indexes are created
3. Monitor Supabase connection pooling
4. Consider caching strategies

## Rollback Procedure

If deployment causes issues:

### Via Vercel CLI
```bash
vercel rollback
```

### Via Web Dashboard
1. Vercel Dashboard > Deployments
2. Find the previous stable deployment
3. Click the three dots
4. Select "Promote to Production"

## Advanced Configuration

### Custom Domain

1. Vercel Dashboard > Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase auth URLs for new domain

### Serverless Function Optimization

Add to `vercel.json`:
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### Environment-Specific Configuration

Use Vercel Preview Deployments:
- Preview: Connects to development Supabase project
- Production: Connects to production Supabase project

Configure in Environment Variables with different values for Preview vs Production.

## Cost Estimation (Vercel + Supabase)

### Vercel
- Hobby tier: Free (good for testing)
- Pro: $20/month
- Storage: Included
- Bandwidth: 1 TB/month free tier

### Supabase
- Free tier: 500 MB database, 1 GB bandwidth
- Pro: $25/month (10 GB database)
- Pay-as-you-go for overages

## Next Steps

1. Monitor deployment for 24-48 hours
2. Set up error tracking (Sentry, LogRocket)
3. Configure backups
4. Set up staging environment
5. Plan content delivery network (CDN) if needed

## Support

For Vercel issues: https://vercel.com/support
For Supabase issues: https://supabase.com/support
