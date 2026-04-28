# Setu Help Desk API - Complete Postman Test Guide

## Prerequisites
- Backend server running on `http://localhost:3000`
- Database running on `localhost:3307`
- Postman installed

## Test Flow (Sequential)

### 1. SIGN UP
**Endpoint:** `POST /api/auth/signup`  
**URL:** `http://localhost:3000/api/auth/signup`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "John Doe",
  "email": "john.doe@bicnepal.edu.np",
  "faculty": "Engineering",
  "level": "3",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

**Expected Response (201):**
```json
{
  "message": "Signup successful! OTP has been sent to your registered email. Please verify within 10 minutes.",
  "email": "john.doe@bicnepal.edu.np",
  "requiresOTPVerification": true
}
```

**Note:** Check your Gmail for the OTP code (configured in .env)

---

### 2. VERIFY OTP
**Endpoint:** `POST /api/auth/verify-otp`  
**URL:** `http://localhost:3000/api/auth/verify-otp`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@bicnepal.edu.np",
  "otp": "123456"
}
```

**Expected Response (200):**
```json
{
  "message": "Email verified successfully! You can now login.",
  "verified": true
}
```

---

### 3. LOGIN
**Endpoint:** `POST /api/auth/login`  
**URL:** `http://localhost:3000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@bicnepal.edu.np",
  "password": "Password123!"
}
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@bicnepal.edu.np",
    "faculty": "Engineering",
    "level": "3",
    "profile_photo": null
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value and save it in the collection variable `{{JWT_TOKEN}}`

---

### 4. GET PROFILE
**Endpoint:** `GET /api/auth/profile`  
**URL:** `http://localhost:3000/api/auth/profile`  
**Headers:**
```
Authorization: Bearer {{JWT_TOKEN}}
```

**Expected Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@bicnepal.edu.np",
  "faculty": "Engineering",
  "level": "3",
  "profile_photo": null,
  "is_verified": true,
  "created_at": "2026-04-08T15:05:12.000Z"
}
```

---

### 5. UPDATE PROFILE PHOTO
**Endpoint:** `PUT /api/auth/profile/photo`  
**URL:** `http://localhost:3000/api/auth/profile/photo`  
**Headers:**
```
Authorization: Bearer {{JWT_TOKEN}}
```

**Body:**
- Select `form-data`
- Add key: `photo`
- Type: `File`
- Select an image (JPEG, JPG, PNG, or WEBP)
- Max size: 2MB

**Expected Response (200):**
```json
{
  "message": "Profile photo updated successfully",
  "profile_image": "http://localhost:3000/uploads/profiles/profile-1-1712681112345.webp",
  "profile_photo": "uploads/profiles/profile-1-1712681112345.webp"
}
```

**Note:** Image is automatically converted to WebP format

---

### 6. CREATE TICKET
**Endpoint:** `POST /api/tickets/create`  
**URL:** `http://localhost:3000/api/tickets/create`  
**Headers:**
```
Authorization: Bearer {{JWT_TOKEN}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "Cannot access course materials",
  "description": "I'm unable to download the lecture notes from the portal. Getting 404 error when clicking on resources.",
  "category": "Technical Support",
  "priority": "high"
}
```

**Priority Values:** `"low"`, `"medium"`, `"high"` (lowercase)

**Expected Response (201):**
```json
{
  "message": "Ticket created successfully",
  "ticket": {
    "id": 1,
    "ticketNumber": "TKT-1712681112345",
    "studentId": 1,
    "title": "Cannot access course materials",
    "description": "I'm unable to download the lecture notes from the portal...",
    "category": "Technical Support",
    "priority": "high",
    "status": "open"
  }
}
```

---

### 7. GET ALL MY TICKETS
**Endpoint:** `GET /api/tickets/my-tickets`  
**URL:** `http://localhost:3000/api/tickets/my-tickets`  
**Headers:**
```
Authorization: Bearer {{JWT_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Tickets retrieved successfully",
  "tickets": [
    {
      "id": 1,
      "ticketNumber": "TKT-1712681112345",
      "student_id": 1,
      "title": "Cannot access course materials",
      "description": "...",
      "category": "Technical Support",
      "priority": "high",
      "status": "open",
      "created_at": "2026-04-08T15:05:12.000Z"
    }
  ],
  "count": 1
}
```

---

### 8. GET SINGLE TICKET
**Endpoint:** `GET /api/tickets/:id`  
**URL:** `http://localhost:3000/api/tickets/1`  
**Headers:**
```
Authorization: Bearer {{JWT_TOKEN}}
```

**Expected Response (200):**
```json
{
  "message": "Ticket retrieved successfully",
  "ticket": {
    "id": 1,
    "ticketNumber": "TKT-1712681112345",
    "student_id": 1,
    "title": "Cannot access course materials",
    "description": "...",
    "category": "Technical Support",
    "priority": "high",
    "status": "open",
    "created_at": "2026-04-08T15:05:12.000Z"
  }
}
```

---

### 9. UPDATE TICKET
**Endpoint:** `PUT /api/tickets/:id`  
**URL:** `http://localhost:3000/api/tickets/1`  
**Headers:**
```
Authorization: Bearer {{JWT_TOKEN}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "Updated: Cannot access course materials",
  "description": "Still unable to access. Tried clearing cache.",
  "status": "in_progress",
  "priority": "medium"
}
```

**Expected Response (200):**
```json
{
  "message": "Ticket updated successfully",
  "ticket": {
    "id": 1,
    "title": "Updated: Cannot access course materials",
    "description": "Still unable to access...",
    "status": "in_progress",
    "priority": "medium"
  }
}
```

---

## Postman Environment Variables

In Postman collection, set these variables:

| Variable | Value | Type |
|----------|-------|------|
| `BASE_URL` | `http://localhost:3000` | String |
| `JWT_TOKEN` | (copied from login response) | String |

---

## Common Errors & Solutions

### ❌ 404 Not Found
- **Issue:** Wrong endpoint URL
- **Solution:** Check the exact endpoint path

### ❌ 401 Unauthorized
- **Issue:** Missing or invalid JWT token
- **Solution:** 
  1. Login again to get a fresh token
  2. Copy the token to `{{JWT_TOKEN}}`
  3. Ensure `Authorization: Bearer {{JWT_TOKEN}}` header is set

### ❌ 403 Forbidden
- **Issue:** User not verified or not authorized
- **Solution:** Complete OTP verification before creating tickets

### ❌ 500 Internal Server Error
- **Issue:** Database connection failed
- **Solution:** 
  1. Check if MySQL is running on port 3307
  2. Check if database schema is initialized
  3. Verify `.env` file configuration

### ❌ Email not sending
- **Issue:** Gmail credentials in `.env` incorrect
- **Solution:** 
  1. Check email and app password in `.env`
  2. Ensure less secure apps are allowed in Gmail
  3. For testing, use the mock OTP: `123456`

---

## Testing Checklist

- [ ] Sign up as new student
- [ ] Receive OTP email (or use 123456)
- [ ] Verify OTP
- [ ] Login successfully
- [ ] View profile
- [ ] Upload profile photo
- [ ] Create a ticket
- [ ] View all tickets
- [ ] Get single ticket
- [ ] Update ticket status

---

## Notes

- All timestamps are in UTC format
- Passwords must be at least 6 characters
- Emails must be `@bicnepal.edu.np` domain
- Profile photos are auto-converted to WebP
- Tickets support multiple attachments (up to 5MB each)
