# Database Schema Documentation

## 📊 Overview

This document describes the complete database schema for the Business Transaction Entry System using Supabase (PostgreSQL).

---

## 🗄 Tables

### 1. Users Table

**Purpose**: Store user profile information (extends Supabase auth.users)

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, FK auth.users | User's unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| name | VARCHAR(255) | - | User's full name |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation timestamp |

**Indexes**:
- `id` (primary key)
- `email` (unique)

---

### 2. Transactions Table

**Purpose**: Store all business transactions

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id VARCHAR(255) NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  destination_location VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Transaction unique identifier |
| user_id | UUID | NOT NULL, FK users | Owner of the transaction |
| customer_id | VARCHAR(255) | NOT NULL | Customer identifier (e.g., CUST001) |
| pickup_location | VARCHAR(255) | NOT NULL | Starting location |
| destination_location | VARCHAR(255) | NOT NULL | Ending location |
| date | DATE | NOT NULL | Transaction date |
| time | TIME | NOT NULL | Transaction time |
| price | DECIMAL(10, 2) | NOT NULL | Transaction amount in AED |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update timestamp |

**Indexes**:
- `id` (primary key)
- `user_id` (for filtering by user)
- `date` (for date-based queries)
- `customer_id` (for search functionality)

---

## 🔐 Row Level Security (RLS) Policies

### Users Table Policies

```sql
-- SELECT: Users can only view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Transactions Table Policies

```sql
-- SELECT: Users can only view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can only create transactions for themselves
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only modify their own transactions
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own transactions
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 📋 Data Types Reference

| Type | Range | Usage |
|------|-------|-------|
| UUID | 128-bit | Unique identifiers |
| VARCHAR(n) | Up to n characters | Text fields |
| DATE | - | Date only (YYYY-MM-DD) |
| TIME | - | Time only (HH:MM:SS) |
| DECIMAL(10,2) | -99999999.99 to 99999999.99 | Monetary amounts |
| TIMESTAMP | - | Date + Time |

---

## 🔑 Foreign Key Relationships

```
auth.users (Supabase built-in)
    ↓
users.id
    ↓
transactions.user_id (FK)
```

**On Delete Cascade**: If a user is deleted, all their transactions are automatically deleted.

---

## � Update Transaction

To update an existing transaction, use the UPDATE API:

```sql
-- Update transaction
UPDATE transactions 
SET customer_id = 'NEW_CUST',
    pickup_location = 'New Location',
    destination_location = 'New Destination',
    date = '2025-12-05',
    time = '10:00',
    price = 250.00
WHERE id = 'transaction-id-here'
AND user_id = 'user-id-here';
```

## 🗑 Delete Transaction

To delete a transaction:

```sql
-- Delete transaction
DELETE FROM transactions
WHERE id = 'transaction-id-here'
AND user_id = 'user-id-here';
```

## �🚀 Migration Script

To set up the database from scratch, run this SQL in Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id VARCHAR(255) NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  destination_location VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create RLS policies for transactions table
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 📊 Sample Data

### Users

```sql
INSERT INTO users (id, email, name) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', 'Demo User'),
('550e8400-e29b-41d4-a716-446655440001', 'test@example.com', 'Test User');
```

### Transactions

```sql
INSERT INTO transactions (user_id, customer_id, pickup_location, destination_location, date, time, price) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'CUST001', 'Downtown Dubai', 'Dubai Marina', '2025-12-04', '09:30', 150.00),
('550e8400-e29b-41d4-a716-446655440000', 'CUST002', 'JBR Beach', 'Downtown Dubai', '2025-12-04', '14:15', 200.50),
('550e8400-e29b-41d4-a716-446655440000', 'CUST003', 'Mall of the Emirates', 'Burj Khalifa', '2025-12-03', '11:00', 175.75);
```

---

## 🔍 Common Queries

### Get All Transactions for a User

```sql
SELECT * FROM transactions
WHERE user_id = 'user-id-here'
ORDER BY date DESC;
```

### Calculate Daily Revenue

```sql
SELECT DATE(date) as transaction_date, SUM(price) as daily_revenue
FROM transactions
WHERE user_id = 'user-id-here'
GROUP BY DATE(date)
ORDER BY transaction_date DESC;
```

### Get Transactions by Month

```sql
SELECT * FROM transactions
WHERE user_id = 'user-id-here'
AND EXTRACT(MONTH FROM date) = 12
AND EXTRACT(YEAR FROM date) = 2025
ORDER BY date DESC;
```

### Search Transactions

```sql
SELECT * FROM transactions
WHERE user_id = 'user-id-here'
AND (
  customer_id ILIKE '%CUST001%'
  OR pickup_location ILIKE '%downtown%'
  OR destination_location ILIKE '%marina%'
)
ORDER BY date DESC;
```

### Get Today's Transactions

```sql
SELECT * FROM transactions
WHERE user_id = 'user-id-here'
AND date = CURRENT_DATE
ORDER BY time DESC;
```

---

## ⚙️ Performance Considerations

1. **Indexes**: Created on frequently queried columns (user_id, date, customer_id)
2. **Partitioning**: Consider partitioning by year/month if data grows > 1M rows
3. **Archiving**: Archive old transactions (> 2 years) to separate table
4. **Caching**: Cache metrics queries with Redis if needed

---

## 🔒 Security Measures

1. **Row Level Security**: Enabled on all user-facing tables
2. **SQL Injection**: Prevented by using parameterized queries
3. **Data Encryption**: Supabase encrypts data at rest
4. **SSL/TLS**: All connections encrypted in transit
5. **Audit Logs**: Monitor with Supabase audit logs

---

## 📈 Scalability

### Current Capacity (Free Tier)
- Up to 500 MB database
- Suitable for ~ 50,000 transactions

### Growth Strategy
1. Monitor database size
2. Archive old data if needed
3. Upgrade Supabase tier
4. Implement data retention policies

---

## 🔧 Maintenance

### Regular Tasks

1. **Backup**: Supabase auto-backups daily (free tier: 7 days retention)
2. **Monitoring**: Check query performance monthly
3. **Cleanup**: Remove orphaned records (implement soft deletes)

### Recommended Triggers

```sql
-- Auto-update updated_at timestamp
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 📞 Need Help?

- Check Supabase documentation: https://supabase.com/docs
- PostgreSQL docs: https://www.postgresql.org/docs/
- Contact Supabase support through dashboard
