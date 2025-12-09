# Expense Tracker API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected routes require a JWT token stored in an httpOnly cookie named `token`.

---

## Auth Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered",
  "user": {
    "id": "675abc123def456",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Cookie Set:** `token` (httpOnly, 7 days)

---

### 2. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "675abc123def456",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Cookie Set:** `token` (httpOnly, 7 days)

---

### 3. Logout
**GET** `/api/auth/logout`

**Response:** `200 OK`
```json
{
  "message": "Logged out"
}
```

**Cookie Cleared:** `token`

---

## Transaction Endpoints

All transaction endpoints require authentication (cookie with valid JWT token).

### 1. Get All Transactions
**GET** `/api/transactions`

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response:** `200 OK`
```json
[
  {
    "_id": "675abc123def789",
    "user": "675abc123def456",
    "type": "expense",
    "amount": 250,
    "category": "Food",
    "description": "Grocery shopping",
    "date": "2025-12-09T10:30:00.000Z",
    "createdAt": "2025-12-09T10:30:00.000Z",
    "updatedAt": "2025-12-09T10:30:00.000Z"
  },
  {
    "_id": "675abc123def790",
    "user": "675abc123def456",
    "type": "income",
    "amount": 5000,
    "category": "Salary",
    "description": "Monthly salary",
    "date": "2025-12-01T00:00:00.000Z",
    "createdAt": "2025-12-01T00:00:00.000Z",
    "updatedAt": "2025-12-01T00:00:00.000Z"
  }
]
```

---

### 2. Get Single Transaction
**GET** `/api/transactions/:id`

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response:** `200 OK`
```json
{
  "_id": "675abc123def789",
  "user": "675abc123def456",
  "type": "expense",
  "amount": 250,
  "category": "Food",
  "description": "Grocery shopping",
  "date": "2025-12-09T10:30:00.000Z",
  "createdAt": "2025-12-09T10:30:00.000Z",
  "updatedAt": "2025-12-09T10:30:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Transaction not found"
}
```

---

### 3. Create Transaction
**POST** `/api/transactions`

**Headers:**
```
Cookie: token=<jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "expense",
  "amount": 150,
  "category": "Transport",
  "description": "Uber ride",
  "date": "2025-12-09T14:00:00.000Z"
}
```

**Required Fields:** `type`, `amount`, `category`

**Optional Fields:** `description`, `date` (defaults to current date)

**Response:** `201 Created`
```json
{
  "_id": "675abc123def791",
  "user": "675abc123def456",
  "type": "expense",
  "amount": 150,
  "category": "Transport",
  "description": "Uber ride",
  "date": "2025-12-09T14:00:00.000Z",
  "createdAt": "2025-12-09T14:00:00.000Z",
  "updatedAt": "2025-12-09T14:00:00.000Z"
}
```

---

### 4. Update Transaction
**PUT** `/api/transactions/:id`

**Headers:**
```
Cookie: token=<jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "expense",
  "amount": 200,
  "category": "Transport",
  "description": "Uber ride - updated",
  "date": "2025-12-09T14:00:00.000Z"
}
```

**Response:** `200 OK`
```json
{
  "_id": "675abc123def791",
  "user": "675abc123def456",
  "type": "expense",
  "amount": 200,
  "category": "Transport",
  "description": "Uber ride - updated",
  "date": "2025-12-09T14:00:00.000Z",
  "createdAt": "2025-12-09T14:00:00.000Z",
  "updatedAt": "2025-12-09T15:00:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Transaction not found"
}
```

---

### 5. Delete Transaction
**DELETE** `/api/transactions/:id`

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response:** `200 OK`
```json
{
  "message": "Transaction deleted"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Transaction not found"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password required"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```
```json
{
  "error": "Invalid token"
}
```
```json
{
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "error": "Transaction not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ex.com","password":"test123","role":"user"}' \
  -c cookies.txt
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ex.com","password":"admin123"}' \
  -c cookies.txt
```

### Get Transactions
```bash
curl -X GET http://localhost:5000/api/transactions \
  -b cookies.txt
```

### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"type":"expense","amount":100,"category":"Food","description":"Lunch"}'
```

### Update Transaction
```bash
curl -X PUT http://localhost:5000/api/transactions/675abc123def791 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"type":"expense","amount":150,"category":"Food","description":"Lunch updated"}'
```

### Delete Transaction
```bash
curl -X DELETE http://localhost:5000/api/transactions/675abc123def791 \
  -b cookies.txt
```

### Logout
```bash
curl -X GET http://localhost:5000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

## Testing with Postman

1. **Set up Environment Variables:**
   - `base_url`: `http://localhost:5000`

2. **Enable Cookie Handling:**
   - Postman automatically handles cookies between requests in the same collection

3. **Test Flow:**
   1. POST `/api/auth/login` - Token will be stored in cookie
   2. GET `/api/transactions` - Cookie automatically sent
   3. POST `/api/transactions` - Create new transaction
   4. PUT `/api/transactions/:id` - Update transaction
   5. DELETE `/api/transactions/:id` - Delete transaction
   6. GET `/api/auth/logout` - Clear cookie

---

## Seeded Test Users

On first run, the following users are automatically created:

| Email | Password | Role |
|-------|----------|------|
| admin@ex.com | admin123 | admin |
| user@ex.com | user123 | user |
| ro@ex.com | ro123 | read-only |

Each user has 8 dummy transactions created automatically.

---

## Transaction Types & Categories

**Types:**
- `income`
- `expense`

**Common Categories:**
- Food
- Transport
- Salary
- Shopping
- Bills
- Entertainment

(Categories are flexible and can be any string)
