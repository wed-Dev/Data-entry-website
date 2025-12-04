# 📡 API Documentation

Complete API reference for the Business Transaction Entry System.

## 🌐 Base URL

```
Development: http://localhost:3000/api
Production:  https://your-app.vercel.app/api
```

## 🔐 Authentication

All endpoints (except `/auth/login` and `/auth/signup`) require a Bearer token:

```
Authorization: Bearer <JWT_TOKEN>
```

## 📚 Endpoints

### Authentication Endpoints

#### 1. Login

**Endpoint**: `POST /auth/login`

**Public**: Yes (no token required)

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": "user_12345",
  "name": "John Doe"
}
```

**Error** (401):
```json
{
  "error": "Invalid email or password"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo@123"}'
```

---

#### 2. Sign Up

**Endpoint**: `POST /auth/signup`

**Public**: Yes (no token required)

**Request**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": "user_12345",
  "name": "John Doe"
}
```

**Error** (400):
```json
{
  "error": "Email already registered"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "password":"SecurePass123"
  }'
```

---

### Transaction Endpoints

#### 3. Create Transaction

**Endpoint**: `POST /transactions/create`

**Protected**: Yes (requires token)

**Request**:
```json
{
  "customer_id": "CUST001",
  "pickup_location": "Downtown Dubai",
  "destination_location": "Dubai Marina",
  "date": "2025-12-04",
  "time": "09:30",
  "price": 150.00
}
```

**Response** (201):
```json
{
  "id": "txn_abc123def456",
  "user_id": "user_12345",
  "customer_id": "CUST001",
  "pickup_location": "Downtown Dubai",
  "destination_location": "Dubai Marina",
  "date": "2025-12-04",
  "time": "09:30",
  "price": 150.00,
  "created_at": "2025-12-04T09:30:00Z"
}
```

**Error** (400):
```json
{
  "error": "Missing required fields"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/transactions/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "customer_id":"CUST001",
    "pickup_location":"Downtown Dubai",
    "destination_location":"Dubai Marina",
    "date":"2025-12-04",
    "time":"09:30",
    "price":150.00
  }'
```

---

#### 4. List Transactions

**Endpoint**: `GET /transactions/list`

**Protected**: Yes (requires token)

**Query Parameters**: None (filters applied on frontend)

**Response** (200):
```json
{
  "transactions": [
    {
      "id": "txn_abc123def456",
      "user_id": "user_12345",
      "customer_id": "CUST001",
      "pickup_location": "Downtown Dubai",
      "destination_location": "Dubai Marina",
      "date": "2025-12-04",
      "time": "09:30",
      "price": 150.00,
      "created_at": "2025-12-04T09:30:00Z"
    },
    {
      "id": "txn_xyz789abc123",
      "user_id": "user_12345",
      "customer_id": "CUST002",
      "pickup_location": "JBR Beach",
      "destination_location": "Downtown Dubai",
      "date": "2025-12-04",
      "time": "14:15",
      "price": 200.50,
      "created_at": "2025-12-04T14:15:00Z"
    }
  ]
}
```

**Error** (401):
```json
{
  "error": "Unauthorized"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/transactions/list \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### 5. Get Metrics

**Endpoint**: `GET /transactions/metrics`

**Protected**: Yes (requires token)

**Response** (200):
```json
{
  "totalTransactions": 42,
  "todayTransactions": 3,
  "totalRevenue": 8542.50,
  "todayRevenue": 525.50
}
```

**Error** (401):
```json
{
  "error": "Unauthorized"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/transactions/metrics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Data Types

### Transaction Object

```typescript
{
  id: string              // Unique transaction ID
  user_id: string         // Owner's user ID
  customer_id: string     // Customer identifier
  pickup_location: string // Starting location
  destination_location: string  // Ending location
  date: string           // Date in YYYY-MM-DD format
  time: string           // Time in HH:MM format
  price: number          // Amount in AED
  created_at: string     // ISO 8601 timestamp
}
```

### User Object

```typescript
{
  id: string             // Unique user ID
  email: string          // User email
  name: string           // User full name
  token: string          // JWT authentication token
}
```

### Metrics Object

```typescript
{
  totalTransactions: number   // Total count of transactions
  todayTransactions: number   // Count of today's transactions
  totalRevenue: number        // Sum of all transaction prices
  todayRevenue: number        // Sum of today's transaction prices
}
```

---

## ❌ Error Responses

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Data retrieved successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Missing/invalid fields |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## 🔑 Token Management

### Getting a Token

1. Login or signup to receive a token
2. Store in `localStorage`:
   ```javascript
   localStorage.setItem('auth_token', response.token)
   ```

### Using a Token

Include in Authorization header:
```javascript
fetch('/api/transactions/list', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
```

### Token Expiration

- Default expiration: 24 hours
- Re-login when expired
- Token stored in browser localStorage

---

## 📝 Request Examples

### JavaScript/Fetch

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
const data = await response.json()
localStorage.setItem('auth_token', data.token)

// Create transaction
const txnResponse = await fetch('/api/transactions/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  },
  body: JSON.stringify({
    customer_id: 'CUST001',
    pickup_location: 'Downtown Dubai',
    destination_location: 'Dubai Marina',
    date: '2025-12-04',
    time: '09:30',
    price: 150.00
  })
})
```

### Python/Requests

```python
import requests

# Login
response = requests.post('http://localhost:3000/api/auth/login', json={
    'email': 'user@example.com',
    'password': 'password123'
})
token = response.json()['token']

# Create transaction
headers = {'Authorization': f'Bearer {token}'}
response = requests.post('http://localhost:3000/api/transactions/create',
    headers=headers,
    json={
        'customer_id': 'CUST001',
        'pickup_location': 'Downtown Dubai',
        'destination_location': 'Dubai Marina',
        'date': '2025-12-04',
        'time': '09:30',
        'price': 150.00
    }
)
print(response.json())
```

### cURL

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.token')

# Create transaction
curl -X POST http://localhost:3000/api/transactions/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customer_id":"CUST001",
    "pickup_location":"Downtown Dubai",
    "destination_location":"Dubai Marina",
    "date":"2025-12-04",
    "time":"09:30",
    "price":150.00
  }'
```

---

## 🔐 Security Best Practices

1. **Never expose tokens** - Don't log or store in public places
2. **Use HTTPS** - Always use encrypted connections
3. **Validate input** - Check data types and ranges
4. **Rate limiting** - Implement to prevent abuse
5. **CORS** - Properly configure allowed origins
6. **SQL injection** - Use parameterized queries (already implemented)

---

## 📈 Performance Tips

1. **Batch requests** - Combine multiple queries when possible
2. **Cache results** - Store metrics locally when possible
3. **Pagination** - Use limit/offset for large result sets
4. **Compression** - Use gzip compression for responses
5. **CDN** - Use Vercel's built-in CDN for static assets

---

## 🐛 Debugging

Enable debug mode in browser console:

```javascript
// Log all API calls
window.fetch = (function(original) {
  return function(...args) {
    console.log('API Call:', args[0])
    return original.apply(this, args)
  }
})(fetch)
```

---

## 📞 API Support

- Check [SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md) for issues
- Review code in `src/app/api/` for implementation details
- Test endpoints with provided cURL examples
- Check browser Network tab for detailed request/response info

---

## 🔄 Rate Limiting

Current limits (Free tier):
- 100 requests per minute per user
- Contact support for higher limits

---

## 📡 Webhooks

Not currently supported, but can be implemented for:
- Transaction creation notifications
- Revenue threshold alerts
- User account events

---

Last Updated: December 4, 2025
API Version: 1.0.0
