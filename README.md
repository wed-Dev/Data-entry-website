# Invoice Entry - Full-Stack Transaction Management System

A modern, production-ready web application for managing invoices and transactions with authentication, analytics, and comprehensive CRUD operations.

## 🚀 Features

- **Authentication System**: Secure login, signup, and password reset using Supabase Auth
- **Dashboard**: Real-time metrics with interactive charts (monthly revenue, daily transactions, location analytics)
- **Transaction Management**: Complete CRUD operations with search, filtering, sorting, and pagination
- **Transaction Entry Form**: Comprehensive form with validation and responsive design
- **Analytics Dashboard**: Detailed reports including revenue trends, job insights, and busy day analysis
- **Row Level Security**: User-specific data isolation at the database level
- **Mobile Responsive**: Fully optimized for desktop, tablet, and mobile devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with RLS
- **UI Components**: Custom components with Lucide React icons
- **API**: Next.js API Routes with Server Actions

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Git

## 🔧 Local Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd invoice-entry
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file at the root directory:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Set Up Supabase Database

#### Create Database Tables

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (Supabase handles this automatically via Auth)
-- But you can create a profile table if needed

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

-- Create indexes for better query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy: Users can only see their own transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS Policy: Users can insert their own transactions
CREATE POLICY "Users can create their own transactions" ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policy: Users can update their own transactions
CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS Policy: Users can delete their own transactions
CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 6. Default Navigation

- **Login Page**: `http://localhost:3000/auth/login`
- **Signup Page**: `http://localhost:3000/auth/signup`
- **Dashboard**: `http://localhost:3000/dashboard` (protected)
- **Transactions**: `http://localhost:3000/transactions` (protected)
- **New Transaction**: `http://localhost:3000/transactions/new` (protected)
- **Analytics**: `http://localhost:3000/analytics` (protected)

## 📚 Project Structure

```
invoice-entry/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transactions/
│   │   │   │   ├── route.ts (GET, POST)
│   │   │   │   └── [id]/route.ts (PUT, DELETE)
│   │   │   └── analytics/route.ts (GET)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── callback/page.tsx
│   │   ├── (protected)/
│   │   │   └── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── AppLayout.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── EditTransactionModal.tsx
│   │   └── ConfirmDialog.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── auth/
│   │       └── actions.ts
│   └── types/
│       └── index.ts
├── public/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## 🌐 Deployment on Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the project

### Step 3: Configure Environment Variables
In Vercel project settings:
1. Go to Settings > Environment Variables
2. Add the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Step 4: Configure Supabase for Production
1. In Supabase Dashboard, go to Settings > API
2. Update your Redirect URLs to include your Vercel domain:
   ```
   https://your-vercel-domain.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

### Step 5: Deploy
- Vercel will automatically deploy your project
- Check the deployment logs for any errors
- Access your app at `https://your-project-name.vercel.app`

## 🔐 API Endpoints Documentation

### Authentication
- **Login**: POST `/auth/login` (form submission)
- **Signup**: POST `/auth/signup` (form submission)
- **Logout**: Client-side via Supabase Auth

### Transactions
- **Create**: POST `/api/transactions`
  ```json
  {
    "customer_id": "C001",
    "pickup_location": "Dubai",
    "destination": "Abu Dhabi",
    "date": "2024-12-05",
    "time": "10:30",
    "vehicle_type": "Car",
    "price": 150.00,
    "notes": "Express delivery"
  }
  ```

- **Read**: GET `/api/transactions?page=1&limit=10&sortBy=date&order=desc&search=&month=`

- **Update**: PUT `/api/transactions/[id]`
  ```json
  {
    "price": 175.00,
    "notes": "Updated notes"
  }
  ```

- **Delete**: DELETE `/api/transactions/[id]`

### Analytics
- **Get Analytics**: GET `/api/analytics`
  Returns:
  ```json
  {
    "monthly_totals": [...],
    "daily_totals": [...],
    "most_common_pickup": "Dubai",
    "most_common_destination": "Abu Dhabi",
    "highest_paid_job": 500,
    "average_job_value": 150.50,
    "total_yearly_revenue": 45000,
    "busy_days": [...]
  }
  ```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Signup with new email
- [ ] Login with credentials
- [ ] Verify email (check Supabase Auth logs)
- [ ] Create a transaction
- [ ] Edit a transaction
- [ ] Delete a transaction
- [ ] Search transactions
- [ ] Filter by month
- [ ] Sort transactions
- [ ] View dashboard metrics
- [ ] View analytics
- [ ] Logout
- [ ] Try accessing protected routes without login

## 🚨 Troubleshooting

### Issue: "Unauthorized" Error
**Solution**: Check if you're logged in. The app redirects unauthenticated users to `/auth/login`.

### Issue: Database Connection Error
**Solution**: 
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Check Supabase project is active
- Ensure RLS policies are properly configured

### Issue: Transactions Not Showing
**Solution**:
- Check if RLS is enabled on the transactions table
- Verify the logged-in user's ID matches `user_id` in the database
- Check browser DevTools > Network tab for API errors

### Issue: Charts Not Displaying
**Solution**:
- Ensure Recharts is installed: `npm install recharts`
- Check console for chart errors
- Verify data is being returned from `/api/analytics`

### Issue: Supabase Auth Redirect Not Working
**Solution**:
- Add your domain to Supabase Auth > Redirect URLs
- For localhost: `http://localhost:3000/auth/callback`
- For production: `https://your-domain.com/auth/callback`

### Issue: CORS Errors
**Solution**:
- Supabase handles CORS automatically
- If using custom API endpoints, add CORS headers to API routes
- Check that requests are using the correct Supabase instance

## 📊 Performance Optimization Tips

1. **Database Indexing**: Already implemented on `user_id`, `date`, and `created_at`
2. **API Pagination**: Always paginate large result sets (10-20 records per page)
3. **Caching**: Use browser caching and Next.js data cache
4. **Image Optimization**: Use Next.js `Image` component for any images
5. **Bundle Size**: Monitor with `npm run build` and check `.next/analyze`
6. **RLS Performance**: RLS policies are efficiently applied at database level

## 🔒 Security Features

1. **Row Level Security (RLS)**: User data isolation at database level
2. **Authentication**: Supabase Auth with JWT tokens
3. **HTTPS**: Enforced on production
4. **SQL Injection Prevention**: Using Supabase client library (prevents SQL injection)
5. **CSRF Protection**: Next.js built-in CSRF protection
6. **Environment Variables**: Secrets never exposed in client code

## 🎨 Customization

### Change Primary Color
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
}
```

### Add More Fields to Transactions
1. Update database schema in Supabase SQL
2. Update `Transaction` type in `src/types/index.ts`
3. Update API endpoints
4. Update form components

### Customize Charts
Edit chart components in `src/app/dashboard/page.tsx` and `src/app/analytics/page.tsx`

## 📝 License

MIT

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Supabase documentation: https://supabase.com/docs
3. Check Next.js documentation: https://nextjs.org/docs

## 🎯 Future Enhancements

- [ ] Export reports as PDF/Excel
- [ ] Email notifications
- [ ] Multi-user collaboration with role-based access
- [ ] Advanced filtering and custom date ranges
- [ ] Mobile app (React Native)
- [ ] Invoice generation and printing
- [ ] Payment gateway integration
- [ ] Recurring transactions
- [ ] Customer management system
