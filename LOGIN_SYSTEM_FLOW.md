# 🔐 Unified Login System - Frontend & Backend Integration

## Overview
A single login endpoint (`POST /api/auth/login`) that works for all user types with automatic dashboard redirection.

---

## Backend (API)

### Endpoint
```
POST /api/auth/login
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Welcome back to Acme Corp!",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": { ... },
      "companyId": "...",
      "userType": "company_user"
    },
    "company": {
      "id": "...",
      "name": "Acme Corp",
      "subdomain": "acme-corp",
      "domain": "acme-corp.lvh.me",
      "dbType": "shared"
    },
    "dashboardType": "company",
    "redirectTo": "http://acme-corp.lvh.me:5173/dashboard",
    "menus": [...],
    "dashboards": [...]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Types & Redirects

| User Type | `dashboardType` | `redirectTo` |
|-----------|-----------------|--------------|
| **Super Admin** | `super_admin` | `/admin/dashboard` |
| **Company User (Shared)** | `company` | `http://{subdomain}.lvh.me:5173/dashboard` |
| **Company User (Dedicated)** | `company` | `http://{subdomain}.lvh.me:5173/dashboard` |

---

## Frontend

### Login Page
**Route:** `/login` (single unified login page)

**Location:** `src/pages/auth/Login.tsx`

### Features
1. **Auto-detects company portal** from subdomain
2. **Adapts UI** based on context (Universal Login vs Company Portal)
3. **Smart redirect** based on user type

### Login Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SUBMITS LOGIN                          │
│                         /api/auth/login                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND: auth.service.js                         │
│  1. Check AdminUser collection (Super Admin)                       │
│  2. Check CompanyAdmin collection (Company Admin)                  │
│  3. Verify password with bcrypt                                     │
│  4. Connect to appropriate tenant DB                               │
│  5. Return user data + dashboardType + redirectTo                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND: Login.tsx                              │
│  1. Store credentials (Redux + localStorage + cookies)             │
│  2. Check dashboardType                                           │
│  3. Redirect appropriately                                        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          ┌─────────────────┐         ┌─────────────────┐
          │  Super Admin    │         │  Company User    │
          │  dashboardType: │         │  dashboardType: │
          │  'super_admin'  │         │  'company'       │
          └─────────────────┘         └─────────────────┘
                    │                             │
                    ▼                             ▼
          ┌─────────────────┐         ┌─────────────────┐
          │ Navigate to:    │         │ Check subdomain  │
          │ /admin/dashboard│         │ Correct?         │
          └─────────────────┘         └─────────────────┘
                                         │ Yes           │ No
                                         ▼               ▼
                              ┌──────────┐    ┌──────────────────┐
                              │Navigate  │    │ Redirect with    │
                              │to /dashboard│   │ token in URL     │
                              └──────────┘    └──────────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │ ProtectedRoute      │
                                    │ - Extract token      │
                                    │ - Store credentials  │
                                    │ - Clean URL          │
                                    │ - Navigate to /dashboard│
                                    └──────────────────────┘

```

### Cross-Subdomain Authentication

When redirecting from main domain to company subdomain:

1. **Token passed in URL:** `?token=xxx&source=login`
2. **ProtectedRoute** detects URL token
3. **Stores credentials** in Redux and cookies
4. **Cleans URL** (removes token)
5. **Reloads** with authenticated session

### Cookie Configuration

```javascript
// Set with .lvh.me domain for cross-subdomain access
const cookieOptions = {
  domain: '.lvh.me',  // Works on lvh.me and *.lvh.me
  path: '/',
  sameSite: 'lax',
  secure: false  // Set to true in production with HTTPS
};
```

---

## Files Modified

### Backend
- `src/modules/auth/auth.service.js` - `universalLoginSimple()` function
- `src/modules/auth/auth.controller.js` - `loginUniversal()` controller
- `src/modules/auth/auth.routes.js` - Single `/auth/login` route
- `src/modules/saas/companyAdmin.model.js` - New model for centralized admin credentials

### Frontend
- `src/pages/auth/Login.tsx` - Unified login page
- `src/pages/auth/UniversalLogin.tsx` - Redirects to `/login`
- `src/pages/auth/CompanyLogin.tsx` - Redirects to `/login`
- `src/routes/rootRoutes.tsx` - Single `/login` route
- `src/routes/ProtectedRoute.tsx` - Handles URL token for cross-subdomain auth
- `src/store/features/auth/authApiService.ts` - Single `login` endpoint
- `src/store/features/auth/types.ts` - Updated response types
- `src/components/auth/UniversalLoginForm.tsx` - Updated for new API
- `src/components/auth/LoginForm.tsx` - Updated for new API

---

## Testing

### 1. Super Admin Login
```bash
# Navigate to
http://lvh.me:5173/login

# Login with super admin credentials
# Expected: Redirect to /admin/dashboard
```

### 2. Company User Login (From Main Domain)
```bash
# Navigate to
http://lvh.me:5173/login

# Login with company user credentials
# Expected: Redirect to http://{subdomain}.lvh.me:5173/dashboard
```

### 3. Company User Login (From Company Subdomain)
```bash
# Navigate to
http://{subdomain}.lvh.me:5173/login

# Login with company user credentials
# Expected: Navigate to /dashboard directly
```

---

## Environment Variables

### Backend (.env)
```env
BASE_DOMAIN=lvh.me
FRONTEND_PORT=5173
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```
