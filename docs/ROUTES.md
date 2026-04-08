# Routes Documentation

## Route Structure Overview

```
/                           → Landing Home (Public)
/features                   → Features Page (Public)
/pricing                    → Pricing Page (Public)
/about                      → About Page (Public)
/contact                    → Contact Page (Public)

/login                      → Login Page (Public)
/register                   → Register Page (Public)
/forgot-password            → Forgot Password (Public)
/reset-password             → Reset Password (Public)

/privacy                    → Privacy Policy (Public)
/terms                      → Terms of Service (Public)
/unauthorized               → Unauthorized Access (Public)

/company-dashboard          → Company Selection (Public)

─────────────────────────────────────────────────────────────

/dashboard                  → Company App (Protected)
/dashboard/*                → All Company App Modules

─────────────────────────────────────────────────────────────

/admin/login                → Admin Login (Public)
/admin                      → Admin Panel (Protected)
/admin/*                    → All Admin Panel Modules
```

## Company App Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/dashboard` | Main dashboard |
| Products | `/dashboard/products` | Product management |
| Customers | `/dashboard/customers` | Customer management |
| Sales | `/dashboard/sales` | Sales & orders |
| Accounting | `/dashboard/accounting` | Accounting module |
| HR & Payroll | `/dashboard/payroll` | HR & payroll |
| Reports | `/dashboard/reports` | Reports |
| Settings | `/dashboard/settings` | Settings |

## Admin Panel Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/admin` | Admin dashboard |
| Users | `/admin/users` | User management |
| Companies | `/admin/companies` | Company management |
| Plans | `/admin/plans` | Subscription plans |
| Settings | `/admin/settings` | Admin settings |
