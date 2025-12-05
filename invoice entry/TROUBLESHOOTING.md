# Troubleshooting Guide

## Common Issues & Solutions

### 1. Authentication Issues

#### Problem: "Invalid credentials" on login
**Symptoms**: Login fails with "Invalid credentials" message

**Solutions**:
1. Verify email and password are correct
2. Check if account exists (try signing up)
3. Clear browser cookies and try again
4. Verify Supabase auth is configured correctly
5. Check browser console for detailed error

**Debug Steps**:
```javascript
// In browser console
const { data } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password'
})
console.log(data)
```

---

#### Problem: Stuck in login redirect loop
**Symptoms**: After login, redirected back to login page repeatedly

**Solutions**:
1. Verify auth callback URL in Supabase Settings > Auth:
   - Should be: `http://localhost:3000/auth/callback`
   - Or: `https://your-domain.com/auth/callback`
2. Clear browser cookies
3. Hard refresh (Ctrl+Shift+R)
4. Try in incognito/private mode
5. Check browser console for errors

**Supabase Check**:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM auth.mfa_amr_claims LIMIT 1;
```

---

#### Problem: "Unable to verify email" during signup
**Symptoms**: Signup succeeds but email verification fails

**Solutions**:
1. Check spam/junk folder for verification email
2. Verify sender email address (supabase notifications email)
3. Try resending verification email from Supabase dashboard
4. Check email configuration in Supabase > Settings > Auth
5. For local testing, use magic link instead

---

### 2. Database Issues

#### Problem: "Unauthorized" when accessing transactions
**Symptoms**: API returns 401 Unauthorized for transaction queries

**Solutions**:
1. Verify user is authenticated:
   ```javascript
   const { data: { user } } = await supabase.auth.getUser()
   console.log(user)
   ```
2. Check if session is valid:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession()
   console.log(session)
   ```
3. Verify Supabase connection variables are correct
4. Check browser DevTools > Application > Cookies for session

---

#### Problem: Transactions table doesn't exist
**Symptoms**: "relation 'transactions' does not exist" error

**Solutions**:
1. Run SQL schema creation from README.md
2. Verify in Supabase > Database > Tables
3. Check for typos in table name
4. Ensure you're connected to correct Supabase project

**Verify Schema**:
```sql
-- Run in Supabase SQL Editor
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'transactions';
```

---

#### Problem: RLS (Row Level Security) blocking queries
**Symptoms**: Transactions visible but can't access them

**Solutions**:
1. Verify RLS is enabled:
   ```sql
   SELECT relname, relrowsecurity FROM pg_class 
   WHERE relname = 'transactions';
   ```
2. Check RLS policies:
   ```sql
   SELECT policyname, qual FROM pg_policies 
   WHERE tablename = 'transactions';
   ```
3. Ensure user_id matches auth.users(id)
4. Test with service role key (for debugging only):
   ```javascript
   const admin = createClient(url, serviceRoleKey)
   ```

---

#### Problem: Slow database queries
**Symptoms**: Pages load slowly, 5+ second waits

**Solutions**:
1. Check if indexes exist:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'transactions';
   ```
2. Create missing indexes:
   ```sql
   CREATE INDEX idx_transactions_user_id ON transactions(user_id);
   CREATE INDEX idx_transactions_date ON transactions(date);
   ```
3. Check connection pooling status in Supabase > Database > Connection Pooler
4. Limit query results (don't fetch all rows)
5. Add pagination to queries

---

### 3. API Endpoint Issues

#### Problem: 500 Internal Server Error
**Symptoms**: API returns 500 error

**Solutions**:
1. Check error message in response
2. Look at server logs: `vercel logs --tail`
3. Verify environment variables are set
4. Check database connectivity
5. Try the same request in Postman/curl

**Debugging**:
```bash
# Check environment variables
vercel env pull

# Check build
npm run build

# Test locally
npm run dev
```

---

#### Problem: POST request returns 400 Bad Request
**Symptoms**: Creating transaction fails with 400 error

**Solutions**:
1. Verify all required fields are present:
   - customer_id
   - pickup_location
   - destination
   - date
   - time
   - price
2. Check data types (price should be number, not string)
3. Verify date format (YYYY-MM-DD)
4. Verify time format (HH:MM)
5. Check for special characters that need escaping

**Example Correct Request**:
```javascript
const transaction = {
  customer_id: "C001",
  pickup_location: "Dubai Marina",
  destination: "Dubai Downtown",
  date: "2024-12-05",
  time: "14:30",
  vehicle_type: "Car",
  price: 150.50,
  notes: "Express delivery"
}
```

---

#### Problem: CORS errors
**Symptoms**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions**:
1. Ensure requests are from correct domain
2. Check Supabase CORS settings (usually not needed)
3. Verify API endpoint is correct
4. For development, make sure localhost:3000 is used

**Note**: CORS is handled by Supabase/Next.js automatically

---

### 4. Frontend Issues

#### Problem: Charts not displaying
**Symptoms**: Chart areas show blank space

**Solutions**:
1. Verify Recharts is installed:
   ```bash
   npm list recharts
   ```
2. Check if data is being fetched:
   ```javascript
   console.log(chartData)
   ```
3. Verify data structure matches Recharts expectations
4. Check browser console for JavaScript errors
5. Try using a different chart type

**Test Chart**:
```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={[
    { month: '2024-01', total: 100 },
    { month: '2024-02', total: 200 }
  ]}>
    <Line dataKey="total" />
  </LineChart>
</ResponsiveContainer>
```

---

#### Problem: Form validation not working
**Symptoms**: Form accepts invalid data

**Solutions**:
1. Check validation function:
   ```javascript
   const validateForm = () => {
     if (!customer_id.trim()) return 'Required'
     // ... more validation
   }
   ```
2. Ensure validation runs before submission
3. Check if error message displays
4. Verify all input fields have onChange handlers

---

#### Problem: Modal not closing
**Symptoms**: Modal stays open after action

**Solutions**:
1. Check onClose callback is being called
2. Verify modal state is updated:
   ```javascript
   const [showModal, setShowModal] = useState(false)
   ```
3. Ensure button has onClick handler:
   ```jsx
   <button onClick={() => setShowModal(false)}>Close</button>
   ```
4. Check for console errors

---

#### Problem: Toast notifications not showing
**Symptoms**: Success/error messages not visible

**Solutions**:
1. Verify Toast component is imported
2. Check toast state is being set:
   ```javascript
   setToast({ message: 'Success!', type: 'success' })
   ```
3. Ensure Toast is rendered in JSX:
   ```jsx
   {toast && <Toast {...toast} onClose={() => setToast(null)} />}
   ```
4. Check CSS for display issues
5. Verify z-index is high enough (z-50)

---

#### Problem: Responsive layout broken on mobile
**Symptoms**: Layout doesn't stack properly on small screens

**Solutions**:
1. Check media queries in TailwindCSS classes:
   ```jsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   ```
2. Use DevTools mobile view (F12 > Toggle Device Toolbar)
3. Test actual mobile device
4. Ensure all forms are wrapped in responsive containers
5. Check table horizontal scroll:
   ```jsx
   <div className="overflow-x-auto">
     <table>...</table>
   </div>
   ```

---

### 5. Performance Issues

#### Problem: Slow page loads
**Symptoms**: Pages take 5+ seconds to load

**Solutions**:
1. Check network tab in DevTools
2. Verify API calls are optimized
3. Check bundle size:
   ```bash
   npm run build
   du -sh .next
   ```
4. Implement pagination (don't fetch 1000 records at once)
5. Enable caching:
   ```javascript
   // In API route
   res.setHeader('Cache-Control', 'public, max-age=60')
   ```

---

#### Problem: High memory usage
**Symptoms**: App runs out of memory, becomes unresponsive

**Solutions**:
1. Avoid loading all transactions at once
2. Use pagination
3. Clear component state when unmounting:
   ```javascript
   useEffect(() => {
     return () => setTransactions([])
   }, [])
   ```
4. Monitor with Chrome DevTools > Memory tab

---

### 6. Deployment Issues

#### Problem: Build fails on Vercel
**Symptoms**: "Build failed" in Vercel dashboard

**Solutions**:
1. Check build logs for error messages
2. Try building locally:
   ```bash
   npm run build
   ```
3. Check TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```
4. Verify all environment variables are set
5. Check package.json for build command

---

#### Problem: Application works locally but not on production
**Symptoms**: "Error" on production, works on localhost

**Solutions**:
1. Verify environment variables match production
2. Check Supabase project is the production one
3. Verify auth callback URL includes production domain
4. Check CORS/domain configuration
5. Look at production error logs:
   ```bash
   vercel logs --prod --tail
   ```

---

#### Problem: Environment variables not loading
**Symptoms**: Variables are undefined in production

**Solutions**:
1. Verify variables are set in Vercel:
   - Settings > Environment Variables
2. Ensure prefix: `NEXT_PUBLIC_` for client-side variables
3. Rebuild after adding variables:
   ```bash
   vercel --prod
   ```
4. Verify correct environment (Production/Preview)
5. Check for typos in variable names

---

### 7. Data Issues

#### Problem: Can't see any transactions
**Symptoms**: Dashboard shows 0 transactions

**Solutions**:
1. Verify transactions were created with current user_id
2. Check RLS policies allow SELECT:
   ```sql
   SELECT * FROM transactions;
   ```
3. Verify user is logged in with correct account
4. Check if transactions exist in different date range
5. Verify API response has data:
   ```javascript
   console.log(response.data.data)
   ```

---

#### Problem: Deleted transaction still appears
**Symptoms**: After deleting, transaction still shows

**Solutions**:
1. Hard refresh page (Ctrl+Shift+R)
2. Verify DELETE request succeeded (check status code)
3. Check if useEffect re-fetches data after delete
4. Clear local state after delete:
   ```javascript
   setTransactions(prev => prev.filter(t => t.id !== id))
   ```

---

#### Problem: Edited transaction not updating
**Symptoms**: Changes don't save or revert

**Solutions**:
1. Check PUT request succeeded (status 200)
2. Verify API returns updated data
3. Ensure component state is updated
4. Hard refresh to verify database change
5. Check if field validation rejects changes

---

### 8. Security Issues

#### Problem: Can see other user's transactions
**Symptoms**: Security breach - viewing data shouldn't be accessible

**Solutions**:
1. **CRITICAL**: Verify RLS policies are enabled
   ```sql
   SELECT relrowsecurity FROM pg_class WHERE relname = 'transactions';
   ```
2. Check policy filters by correct user_id
3. Verify auth.uid() function is used in policies
4. Test with multiple user accounts
5. Audit API endpoints for auth checks

---

#### Problem: Session expires immediately
**Symptoms**: Logged out after few seconds

**Solutions**:
1. Check session timeout in Supabase (default: 1 hour)
2. Verify cookie settings
3. Ensure middleware doesn't prematurely invalidate session
4. Check browser console for session errors
5. Clear cookies and login again

---

### 9. Supabase-Specific Issues

#### Problem: "Unable to connect to Supabase"
**Symptoms**: Connection errors in logs

**Solutions**:
1. Verify NEXT_PUBLIC_SUPABASE_URL is correct (include https://)
2. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
3. Check Supabase project is running
4. Verify network connectivity (no firewall blocking)
5. Check if Supabase service is down (check status page)

---

#### Problem: "Function undefined" for Supabase functions
**Symptoms**: Auth function not working

**Solutions**:
1. Verify correct import:
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   ```
2. Check Supabase is properly initialized
3. Verify API key has correct permissions
4. Check if custom functions are defined in Supabase

---

## Debugging Techniques

### 1. Browser DevTools
```javascript
// Check authentication
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Test API call
const response = await fetch('/api/transactions')
console.log('Response:', await response.json())

// Check local storage
console.log(localStorage)

// Monitor network requests
// Network tab > Filter for API calls
```

### 2. Server-Side Debugging
```bash
# View Vercel logs
vercel logs --tail

# Local development
npm run dev

# Check environment variables
vercel env pull

# View build output
npm run build
cat .next/server/app/api/transactions/route.js
```

### 3. Database Debugging
```sql
-- Check user transactions
SELECT * FROM transactions WHERE user_id = 'your-user-id';

-- Check transaction count
SELECT COUNT(*) FROM transactions;

-- Check RLS policies
SELECT policyname, permissive, roles FROM pg_policies WHERE tablename = 'transactions';

-- Test query
SELECT * FROM transactions WHERE user_id = auth.uid();
```

### 4. Supabase Console
1. Go to Supabase Dashboard
2. Auth > Users - verify user exists
3. Database > transactions - check data
4. Logs - view real-time logs
5. SQL Editor - test queries

---

## When to Escalate

Contact support if:
1. Database is down or unresponsive
2. Authentication service not working
3. Deployment fails without clear error
4. Data loss or corruption
5. Security concerns

### Support Resources
- **Supabase**: https://supabase.com/support
- **Vercel**: https://vercel.com/support
- **Next.js**: https://github.com/vercel/next.js/discussions

---

## Performance Diagnostics

### Check Database Performance
```sql
-- Slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename = 'transactions';
```

### Monitor API Performance
```javascript
console.time('API Call')
const response = await fetch('/api/transactions')
console.timeEnd('API Call')
```

### Check Bundle Size
```bash
npm install --save-dev @next/bundle-analyzer

# In next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

# Build
ANALYZE=true npm run build
```

---

## Quick Reference Checklist

- [ ] Authentication working (test signup/login)
- [ ] Database schema created (verify tables exist)
- [ ] RLS policies enabled and correct
- [ ] Environment variables configured
- [ ] API endpoints responding
- [ ] Charts displaying
- [ ] Pagination working
- [ ] Responsive on mobile
- [ ] Performance acceptable (<3s page load)
- [ ] No console errors
- [ ] Security policies in place (RLS, auth checks)
- [ ] Logs monitoring configured
- [ ] Backups scheduled
