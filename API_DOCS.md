# API Documentation

Complete reference for all API endpoints in the Invoice Entry application.

## Base URL

**Development**: `http://localhost:3000/api`
**Production**: `https://your-domain.vercel.app/api`

## Authentication

All API endpoints (except auth) require:
- Valid Supabase session cookie (automatically handled by middleware)
- User must be authenticated via Supabase Auth

## Endpoints

---

## 1. Transactions

### 1.1 Create Transaction
**Endpoint**: `POST /api/transactions`

**Authentication**: Required

**Request Body**:
```json
{
  "customer_id": "C001",
  "pickup_location": "Dubai Marina",
  "destination": "Dubai Downtown",
  "date": "2024-12-05",
  "time": "14:30",
  "vehicle_type": "Car",
  "price": 150.50,
  "notes": "Express delivery"
}
```

**Request Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| customer_id | string | Yes | Customer identifier |
| pickup_location | string | Yes | Starting location |
| destination | string | Yes | Ending location |
| date | string (YYYY-MM-DD) | Yes | Transaction date |
| time | string (HH:MM) | Yes | Transaction time |
| vehicle_type | string | No | Vehicle type used |
| price | number | Yes | Amount in AED (decimal) |
| notes | string | No | Additional notes |

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-uuid",
  "customer_id": "C001",
  "pickup_location": "Dubai Marina",
  "destination": "Dubai Downtown",
  "date": "2024-12-05",
  "time": "14:30",
  "vehicle_type": "Car",
  "price": 150.50,
  "notes": "Express delivery",
  "created_at": "2024-12-05T10:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### 1.2 Get All Transactions
**Endpoint**: `GET /api/transactions`

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (1-indexed) |
| limit | number | 10 | Records per page |
| sortBy | string | created_at | Field to sort by (created_at, date, price, customer_id) |
| order | string | desc | Sort order (asc, desc) |
| search | string | - | Search term (searches customer_id, pickup_location, destination) |
| month | string | - | Filter by month (YYYY-MM format) |

**Example Requests**:
```bash
# Get first page of 10 records
GET /api/transactions?page=1&limit=10

# Get transactions for December 2024, sorted by price descending
GET /api/transactions?month=2024-12&sortBy=price&order=desc

# Search for specific customer
GET /api/transactions?search=C001&limit=20
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "customer_id": "C001",
      "pickup_location": "Dubai Marina",
      "destination": "Dubai Downtown",
      "date": "2024-12-05",
      "time": "14:30",
      "vehicle_type": "Car",
      "price": 150.50,
      "notes": "Express delivery",
      "created_at": "2024-12-05T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Server error

---

### 1.3 Update Transaction
**Endpoint**: `PUT /api/transactions/:id`

**Authentication**: Required

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Transaction ID |

**Request Body** (all fields optional):
```json
{
  "customer_id": "C001",
  "pickup_location": "Dubai Marina",
  "destination": "Dubai Downtown",
  "date": "2024-12-05",
  "time": "14:30",
  "vehicle_type": "Car",
  "price": 175.00,
  "notes": "Updated notes"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "user_id": "user-uuid",
  "customer_id": "C001",
  "pickup_location": "Dubai Marina",
  "destination": "Dubai Downtown",
  "date": "2024-12-05",
  "time": "14:30",
  "vehicle_type": "Car",
  "price": 175.00,
  "notes": "Updated notes",
  "created_at": "2024-12-05T10:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the transaction owner
- `400 Bad Request`: Invalid data
- `500 Internal Server Error`: Server error

---

### 1.4 Delete Transaction
**Endpoint**: `DELETE /api/transactions/:id`

**Authentication**: Required

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Transaction ID |

**Response** (200 OK):
```json
{
  "success": true
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not the transaction owner
- `400 Bad Request`: Transaction not found
- `500 Internal Server Error`: Server error

---

## 2. Analytics

### 2.1 Get Analytics Data
**Endpoint**: `GET /api/analytics`

**Authentication**: Required

**Query Parameters**: None

**Response** (200 OK):
```json
{
  "monthly_totals": [
    {
      "month": "2024-10",
      "total": 3500.50
    },
    {
      "month": "2024-11",
      "total": 4200.75
    }
  ],
  "daily_totals": [
    {
      "date": "2024-12-01",
      "total": 2
    },
    {
      "date": "2024-12-02",
      "total": 3
    }
  ],
  "most_common_pickup": "Dubai Marina",
  "most_common_destination": "Dubai Downtown",
  "highest_paid_job": 500.00,
  "average_job_value": 150.25,
  "total_yearly_revenue": 15000.50,
  "busy_days": [
    {
      "day": "Friday",
      "count": 45
    },
    {
      "day": "Saturday",
      "count": 42
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

## Response Formats

### Success Response
All successful responses include:
```json
{
  "data": {...},
  "status": 200,
  "message": "Success"
}
```

### Error Response
All error responses include:
```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2024-12-05T10:00:00Z"
}
```

---

## Rate Limiting

- **Free Tier**: 10,000 requests/day
- **Production**: No hard limit (based on Vercel plan)

---

## Authentication Errors

### 401 Unauthorized
Occurs when:
- No authentication session
- Session expired
- Invalid credentials

**Solution**: User should login again via `/auth/login`

### 403 Forbidden
Occurs when:
- Trying to access/modify other user's transaction
- Insufficient permissions

**Solution**: Verify you own the resource

---

## Pagination

All list endpoints support pagination:
```bash
GET /api/transactions?page=1&limit=10
```

**Response includes**:
- `data`: Array of records
- `total`: Total count of all records
- `page`: Current page number
- `limit`: Records per page
- `totalPages`: Total number of pages

---

## Sorting

Sort by any column:
```bash
# Sort by date, descending (newest first)
GET /api/transactions?sortBy=date&order=desc

# Sort by price, ascending
GET /api/transactions?sortBy=price&order=asc
```

**Available sort fields**:
- `created_at` (default)
- `date`
- `price`
- `customer_id`

---

## Filtering

### Search
Full-text search across multiple fields:
```bash
GET /api/transactions?search=Dubai
```

**Searches in**:
- customer_id
- pickup_location
- destination

### Month Filter
Filter by specific month:
```bash
GET /api/transactions?month=2024-12
```

**Format**: `YYYY-MM`

### Multiple Filters
Combine filters:
```bash
GET /api/transactions?month=2024-12&search=Dubai&sortBy=price&order=asc&page=1&limit=20
```

---

## Data Types

### Number (price, etc)
- Type: `number` (decimal)
- Format: IEEE 754 double precision
- Example: `150.50`

### Date
- Type: `string`
- Format: `YYYY-MM-DD`
- Example: `2024-12-05`

### Time
- Type: `string`
- Format: `HH:MM` (24-hour)
- Example: `14:30`

### UUID
- Type: `string`
- Format: `550e8400-e29b-41d4-a716-446655440000`

### Timestamp
- Type: `string`
- Format: ISO 8601
- Example: `2024-12-05T10:00:00Z`

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Login required |
| 403 | Forbidden | Not authorized for this resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Data conflict (e.g., duplicate) |
| 500 | Server Error | Contact support |
| 503 | Service Unavailable | Try again later |

---

## Example Usage

### Create Transaction with cURL
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "C001",
    "pickup_location": "Dubai Marina",
    "destination": "Dubai Downtown",
    "date": "2024-12-05",
    "time": "14:30",
    "price": 150.50
  }'
```

### Create Transaction with JavaScript/Fetch
```javascript
const response = await fetch('/api/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customer_id: 'C001',
    pickup_location: 'Dubai Marina',
    destination: 'Dubai Downtown',
    date: '2024-12-05',
    time: '14:30',
    price: 150.50,
  }),
});

const data = await response.json();
console.log(data);
```

### Create Transaction with Axios
```javascript
import axios from 'axios';

const response = await axios.post('/api/transactions', {
  customer_id: 'C001',
  pickup_location: 'Dubai Marina',
  destination: 'Dubai Downtown',
  date: '2024-12-05',
  time: '14:30',
  price: 150.50,
});

console.log(response.data);
```

---

## Webhooks

Webhooks are not currently implemented. Future releases may support:
- Transaction created
- Transaction updated
- Transaction deleted
- Daily summary email

---

## Versioning

Current API Version: **v1** (implied in URLs)

Future versions will use: `/api/v2/transactions`

---

## Support

For API issues:
1. Check error response for details
2. Review this documentation
3. Check Supabase logs
4. Contact support
