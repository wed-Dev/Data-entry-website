# Database Schema Documentation

## Overview
This document describes the database schema for the Invoice Entry application using Supabase PostgreSQL.

## Tables

### 1. transactions
Stores all transaction records for users.

#### Columns
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | No | Primary key, auto-generated |
| user_id | UUID | No | References auth.users(id), establishes user ownership |
| customer_id | VARCHAR(100) | No | Customer identifier |
| pickup_location | VARCHAR(255) | No | Starting location for delivery |
| destination | VARCHAR(255) | No | Ending location for delivery |
| date | DATE | No | Transaction date |
| time | TIME | No | Transaction time |
| vehicle_type | VARCHAR(100) | Yes | Type of vehicle used (optional) |
| price | DECIMAL(10, 2) | No | Transaction amount in AED |
| notes | TEXT | Yes | Additional notes (optional) |
| created_at | TIMESTAMP | No | Record creation timestamp |
| updated_at | TIMESTAMP | No | Record last update timestamp |

#### Indexes
- `idx_transactions_user_id` on `user_id` - For fast user lookups
- `idx_transactions_date` on `date` - For date range queries
- `idx_transactions_created_at` on `created_at DESC` - For sorting by newest

## Security

### Row Level Security (RLS) Policies

#### SELECT Policy
```sql
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);
```
Users can only view transactions they own.

#### INSERT Policy
```sql
CREATE POLICY "Users can create their own transactions" ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```
Users can only create transactions for themselves.

#### UPDATE Policy
```sql
CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id);
```
Users can only update their own transactions.

#### DELETE Policy
```sql
CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);
```
Users can only delete their own transactions.

## Relationships

```
auth.users (1) ----< (Many) transactions
```

A user can have multiple transactions, but each transaction belongs to exactly one user.

## Query Examples

### Get all transactions for current user
```sql
SELECT * FROM transactions 
WHERE user_id = current_user_id 
ORDER BY created_at DESC;
```

### Get transactions for a specific month
```sql
SELECT * FROM transactions 
WHERE user_id = current_user_id 
AND DATE_TRUNC('month', date) = '2024-12-01'::date
ORDER BY date DESC;
```

### Get revenue by month
```sql
SELECT 
  DATE_TRUNC('month', date)::date as month,
  SUM(price) as total_revenue,
  COUNT(*) as transaction_count
FROM transactions
WHERE user_id = current_user_id
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;
```

### Get most common pickup locations
```sql
SELECT pickup_location, COUNT(*) as frequency
FROM transactions
WHERE user_id = current_user_id
GROUP BY pickup_location
ORDER BY frequency DESC
LIMIT 10;
```

### Get highest paying transactions
```sql
SELECT * FROM transactions
WHERE user_id = current_user_id
ORDER BY price DESC
LIMIT 10;
```

## Migration Notes

### Creating Tables
The SQL provided in README.md under "Set Up Supabase Database" contains all necessary table creation and policy setup.

### Updating Schema
If you need to add columns:
1. Create a migration in Supabase SQL Editor
2. Update TypeScript types
3. Update API endpoints
4. Update React components

### Backups
Supabase automatically backs up data. Access backups from:
Settings > Backups > Point-in-time Recovery

## Performance Considerations

1. **Indexing**: The three indexes ensure optimal query performance for:
   - User lookups (user_id)
   - Date range queries (date)
   - Sorting operations (created_at)

2. **RLS Overhead**: RLS adds minimal overhead (~1-2ms per query) due to efficient policy evaluation

3. **Connection Pooling**: Supabase uses pgBouncer for connection pooling. Recommended limits:
   - Max connections per user: 10
   - Reserved connections: 3

## Scaling

For production with large datasets:
1. Archive old transactions to a separate table
2. Use materialized views for analytics
3. Implement read replicas for analytics queries
4. Consider partitioning by date for very large tables

## Testing the Schema

Use Supabase's SQL Editor to verify:
```sql
-- Check table exists
SELECT tablename FROM pg_tables WHERE tablename = 'transactions';

-- Check RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'transactions';

-- Check policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'transactions';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'transactions';
```
