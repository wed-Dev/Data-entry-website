# Quick Start Guide

Get your Invoice Entry application running in 5 minutes!

## 🚀 5-Minute Setup

### Step 1: Prerequisites (1 min)
- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] GitHub account (for deployment)

### Step 2: Install Dependencies (2 min)
```bash
cd invoice-entry
npm install
```

### Step 3: Set Up Environment (1 min)
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Create Database (1 min)
1. Open Supabase Dashboard > SQL Editor
2. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id VARCHAR(100) NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  vehicle_type VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

3. Click "Run"

### Step 5: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

## 📋 First Steps

1. **Sign Up**: Create an account at `/auth/signup`
2. **Verify Email**: Check your inbox (or use test mode)
3. **Create Transaction**: Click "+ New Transaction"
4. **View Dashboard**: See your data come alive
5. **Explore**: Check Transactions and Analytics pages

## 🔑 Key Credentials to Keep Safe

```bash
# These are in your Supabase Settings > API
NEXT_PUBLIC_SUPABASE_URL         # Your project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Public key for client
SUPABASE_SERVICE_ROLE_KEY        # Admin key (keep secret!)
```

## 📁 Project Structure

```
invoice-entry/
├── src/
│   ├── app/              # Next.js app pages
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities & configs
│   └── types/            # TypeScript types
├── .env.example          # Environment template
├── package.json          # Dependencies
└── README.md             # Full documentation
```

## 🌐 Deployment in 5 Minutes

### Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/invoice-entry
git push -u origin main
```

### Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Add environment variables from `.env.local`
4. Click "Deploy"
5. Done! Your app is live 🚀

## 🐛 Common First-Time Issues

### Issue: Signup redirect fails
**Fix**: Check your Supabase auth redirect URLs include `http://localhost:3000/auth/callback`

### Issue: Can't see transactions
**Fix**: Ensure RLS policies are created (check Troubleshooting guide)

### Issue: Port 3000 already in use
**Fix**: 
```bash
npm run dev -- -p 3001
```

## 📚 Next Steps

- [ ] Read [README.md](./README.md) for full documentation
- [ ] Check [API_DOCS.md](./API_DOCS.md) for API reference
- [ ] Review [SCHEMA.md](./SCHEMA.md) for database structure
- [ ] Learn [Deployment.md](./DEPLOYMENT.md) for production setup
- [ ] Use [Troubleshooting.md](./TROUBLESHOOTING.md) for help

## 💡 Pro Tips

1. **Test Mode**: Disable email verification in Supabase > Settings > Auth for faster testing
2. **Mock Data**: Create sample transactions quickly by duplicating existing ones
3. **Dark Mode**: Customize TailwindCSS colors in `tailwind.config.ts`
4. **Performance**: Use pagination for large datasets (10-20 records per page)

## 📞 Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review error message in browser DevTools Console (F12)
- Check Supabase Logs in Dashboard
- Use `vercel logs --tail` for production issues

## 🎯 Features Included

✅ User authentication (signup, login, forgot password)
✅ Transaction CRUD (create, read, update, delete)
✅ Advanced search, filtering, sorting, pagination
✅ Dashboard with live metrics and charts
✅ Analytics page with revenue insights
✅ Mobile-responsive design
✅ Row-level security (data isolation)
✅ Production-ready code

## 📊 Dashboard Metrics

Your dashboard automatically shows:
- Total transactions
- Today's transactions
- Total revenue (AED)
- Today's revenue
- Average revenue per job
- Highest paid job

## 📈 Charts Included

- Monthly revenue trends (bar chart)
- Daily transactions (line chart)
- Most common pickup locations
- Most common destinations
- Busy days analysis

## 🔒 Security Features

- Secure password hashing
- JWT authentication
- Row-level database security
- Environment variable protection
- HTTPS on production
- Session management

## 🎨 Customization

Edit `tailwind.config.ts` to change:
- Brand colors
- Spacing
- Typography
- Theme

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All pages are fully optimized for each breakpoint.

---

**You're all set! Happy coding! 🎉**

For detailed docs, see [README.md](./README.md)
