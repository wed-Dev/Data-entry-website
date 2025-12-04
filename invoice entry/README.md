# 📦 Business Transaction Entry System

> A modern, full-stack web application for tracking business transactions with secure authentication, real-time dashboard, and advanced filtering.

[![Vercel Status](https://img.shields.io/badge/deploy-vercel-blue.svg)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/built%20with-Next.js%2014-black.svg)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/styled%20with-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based login with password encryption
- 📊 **Real-time Dashboard** - Live metrics updating instantly
- 💾 **Transaction Management** - Create, view, search transactions
- 📈 **Advanced Filtering** - Month-wise, search by customer/location
- 📱 **Fully Responsive** - Works perfectly on mobile and desktop
- 🎨 **Modern UI** - Clean design with smooth animations
- 🛡️ **Row-Level Security** - Each user sees only their data
- ⚡ **Production Ready** - Optimized for Vercel deployment

## 🎯 Use Cases

- **Logistics Companies** - Track deliveries and pickups
- **Taxi/Ride Services** - Monitor daily transactions and revenue
- **Business Operations** - Monitor transaction history and analytics
- **Finance Tracking** - Revenue reports and monthly summaries

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  Frontend       │         │  Backend         │
│  (Next.js 14)   │◄──────►│  (API Routes)    │
│  React + Tw CSS │         │                  │
└─────────────────┘         └──────────────────┘
         │                          │
         └──────────────┬───────────┘
                        │
                   ┌────▼─────┐
                   │ Supabase  │
                   │PostgreSQL │
                   └───────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm/yarn
- Supabase account (free)

### Installation

```bash
# 1. Clone/download project
cd business-transaction-entry

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Add Supabase keys to .env.local

# 4. Run development server
npm run dev
```

Visit `http://localhost:3000` → Login with demo credentials

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `Demo@123`

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | Get running in 5 minutes |
| [SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md) | Complete setup & deployment guide |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Database structure & SQL |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | API endpoints & usage |

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Login page
│   ├── globals.css             # Global styles
│   ├── signup/
│   │   └── page.tsx            # Sign up page
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard page
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts   # Login endpoint
│       │   └── signup/route.ts  # Signup endpoint
│       └── transactions/
│           ├── create/route.ts  # Create transaction
│           ├── list/route.ts    # List transactions
│           └── metrics/route.ts # Get metrics
├── components/
│   ├── DashboardMetrics.tsx    # Metrics display
│   ├── TransactionForm.tsx     # Form component
│   └── TransactionsList.tsx    # Table component
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── auth.ts                 # Auth utilities
│   └── api.ts                  # API client
public/               # Static assets
package.json          # Dependencies
tailwind.config.ts    # TailwindCSS config
tsconfig.json         # TypeScript config
.env.example          # Environment template
```

## 🔐 Authentication Flow

1. User visits app → redirected to login
2. Enter email & password
3. Server validates credentials
4. JWT token generated & stored in localStorage
5. User redirected to dashboard
6. All API calls include token in Authorization header
7. Backend verifies token & enforces row-level security

## 💾 Database Structure

### Users Table
```sql
id (UUID) | email | name | created_at
```

### Transactions Table
```sql
id | user_id | customer_id | pickup_location | destination_location | date | time | price | created_at
```

**Row-Level Security**: Users can only access their own transactions.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit https://vercel.com
   - Select your repository
   - Add environment variables
   - Click Deploy

3. **Set up database**
   - Create Supabase project
   - Run SQL migrations (see DATABASE_SCHEMA.md)
   - Add API keys to Vercel

For detailed steps, see [SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md)

## 🧪 Testing

### Local Testing
```bash
npm run dev
# Visit http://localhost:3000
# Test with demo credentials
```

### API Testing
```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo@123"}'
```

## 🔧 Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `eyJxx...` |
| `SUPABASE_SERVICE_ROLE_KEY` | No | `eyJxx...` |
| `JWT_SECRET` | No | Generate with `crypto.randomBytes(32)` |
| `DATABASE_URL` | No | PostgreSQL connection string |

## 🚨 Troubleshooting

### Can't login?
- Check credentials in environment variables
- Ensure user exists in Supabase
- Check browser console for errors

### Database connection error?
- Verify DATABASE_URL
- Check Supabase status
- Ensure IP is whitelisted

### Deployment failed?
- Check build logs in Vercel
- Verify all environment variables set
- Ensure database migrations ran

See [SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md) for more troubleshooting.

## 📊 Performance

- ⚡ Optimized for Core Web Vitals
- 🔍 SEO-friendly with Next.js
- 📱 Mobile-first responsive design
- 🚀 Database indexes on frequently queried columns
- 💾 Efficient API responses with minimal payloads

## 🔒 Security

- ✅ JWT authentication with secure tokens
- ✅ Row-level security in database
- ✅ HTTPS/SSL for all communications
- ✅ SQL injection prevention
- ✅ CORS properly configured
- ✅ Environment variables for secrets
- ✅ Password hashing (SHA-256)

## 🎨 UI/UX Features

- Clean, modern interface
- Smooth animations and transitions
- Loading states and error handling
- Success notifications
- Mobile-responsive design
- Accessible form controls
- Intuitive navigation

## 📈 Scalability

- Database indexes for performance
- Efficient API queries
- Caching strategies
- Ready to scale to millions of transactions
- Auto-backup in Supabase

## 🤝 Contributing

Pull requests welcome! 

1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License - feel free to use this project freely.

## 🙋 Support

- 📖 Check [SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md)
- 🐛 Report issues on GitHub
- 💬 Supabase community: https://supabase.com/community
- 📚 Next.js docs: https://nextjs.org/docs

## 🎉 Built With

- [Next.js 14](https://nextjs.org) - React framework
- [React 18](https://react.dev) - UI library
- [TailwindCSS](https://tailwindcss.com) - Styling
- [Supabase](https://supabase.com) - Backend & Database
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Lucide React](https://lucide.dev) - Icons

## 👨‍💻 Author

Created with ❤️ for modern business needs.

---

**Ready to get started? See [QUICK_START.md](QUICK_START.md)** ⚡
