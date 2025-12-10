# MongoDB Setup Guide for Invoice Entry Application

## Quick Start

### Option 1: Local MongoDB (Easiest for Development)

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

2. **Connection String (already in .env.local)**
   ```
   MONGODB_URI=mongodb://localhost:27017/invoice-entry
   ```

3. **That's it!** MongoDB will create the database and collections automatically.

### Option 2: MongoDB Atlas (Free Cloud Database)

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Click "Sign Up" and create free account

2. **Create Cluster**
   - Choose "Free Shared" tier (M0)
   - Select your region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `invoiceuser`
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string (looks like):
     ```
     mongodb+srv://invoiceuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `invoice-entry`
     ```
     mongodb+srv://invoiceuser:yourpassword@cluster0.xxxxx.mongodb.net/invoice-entry?retryWrites=true&w=majority
     ```

6. **Update .env.local**
   ```
   MONGODB_URI=mongodb+srv://invoiceuser:yourpassword@cluster0.xxxxx.mongodb.net/invoice-entry?retryWrites=true&w=majority
   ```

## Environment Variables Setup

Update your `.env.local` file:

```env
# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string-here

# NextAuth Configuration  
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Generate NEXTAUTH_SECRET

Run this command:
```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Database Schema

MongoDB will automatically create these collections:

### Users Collection
- `_id`: ObjectId (auto-generated)
- `email`: String (unique, lowercase)
- `password`: String (hashed with bcrypt)
- `name`: String (optional)
- `createdAt`: Date
- `updatedAt`: Date

### Transactions Collection
- `_id`: ObjectId (auto-generated)
- `userId`: ObjectId (reference to User)
- `customerId`: String
- `pickupLocation`: String
- `destination`: String
- `date`: Date
- `time`: String
- `vehicleType`: String (optional)
- `price`: Number
- `notes`: String (optional)
- `createdAt`: Date
- `updatedAt`: Date

**Indexes automatically created:**
- `userId` (for fast user queries)
- `date` (for date range queries)
- `userId + createdAt` (for sorted user queries)

## Testing the Connection

1. **Start your Next.js app:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:3000/auth/signup

3. **Create an account** - if it works, MongoDB is connected!

## Verifying MongoDB Connection

### For Local MongoDB:
```bash
mongosh
use invoice-entry
db.users.find()
db.transactions.find()
```

### For MongoDB Atlas:
- Use MongoDB Compass (GUI tool)
- Or use the online Atlas interface: Database > Browse Collections

## Migration from Supabase

Your data model is similar, but with these changes:

| Supabase (snake_case) | MongoDB (camelCase) |
|-----------------------|---------------------|
| user_id              | userId              |
| customer_id          | customerId          |
| pickup_location      | pickupLocation      |
| vehicle_type         | vehicleType         |
| created_at           | createdAt           |
| updated_at           | updatedAt           |

## Benefits of MongoDB over Supabase

✅ **Simpler Setup** - No external service configuration
✅ **Local Development** - Work offline
✅ **No Complex Auth** - Simple email/password
✅ **Flexible Schema** - Easy to add fields
✅ **Free Forever** - MongoDB Atlas free tier has no time limit
✅ **Better Performance** - Direct database queries
✅ **No RLS Complexity** - Simple user filtering

## Troubleshooting

### "Cannot connect to MongoDB"
- Check MONGODB_URI is correct
- For Atlas: Verify IP whitelist includes your IP
- For local: Ensure MongoDB service is running

### "Authentication failed"
- Double-check username/password in connection string
- Ensure user has correct permissions in Atlas

### "Cannot find module 'mongoose'"
- Run: `npm install mongoose next-auth bcryptjs @types/bcryptjs`

## Next Steps

1. Update `.env.local` with your MongoDB connection string
2. Generate and add NEXTAUTH_SECRET
3. Restart your development server
4. Create a test account at `/auth/signup`
5. Start using your app!
