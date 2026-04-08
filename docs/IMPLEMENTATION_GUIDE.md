# Frontend Architecture Implementation Guide

## Overview

This document guides you through implementing the new scalable frontend architecture for the ERP SaaS application.

## Architecture Sections

### 1. Landing Page (`/landing`)
Public marketing pages - accessible without authentication

**Location:** `src/landing/`

**Purpose:** Marketing, features, pricing, about, contact pages

**Key Files:**
- `layout/LandingLayout.tsx` - Layout with header/footer (no sidebar)
- `pages/` - Public pages
- `components/` - Landing-specific components

**Routes:**
- `/` - Home page
- `/features` - Features page
- `/pricing` - Pricing page
- `/about` - About page
- `/contact` - Contact page

---

### 2. Authentication (`/auth`)
Public pages for login, registration, password recovery

**Location:** `src/auth/`

**Purpose:** User authentication flows

**Key Files:**
- `pages/Login.tsx` - Login page
- `pages/Register.tsx` - Registration page
- `pages/ForgotPassword.tsx` - Password recovery
- `pages/UniversalLogin.tsx` - Universal login (main domain)

**Routes:**
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Forgot password
- `/reset-password` - Reset password

---

### 3. Company App (`/app`)
Protected ERP application for companies

**Location:** `src/app/`

**Purpose:** Main ERP application with all business modules

**Key Files:**
- `layout/AppLayout.tsx` - Layout with sidebar, header, footer
- `routes/app.routes.tsx` - App route definitions
- `config/sidebar.config.tsx` - Sidebar menu configuration
- `pages/` - All app pages organized by module
- `components/` - App-specific components

**Route Pattern:** `/dashboard/*`

**Modules:**
- Dashboard (`/dashboard`)
- Products (`/dashboard/products`)
- Customers (`/dashboard/customers`)
- Sales & Orders (`/dashboard/sales`)
- Accounting (`/dashboard/accounting`)
- HR & Payroll (`/dashboard/payroll`)
- Reports (`/dashboard/reports`)
- Settings (`/dashboard/settings`)

---

### 4. Admin Panel (`/admin`)
Protected admin panel for platform management

**Location:** `src/admin/`

**Purpose:** Admin and super admin functions

**Key Files:**
- `layout/AdminLayout.tsx` - Admin layout with sidebar
- `routes/admin.routes.tsx` - Admin route definitions
- `config/sidebar.config.tsx` - Admin sidebar configuration
- `pages/` - Admin pages
- `components/` - Admin-specific components

**Route Pattern:** `/admin/*`

**Modules:**
- Dashboard (`/admin`)
- Users (`/admin/users`)
- Companies (`/admin/companies`)
- Plans (`/admin/plans`)
- Settings (`/admin/settings`)

---

### 5. Shared (`/shared`)
Components, utilities, and types shared across all sections

**Location:** `src/shared/`

**Purpose:** Reusable code for all applications

**Structure:**
```
shared/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── form/         # Form components
│   └── common/       # Common components
├── layouts/
│   ├── AuthLayout.tsx
│   └── EmptyLayout.tsx
├── hooks/
│   ├── useAuth.ts
│   └── usePermissions.ts
├── utils/
│   ├── cn.ts
│   └── format.ts
├── types/
│   ├── api.types.ts
│   └── user.types.ts
└── constants/
    └── routes.ts
```

---

## File Organization

### Adding a New Page to Company App

1. Create page component in `src/app/pages/[module]/`
2. Add route configuration in `src/app/config/sidebar.config.tsx`
3. Routes are auto-generated from sidebar config

Example:
```tsx
// src/app/pages/products/NewProduct.tsx
export function NewProduct() {
  return <div>Create new product</div>;
}

// src/app/config/sidebar.config.tsx
{
  title: "New Product",
  url: "/dashboard/products/new",
  element: <NewProduct />,
  allowedPermissions: [ProductPermission.CREATE],
}
```

### Adding a New Admin Page

1. Create page component in `src/admin/pages/`
2. Add route in `src/admin/routes/admin.routes.tsx`

Example:
```tsx
// src/admin/pages/AuditLogs.tsx
export function AuditLogs() {
  return <div>Audit logs</div>;
}

// src/admin/routes/admin.routes.tsx
{
  path: "audit-logs",
  element: <AuditLogs />,
}
```

---

## Migration Path

### Phase 1: Setup Architecture (Current)
- ✅ Create folder structure
- ✅ Create route configurations
- ✅ Create layouts

### Phase 2: Move Existing Code
- Move existing pages to new structure
- Update imports
- Test routes

### Phase 3: Refactor Components
- Extract shared components
- Create reusable hooks
- Organize types

### Phase 4: Cleanup
- Remove old files
- Update documentation
- Final testing

---

## Key Benefits

1. **Separation of Concerns:** Each section (landing, app, admin) is isolated
2. **Scalability:** Easy to add new modules without affecting others
3. **Maintainability:** Clear folder structure makes code easy to find
4. **Code Reusability:** Shared components reduce duplication
5. **Type Safety:** TypeScript types organized by domain

---

## Quick Reference

| What You Want to Do | Where to Go |
|---------------------|-------------|
| Add marketing page | `src/landing/pages/` |
| Add auth page | `src/auth/pages/` |
| Add ERP feature | `src/app/pages/[module]/` |
| Add admin feature | `src/admin/pages/` |
| Add shared component | `src/shared/components/` |
| Configure app menu | `src/app/config/sidebar.config.tsx` |
| Configure admin menu | `src/admin/config/sidebar.config.tsx` |
| Add new route | `src/routes/sections/[section].routes.tsx` |
| Add shared utility | `src/shared/utils/` |
| Add TypeScript type | `src/shared/types/` |
