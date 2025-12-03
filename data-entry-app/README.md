# 🚀 Business Transaction System - Vercel Deployment

A secure, multi-user transaction tracking system with admin and client dashboards, now ready for global deployment on Vercel.

---

## ✨ Features

- 🔐 **Secure Authentication** - Password hashing, session tokens, role-based access
- 👥 **Multi-User Support** - Admin and client roles with data isolation
- 📊 **Real-Time Statistics** - Revenue tracking, daily/monthly reports
- 🌍 **Global Access** - Deploy once, access anywhere with HTTPS
- 💾 **Cloud Database** - Vercel Postgres for reliable data storage
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🎯 Quick Deployment (3 Minutes)

### 1. Install Vercel CLI
```powershell
npm install -g vercel
```

### 2. Create Postgres Database
- Go to https://vercel.com/dashboard
- Storage → Create Database → Postgres
- Copy all POSTGRES_* variables from .env.local tab

### 3. Deploy
```powershell
cd d:\Dubai\data-entry-app
vercel
```

### 4. Add Environment Variables
```powershell
vercel env add POSTGRES_URL
vercel env add POSTGRES_PRISMA_URL
vercel env add POSTGRES_URL_NON_POOLING
vercel env add POSTGRES_USER
vercel env add POSTGRES_HOST
vercel env add POSTGRES_PASSWORD
vercel env add POSTGRES_DATABASE
```

### 5. Final Deploy
```powershell
vercel --prod
```

**Done!** Your app is live at `https://your-project.vercel.app`

---

## 📖 Documentation

- **[QUICK-START.md](QUICK-START.md)** - Fast 3-minute deployment
- **[VERCEL-DEPLOYMENT-GUIDE.md](VERCEL-DEPLOYMENT-GUIDE.md)** - Complete step-by-step guide
- **[VERCEL-READY.md](VERCEL-READY.md)** - What changed and why

---

## 🖥️ Easy Deployment Script

Just run:
```powershell
DEPLOY-TO-VERCEL.bat
```

Interactive menu with options for:
1. First time setup
2. Deploy to production
3. Deploy to preview
4. Add environment variables
5. View logs

---

## 🔑 Default Credentials

**Username:** admin  
**Password:** admin123

⚠️ **Change this immediately after first login!**

---

## 👥 User Roles

### Admin
- Create/delete users
- View all transactions
- Add transactions for any client
- Full system access

### Client
- View only their own transactions
- Add their own transactions
- View their statistics
- Cannot access other clients' data

---

## 🛠️ Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** Vercel Postgres (production), SQLite (local dev)
- **Hosting:** Vercel Serverless Functions
- **Security:** SHA-256 hashing, JWT tokens, CORS

---

## 📁 Project Structure

```
data-entry-app/
├── api/
│   └── index.js              # Serverless function entry
├── db.js                     # Postgres database module
├── server-postgres.js        # Production server (Postgres)
├── server.js                 # Development server (SQLite)
├── vercel.json              # Vercel configuration
├── login.html               # Login page
├── admin.html               # Admin dashboard
├── client.html              # Client dashboard
├── package.json             # Dependencies
└── Documentation files...
```

---

## 🔄 Local Development

### With Postgres (matches production):
```powershell
npm run dev
```

### With SQLite (original version):
```powershell
npm start
```

Both run on `http://localhost:3000`

---

## 🌐 Production URLs

After deployment:
- **Login:** `https://your-project.vercel.app/login.html`
- **Admin:** `https://your-project.vercel.app/admin.html`
- **Client:** `https://your-project.vercel.app/client.html`
- **API:** `https://your-project.vercel.app/api/*`

---

## 🔒 Security Features

✅ Password hashing (SHA-256)  
✅ Session tokens with expiration  
✅ Role-based access control  
✅ Data isolation per client  
✅ HTTPS encryption (automatic)  
✅ CORS protection  
✅ Input validation  

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify session

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Add transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Statistics
- `GET /api/stats` - Dashboard statistics
- `GET /api/monthly/:year/:month` - Monthly report

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/change-password` - Change password

---

## 💰 Cost

### Vercel Free Tier
- Unlimited personal projects
- 100 GB bandwidth/month
- Automatic HTTPS
- Global CDN

### Postgres Free Tier
- 256 MB database
- 60 hours compute/month
- Good for 5-10 active users

**Perfect for small businesses!**

---

## 🔄 Making Updates

After making code changes:
```powershell
vercel --prod
```

Vercel automatically:
- Builds your app
- Deploys globally
- Zero downtime

---

## 🆘 Troubleshooting

### Database connection error
→ Check environment variables in Vercel dashboard

### 404 on API routes
→ Verify `vercel.json` and `api/index.js` exist

### Can't login
→ Wait 30 seconds for database initialization, try again

### Session expired
→ Normal after 24 hours, just login again

**Full troubleshooting guide:** [VERCEL-DEPLOYMENT-GUIDE.md](VERCEL-DEPLOYMENT-GUIDE.md)

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Postgres Docs:** https://vercel.com/docs/storage/vercel-postgres

---

## 📝 License

Private business application. All rights reserved.

---

## 🎉 Ready to Deploy!

Your app is fully configured and ready for Vercel deployment.

**Next step:** Read [QUICK-START.md](QUICK-START.md) and deploy in 3 minutes!

---

**Created:** December 3, 2025  
**Version:** 2.0.0 (Vercel Ready)  
**Database:** Postgres  
**Hosting:** Vercel Serverless  
