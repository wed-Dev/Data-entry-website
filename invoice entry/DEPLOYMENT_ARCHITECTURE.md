# 🏗️ DEPLOYMENT ARCHITECTURE

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR USERS                                │
│              (Anywhere in the World)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL CDN                                │
│              (Global Distribution)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Frontend (Next.js React App)                 │   │
│  │  - Login Page                                       │   │
│  │  - Signup Page                                      │   │
│  │  - Dashboard with Metrics                           │   │
│  │  - Transaction Form                                 │   │
│  │  - Transactions List                                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      API Routes (Next.js Backend)                   │   │
│  │  - /api/auth/login                                  │   │
│  │  - /api/auth/signup                                 │   │
│  │  - /api/transactions/create                         │   │
│  │  - /api/transactions/list                           │   │
│  │  - /api/transactions/delete                         │   │
│  │  - /api/transactions/metrics                        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                           │
│              (PostgreSQL Database)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Authentication Service                       │   │
│  │  - User registration                                │   │
│  │  - Email verification                               │   │
│  │  - JWT token generation                             │   │
│  │  - Session management                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Database Tables (PostgreSQL)                 │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ users table                                  │   │   │
│  │  │ - id (UUID)                                  │   │   │
│  │  │ - email                                      │   │   │
│  │  │ - name                                       │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ transactions table                           │   │   │
│  │  │ - id (UUID)                                  │   │   │
│  │  │ - user_id (foreign key)                      │   │   │
│  │  │ - customer_id                                │   │   │
│  │  │ - pickup_location                            │   │   │
│  │  │ - destination_location                       │   │   │
│  │  │ - date                                       │   │   │
│  │  │ - time                                       │   │   │
│  │  │ - price                                      │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Row Level Security (RLS) Policies              │   │
│  │  - Users can only see their own data               │   │
│  │  - Automatic enforcement on all queries            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Sign Up                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │ 1. Submit form
                      ▼
        ┌─────────────────────────┐
        │ Frontend (React)         │
        │ - Validate input        │
        │ - Show loading state    │
        └────────┬────────────────┘
                 │ 2. POST /api/auth/signup
                 ▼
        ┌─────────────────────────┐
        │ API Route               │
        │ - Validate data         │
        │ - Check auth headers    │
        └────────┬────────────────┘
                 │ 3. Call Supabase
                 ▼
        ┌─────────────────────────┐
        │ Supabase Auth Service   │
        │ - Hash password         │
        │ - Create user account   │
        │ - Generate JWT token    │
        └────────┬────────────────┘
                 │ 4. Insert user profile
                 ▼
        ┌─────────────────────────┐
        │ Supabase Database       │
        │ - INSERT into users     │
        │ - RLS enforces security │
        └────────┬────────────────┘
                 │ 5. Return token
                 ▼
        ┌─────────────────────────┐
        │ API Route               │
        │ - Return token          │
        │ - Return user_id        │
        └────────┬────────────────┘
                 │ 6. JSON response
                 ▼
        ┌─────────────────────────┐
        │ Frontend (React)        │
        │ - Save token to localStorage
        │ - Redirect to dashboard │
        │ - Hide loading state    │
        └─────────────────────────┘
```

---

## Authentication Flow

```
LOGIN FLOW:
┌──────────┐
│  Browser │
└────┬─────┘
     │ 1. User enters email & password
     │ 2. POST /api/auth/login
     ▼
┌──────────────────────┐
│ Next.js API Route    │
│ - Verify input       │
│ - Auth header check  │
└────┬─────────────────┘
     │ 3. Call Supabase auth
     ▼
┌──────────────────────┐
│ Supabase Auth        │
│ - Verify credentials │
│ - Generate JWT       │
└────┬─────────────────┘
     │ 4. Return JWT token
     ▼
┌──────────────────────┐
│ Next.js API Route    │
│ - Return to frontend │
└────┬─────────────────┘
     │ 5. JSON: {token, user_id}
     ▼
┌──────────────────────┐
│ Browser              │
│ - Save token         │
│ - localStorage.setItem('auth_token', token)
│ - Redirect to dashboard
└──────────────────────┘

SUBSEQUENT REQUESTS:
┌──────────────────────┐
│ Browser              │
└────┬─────────────────┘
     │ Authorization: Bearer {token}
     ▼
┌──────────────────────┐
│ Next.js API Route    │
│ - Extract token      │
│ - Verify token       │
└────┬─────────────────┘
     │ Verify with Supabase
     ▼
┌──────────────────────┐
│ Supabase             │
│ - Check token valid  │
│ - Get user_id        │
└────┬─────────────────┘
     │ Token + user_id
     ▼
┌──────────────────────┐
│ Process request      │
│ - Apply RLS policies │
│ - Return user data   │
└──────────────────────┘
```

---

## Database Query Example with RLS

```
SCENARIO: User A creates transaction

1. Frontend sends:
   ┌────────────────────────────┐
   │ POST /api/transactions     │
   │ Authorization: Bearer {jwt}│
   │ Body: {                    │
   │   customer_id: "CUST001",  │
   │   pickup_location: "Dubai" │
   │ }                          │
   └────────────────────────────┘

2. API Route receives request:
   - Extracts token from Authorization header
   - Calls: verifyToken(token) → returns user_id: "uuid-123"
   - Knows request is from User A

3. API executes SQL:
   ┌──────────────────────────────────────────────┐
   │ INSERT INTO transactions (                   │
   │   user_id,                    ← Set to "uuid-123"
   │   customer_id,                ← From request body
   │   pickup_location,            ← From request body
   │   date,                       ← From request body
   │   time,                       ← From request body
   │   price                       ← From request body
   │ ) VALUES (...)                              │
   └──────────────────────────────────────────────┘

4. Supabase applies RLS policy:
   Policy: "Users can create transactions"
   WITH CHECK (auth.uid() = user_id)
   
   ✅ ALLOWED: Because user_id = "uuid-123" (current user)

5. Transaction is created:
   ┌──────────────────────────────────────────────┐
   │ transactions table:                         │
   │ id: "txn-abc123"                            │
   │ user_id: "uuid-123"          ← User A's ID  │
   │ customer_id: "CUST001"                      │
   │ pickup_location: "Dubai"                    │
   │ date: "2025-12-04"                          │
   │ price: 150.00                               │
   └──────────────────────────────────────────────┘

6. When User B queries transactions:
   SELECT * FROM transactions
   
   Supabase applies RLS:
   Policy: "Users can read their own transactions"
   USING (auth.uid() = user_id)
   
   🚫 FILTERED: User B only sees rows where user_id = "uuid-456"
   🚫 User B CANNOT see User A's transaction!
```

---

## Environment Variables Flow

```
Development (Local):
.env.local (on your computer)
│
├─ NEXT_PUBLIC_SUPABASE_URL
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
├─ SUPABASE_SERVICE_ROLE_KEY
└─ Used by: npm run dev

                    ▼

Production (Vercel):
Vercel Environment Variables (encrypted dashboard)
│
├─ NEXT_PUBLIC_SUPABASE_URL
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
├─ SUPABASE_SERVICE_ROLE_KEY
└─ Used by: Vercel deployment

                    ▼

Runtime:
API Routes use these variables to connect to Supabase
│
├─ Frontend uses: NEXT_PUBLIC_* (public, safe)
└─ Backend uses: All variables including SERVICE_ROLE_KEY (secure)
```

---

## Security Architecture

```
PUBLIC ACCESS (Browser):
  ├─ NEXT_PUBLIC_SUPABASE_URL ✓ Safe (URL only)
  └─ NEXT_PUBLIC_SUPABASE_ANON_KEY ✓ Safe (read-only with RLS)

PRIVATE ACCESS (Vercel Backend):
  ├─ SUPABASE_SERVICE_ROLE_KEY 🔐 Secure (never exposed)
  └─ Environment variables 🔐 Encrypted on Vercel

DATABASE LEVEL:
  ├─ RLS Policies 🛡️ (Automatic row filtering)
  ├─ User Authentication 🔐 (JWT verified)
  ├─ Encryption at rest ✓ (Supabase default)
  └─ HTTPS in transit ✓ (Automatic)

USER DATA PROTECTION:
  Each user only sees their own data
  ├─ Own transactions ✓
  ├─ Other users' transactions ✗
  ├─ Other users' profiles ✗
  └─ Admin data access ✗ (unless admin role added)
```

---

## Deployment Pipeline

```
LOCAL DEVELOPMENT:
┌─────────────┐
│ Your Computer
│ code changes │
└──────┬──────┘
       │ git commit + git push
       ▼
┌─────────────────────────────────────┐
│ GitHub Repository                   │
│ Stores your code & history          │
│ Triggers Vercel on push to main     │
└──────┬──────────────────────────────┘
       │ GitHub webhook notification
       ▼
┌─────────────────────────────────────┐
│ Vercel CI/CD Pipeline               │
│ 1. Clone repository                 │
│ 2. Install dependencies             │
│ 3. Build project                    │
│ 4. Run tests (if configured)        │
│ 5. Deploy to edge network           │
└──────┬──────────────────────────────┘
       │
       ├─ ✅ Success → Deploy to Production
       │
       └─ ❌ Failure → Show logs, don't deploy
       
PRODUCTION:
┌─────────────────────────────────────┐
│ Vercel Global Network               │
│ - Multiple regions worldwide        │
│ - Auto-scaling                      │
│ - SSL/HTTPS                         │
│ - CDN for static assets             │
│ - Serverless functions              │
└─────────────────────────────────────┘
```

---

## Performance Flow

```
USER REQUEST:
User at Distance X from Server
│
├─ Request hits nearest Vercel edge (CDN)
├─ Cache static files (instant)
├─ Route dynamic requests to origin
│
└─ Backend Processing:
   ├─ Validate token
   ├─ Query Supabase
   │  └─ RLS policy check
   │  └─ Database query
   │  └─ Return filtered results
   ├─ Format response
   └─ Send back to user

RESPONSE TIME:
Static files: ~50-100ms (cached)
API calls: ~200-500ms (database roundtrip)
Total: ~300-600ms
```

---

## Scalability Architecture

```
CURRENT SETUP:
Single Vercel deployment handles ~1,000s concurrent users
Single Supabase database handles ~10,000s transactions

WHEN YOU NEED TO SCALE:

1. More Users:
   ├─ Vercel automatically scales serverless functions
   ├─ No code changes needed
   └─ Supabase scales automatically

2. More Data:
   ├─ Supabase Pro plan ($25/month)
   ├─ Larger compute add-ons
   ├─ Connection pooling
   └─ Read replicas (if needed)

3. Better Performance:
   ├─ Add Supabase indexes (already done!)
   ├─ Implement caching
   ├─ Optimize queries
   └─ Use analytics to find bottlenecks
```

---

## Next.js App Router Structure

```
YOUR APP:
src/
├── app/                           # App Router
│   ├── page.tsx                  # / (Login page)
│   ├── signup/page.tsx           # /signup
│   ├── dashboard/page.tsx        # /dashboard (protected)
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── api/                      # Backend API routes
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── signup/route.ts
│       └── transactions/
│           ├── create/route.ts
│           ├── list/route.ts
│           ├── delete/route.ts
│           ├── update/route.ts
│           └── metrics/route.ts
├── components/                   # React components
│   ├── DashboardMetrics.tsx
│   ├── TransactionForm.tsx
│   └── TransactionsList.tsx
└── lib/                          # Utility functions
    ├── supabase.ts              # Database client
    ├── api.ts                   # API client
    ├── auth.ts                  # Auth utilities
    └── utils.ts                 # General utilities
```

---

## Key Points

✅ **Frontend**: React components run in browser, display UI
✅ **Backend**: Next.js API routes run on Vercel servers
✅ **Database**: Supabase PostgreSQL stores all data
✅ **Auth**: Supabase manages users and JWT tokens
✅ **Security**: RLS policies protect user data
✅ **Global**: Vercel CDN serves to users worldwide
✅ **Scalable**: Automatically handles more users/data
✅ **Production**: Everything is encrypted and secured

You're ready to deploy! 🚀
