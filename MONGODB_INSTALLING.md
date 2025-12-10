# 🚀 Quick MongoDB Installation Guide

## You're currently downloading MongoDB - here's what to do next:

### ⏳ While MongoDB Downloads:

The application will show an error: **"Database connection failed"** until MongoDB is installed and running.

---

## 📥 After Download Completes:

### Option 1: Install MongoDB MSI (You're doing this now)

1. **Run the MSI installer**
2. **Choose "Complete" installation**
3. **Install as a Windows Service** (check this box)
4. **Install MongoDB Compass** (optional GUI tool)
5. Click "Install"
6. Wait for installation to complete

### Option 2: Quick Docker Install (Alternative - Faster!)

If you have Docker installed:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

This starts MongoDB in seconds!

---

## ✅ After MongoDB is Installed:

### 1. Verify MongoDB is Running

**Check if MongoDB service is running:**

```powershell
# PowerShell
Get-Service -Name MongoDB
```

Should show: **Status: Running**

**Or check the port:**
```powershell
Test-NetConnection localhost -Port 27017
```

Should show: **TcpTestSucceeded : True**

### 2. Restart Your Development Server

Press `Ctrl+C` in your terminal to stop, then:

```bash
npm run dev
```

### 3. Try Signup Again

1. Go to: http://localhost:3001/auth/signup
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Sign Up"

**It should work now!** ✅

---

## 🔧 Troubleshooting

### MongoDB Not Running?

**Start MongoDB Service:**

```powershell
# PowerShell (Run as Administrator)
Start-Service MongoDB
```

**Or restart it:**
```powershell
Restart-Service MongoDB
```

### Still Getting Errors?

**Check if MongoDB is listening:**

1. Open Command Prompt
2. Run:
   ```bash
   mongosh
   ```
3. You should see:
   ```
   Current Mongosh Log ID: ...
   Connecting to: mongodb://127.0.0.1:27017
   ```

If it connects, MongoDB is working!

### Connection String Issues?

Your `.env.local` should have:
```env
MONGODB_URI=mongodb://localhost:27017/invoice-entry
```

---

## 🎯 Expected Error Messages

### While MongoDB is Installing:

**In Browser Console:**
```
POST http://localhost:3001/api/auth/signup 500 (Internal Server Error)
```

**Error Toast:**
```
Database connection failed. Please ensure MongoDB is running.
```

**This is normal!** The error will disappear once MongoDB is installed and running.

---

## 📊 How to Know It's Working:

### Signs MongoDB is Working:

1. ✅ Signup form completes successfully
2. ✅ No "Database connection failed" errors
3. ✅ Server console shows: `✅ MongoDB connected successfully`
4. ✅ You can login with credentials
5. ✅ Dashboard loads

### Server Console When Working:

```
✅ MongoDB connected successfully
 POST /api/auth/signup 201 in 234ms
```

---

## 🚀 Quick Alternative: Use Docker (5 seconds!)

If you have Docker Desktop:

```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps
```

Then restart your dev server and signup should work!

---

## 📍 MongoDB Default Locations

After installation, MongoDB will be at:

- **Program**: `C:\Program Files\MongoDB\Server\7.0\bin\`
- **Data**: `C:\data\db\`
- **Config**: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

---

## 🔍 View Your Data

### Using MongoDB Compass (GUI):

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Look for database: `invoice-entry`
4. Collections: `users`, `transactions`

### Using Command Line:

```bash
mongosh
use invoice-entry
db.users.find()
db.transactions.find()
```

---

## ⚡ Quick Start Checklist

- [ ] MongoDB MSI downloaded
- [ ] MSI installer completed
- [ ] MongoDB service is running
- [ ] Port 27017 is open
- [ ] Dev server restarted
- [ ] Signup page tested
- [ ] Account created successfully

---

## 🎉 Once Working:

You can:
1. ✅ Create accounts
2. ✅ Login
3. ✅ Add transactions
4. ✅ View dashboard
5. ✅ See analytics
6. ✅ Full CRUD operations

---

## 💡 Pro Tips:

1. **MongoDB Compass** - Install it for easy database viewing
2. **Windows Service** - MongoDB will auto-start with Windows
3. **Data Location** - Don't delete `C:\data\db\` folder
4. **Backups** - Use `mongodump` command for backups

---

## 🆘 Still Having Issues?

1. **Reinstall MongoDB** - Sometimes helps
2. **Check Windows Firewall** - Allow MongoDB
3. **Try Docker** - Simpler alternative
4. **Check logs**: `C:\Program Files\MongoDB\Server\7.0\log\`

---

**Current Status:** ⏳ Waiting for MongoDB installation

**Next Step:** Install MongoDB MSI → Restart dev server → Try signup again

---

**Time Estimate:**
- MongoDB Install: 5-10 minutes
- First Signup: 30 seconds
- Total: < 15 minutes to full working app!
