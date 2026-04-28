# Setu Help Desk - QA Test Cases Documentation

## Overview
This document contains all test cases for the Setu Help Desk Backend API. Each test case includes endpoint details, request/response samples, and validation criteria.

---

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Profile APIs](#profile-apis)
3. [Ticket APIs](#ticket-apis)
4. [Settings APIs](#settings-apis)
5. [Test Data & Setup](#test-data--setup)

---

## Authentication APIs

### TEST CASE 1: User Signup
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-001 |
| **Endpoint** | `POST /api/auth/signup` |
| **URL** | `http://localhost:3000/api/auth/signup` |
| **Purpose** | Register a new student with email verification |
| **Status** | Active |

**Request:**
```json
{
  "name": "Ronish Karki",
  "email": "np02cs4a240026@bicnepal.edu.np",
  "faculty": "BSc Hons Computer Science",
  "level": "Level 4",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```

**Expected Response (201):**
```json
{
  "message": "Signup successful! OTP has been sent to your registered email. Please verify within 10 minutes.",
  "email": "np02cs4a240026@bicnepal.edu.np",
  "requiresOTPVerification": true
}
```

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid signup | All fields correct | 201 status | - |
| Missing name | name: "" | 400 error | - |
| Invalid email | email: "test@gmail.com" | 400 error | - |
| Weak password | password: "123" | 400 error - weak password | - |
| Password mismatch | confirmPassword: "different" | 400 error | - |
| Duplicate email | Existing email | 409 conflict | - |

---

### TEST CASE 2: Verify OTP
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-002 |
| **Endpoint** | `POST /api/auth/verify-otp` |
| **URL** | `http://localhost:3000/api/auth/verify-otp` |
| **Purpose** | Verify OTP sent to user email |
| **Status** | Active |

**Request:**
```json
{
  "email": "np02cs4a240026@bicnepal.edu.np",
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

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid OTP | Correct OTP | 200 status | - |
| Invalid OTP | Wrong OTP | 401 unauthorized | - |
| Expired OTP | Old OTP | 401 unauthorized | - |
| Missing email | No email field | 400 error | - |
| Missing OTP | No otp field | 400 error | - |

---

### TEST CASE 3: Resend OTP
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-003 |
| **Endpoint** | `POST /api/auth/resend-otp` |
| **URL** | `http://localhost:3000/api/auth/resend-otp` |
| **Purpose** | Resend OTP to user email |
| **Status** | Active |

**Request:**
```json
{
  "email": "np02cs4a240026@bicnepal.edu.np"
}
```

**Expected Response (200):**
```json
{
  "message": "OTP has been resent to your email"
}
```

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid email | Registered email | 200 status | - |
| Already verified | Verified email | 400 error | - |
| Non-existent email | Invalid email | 404 error | - |
| Missing email | No email field | 400 error | - |

---

### TEST CASE 4: User Login
| Field | Value |
|-------|-------|
| **Test ID** | AUTH-004 |
| **Endpoint** | `POST /api/auth/login` |
| **URL** | `http://localhost:3000/api/auth/login` |
| **Purpose** | Authenticate user and get JWT token |
| **Status** | Active |
| **Headers** | `Content-Type: application/json` |

**Request:**
```json
{
  "email": "np02cs4a240026@bicnepal.edu.np",
  "password": "Password@123"
}
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "id": 1,
    "name": "Ronish Karki",
    "email": "np02cs4a240026@bicnepal.edu.np",
    "faculty": "BSc Hons Computer Science",
    "level": "Level 4",
    "profile_photo": null
  }
}
```

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid credentials | Email + correct password | 200 status + token | - |
| Wrong password | Email + incorrect password | 401 unauthorized | - |
| Non-existent email | Invalid email | 401 unauthorized | - |
| Unverified email | Verified but marked as false | 403 forbidden | - |
| Missing email | No email field | 400 error | - |
| Missing password | No password field | 400 error | - |
| Non-BIC email | test@gmail.com | 400 error | - |

---

## Profile APIs

### TEST CASE 5: Get User Profile
| Field | Value |
|-------|-------|
| **Test ID** | PROFILE-001 |
| **Endpoint** | `GET /api/auth/profile` |
| **URL** | `http://localhost:3000/api/auth/profile` |
| **Purpose** | Retrieve current user profile |
| **Status** | Active |
| **Auth Required** | Yes (JWT Token) |

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "id": 1,
  "name": "Ronish Karki",
  "email": "np02cs4a240026@bicnepal.edu.np",
  "faculty": "BSc Hons Computer Science",
  "level": "Level 4",
  "is_active": true,
  "created_at": "2024-01-15 10:30:00",
  "last_login": "2024-01-15 15:45:00",
  "profile_photo": null
}
```

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid token | Correct JWT | 200 status + profile | - |
| Invalid token | Expired/malformed token | 401 unauthorized | - |
| Missing token | No Authorization header | 401 unauthorized | - |
| Wrong token format | Bearer abc123 (invalid) | 401 unauthorized | - |

---

### TEST CASE 6: Upload Profile Photo
| Field | Value |
|-------|-------|
| **Test ID** | PROFILE-002 |
| **Endpoint** | `PUT /api/auth/profile/photo` |
| **URL** | `http://localhost:3000/api/auth/profile/photo` |
| **Purpose** | Upload and update profile picture |
| **Status** | Active |
| **Auth Required** | Yes (JWT Token) |
| **File Types** | JPEG, PNG, JPG, WEBP |
| **Max Size** | 2MB |

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Form Data:**
```
Key: photo
Value: [Select file - profile-image.jpg]
```

**Expected Response (200):**
```json
{
  "message": "Profile photo updated successfully",
  "profile_image": "http://localhost:3000/uploads/profiles/profile-1-123456789.webp",
  "profile_photo": "uploads/profiles/profile-1-123456789.webp"
}
```

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid image | JPEG/PNG/JPG/WEBP under 2MB | 200 status | - |
| No file selected | No file | 400 error | - |
| Invalid file type | PDF/DOC file | 400 error | - |
| File too large | File > 2MB | 400 error | - |
| Missing auth | No token | 401 unauthorized | - |

---

## Settings APIs

### TEST CASE 7: Change Password
| Field | Value |
|-------|-------|
| **Test ID** | SETTINGS-001 |
| **Endpoint** | `POST /api/auth/change-password` |
| **URL** | `http://localhost:3000/api/auth/change-password` |
| **Purpose** | Update user password with strength validation |
| **Status** | Active |
| **Auth Required** | Yes (JWT Token) |

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@456",
  "confirmPassword": "NewPassword@456"
}
```

**Expected Response (200):**
```json
{
  "message": "Password changed successfully",
  "success": true
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@, #, $, %, &, *, !, etc.)

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid change | Correct current + strong new pwd | 200 status | - |
| Wrong current password | Incorrect current pwd | 401 unauthorized | - |
| Weak new password | Password less than 8 chars | 400 error | - |
| Missing uppercase | NewPassword123 (no uppercase) | 400 error - weak pwd | - |
| Missing lowercase | NEWPASSWORD@123 (no lowercase) | 400 error - weak pwd | - |
| Missing number | NewPassword@ (no number) | 400 error - weak pwd | - |
| Missing special char | NewPassword123 (no special) | 400 error - weak pwd | - |
| Passwords don't match | confirmPassword different | 400 error | - |
| Same as current | New = Old password | 400 error | - |
| Missing fields | Any field empty | 400 error | - |
| No auth token | Missing Authorization | 401 unauthorized | - |

---

## Ticket APIs

### TEST CASE 8: Create New Ticket
| Field | Value |
|-------|-------|
| **Test ID** | TICKET-001 |
| **Endpoint** | `POST /api/tickets` |
| **URL** | `http://localhost:3000/api/tickets` |
| **Purpose** | Create a new support ticket |
| **Status** | Active |
| **Auth Required** | Yes (JWT Token) |

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "WiFi not working in campus",
  "description": "Internet connectivity issue in building A class 301",
  "category": "IT support",
  "priority": "high"
}
```

**Expected Response (201):**
```json
{
  "message": "Ticket created successfully",
  "ticket": {
    "id": 1,
    "ticket_number": "TKT-20240115-001",
    "student_id": 1,
    "title": "WiFi not working in campus",
    "description": "Internet connectivity issue in building A class 301",
    "category": "IT support",
    "priority": "high",
    "status": "open",
    "created_at": "2024-01-15 16:30:00"
  }
}
```

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid ticket | All required fields | 201 status | - |
| Missing title | No title field | 400 error | - |
| Missing description | No description field | 400 error | - |
| Missing category | No category field | 400 error | - |
| Invalid priority | priority: "urgent" (not low/med/high) | 400 error | - |
| Empty title | title: "" | 400 error | - |
| No auth token | Missing Authorization | 401 unauthorized | - |

---

### TEST CASE 9: Get My Tickets
| Field | Value |
|-------|-------|
| **Test ID** | TICKET-002 |
| **Endpoint** | `GET /api/tickets/my-tickets` |
| **URL** | `http://localhost:3000/api/tickets/my-tickets` |
| **Purpose** | Retrieve all tickets of current user |
| **Status** | Active |
| **Auth Required** | Yes (JWT Token) |

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "message": "All my tickets",
  "tickets": [
    {
      "id": 1,
      "ticket_number": "TKT-20240115-001",
      "title": "WiFi not working",
      "description": "Internet issue",
      "category": "IT support",
      "priority": "high",
      "status": "open",
      "created_at": "2024-01-15 16:30:00",
      "updated_at": "2024-01-15 16:30:00"
    }
  ]
}
```

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid request | Valid token | 200 status + tickets array | - |
| No tickets | User with 0 tickets | 200 status + empty array | - |
| Invalid token | Expired token | 401 unauthorized | - |
| Missing auth | No Authorization header | 401 unauthorized | - |

---

### TEST CASE 10: Get Ticket Details
| Field | Value |
|-------|-------|
| **Test ID** | TICKET-003 |
| **Endpoint** | `GET /api/tickets/:ticketId` |
| **URL** | `http://localhost:3000/api/tickets/1` |
| **Purpose** | Get details of specific ticket |
| **Status** | Active |
| **Auth Required** | Yes (JWT Token) |

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "id": 1,
  "ticket_number": "TKT-20240115-001",
  "student_id": 1,
  "title": "WiFi not working",
  "description": "Internet issue in building A",
  "category": "IT support",
  "priority": "high",
  "status": "open",
  "created_at": "2024-01-15 16:30:00",
  "resolved_at": null
}
```

**Test Cases:**
| Scenario | Input | Expected | Pass/Fail |
|----------|-------|----------|-----------|
| Valid ticket ID | ID: 1 | 200 status + ticket details | - |
| Non-existent ticket | ID: 999 | 404 not found | - |
| Invalid ID format | ID: "abc" | 400 error | - |
| No auth | Missing token | 401 unauthorized | - |

---

## Test Data & Setup

### Database Setup
```sql
-- Ensure these tables exist
CREATE TABLE IF NOT EXISTS students (...);
CREATE TABLE IF NOT EXISTS tickets (...);
CREATE TABLE IF NOT EXISTS faculties (...);
CREATE TABLE IF NOT EXISTS levels (...);
```

### Environment Variables (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=helpdesk_db
JWT_SECRET=your_secret_key
PORT=3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Test User Credentials
```
Email: np02cs4a240026@bicnepal.edu.np
Password: Password@123
Faculty: BSc Hons Computer Science
Level: Level 4
```

### Valid Departments/Faculties
- Student service
- Admission
- Finance
- RTE
- IT support
- Resource

### Valid Levels
- Level 4
- Level 5
- Level 6

### Valid Priorities
- low
- medium
- high

### Special Characters Allowed in Password
`@ # $ % & * ! ^ ( ) _ + - = [ ] { } ; ' : " \ | , . < > / ?`

---

## Testing Checklist

- [ ] All authentication endpoints tested
- [ ] All profile endpoints tested
- [ ] All settings endpoints tested
- [ ] All ticket endpoints tested
- [ ] Error handling verified
- [ ] Response codes validated
- [ ] Database consistency checked
- [ ] Token expiration tested
- [ ] File upload limits verified
- [ ] Password strength validation working

---

## Notes
- All timestamps are in UTC format
- JWT tokens expire after 7 days
- File uploads converted to WebP format
- Emails require @bicnepal.edu.np domain
- Max profile photo size: 2MB
- OTP valid for 10 minutes

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2024  
**Test Environment:** Development (localhost:3000)
