# Frontend Architecture

## Scalable Folder Structure

```
src/
├── main.tsx                    # Application entry point
│
├── ROUTES.md                   # Route documentation
│
├── app/                        # = COMPANY APP (Protected ERP Application)
│   ├── layout/                 # Company app layout wrapper
│   │   ├── AppLayout.tsx       # Main layout with sidebar
│   │   └── index.ts
│   │
│   ├── routes/                 # Company app route definitions
│   │   ├── app.routes.tsx      # Main app routes
│   │   └── index.ts
│   │
│   ├── pages/                  # Company app pages (organized by module)
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── customers/
│   │   ├── sales/
│   │   ├── accounting/
│   │   ├── settings/
│   │   └── ...
│   │
│   ├── components/             # Company app specific components
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── shared/
│   │   └── ...
│   │
│   ├── config/                 # App configuration
│   │   ├── sidebar.config.tsx  # Sidebar menu configuration
│   │   └── permissions.ts      # Permission constants
│   │
│   └── hooks/                  # App specific hooks
│
├── admin/                      # = ADMIN/SUPER ADMIN PANEL (Protected)
│   ├── layout/                 # Admin layout wrapper
│   │   ├── AdminLayout.tsx     # Admin layout with sidebar
│   │   └── index.ts
│   │
│   ├── routes/                 # Admin route definitions
│   │   ├── admin.routes.tsx    # Admin routes
│   │   └── index.ts
│   │
│   ├── pages/                  # Admin pages
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Companies.tsx
│   │   ├── Plans.tsx
│   │   └── Settings.tsx
│   │
│   ├── components/             # Admin specific components
│   │   ├── sidebar/
│   │   ├── header/
│   │   └── shared/
│   │
│   └── config/                 # Admin configuration
│       ├── sidebar.config.tsx  # Admin sidebar configuration
│       └── index.ts
│
├── landing/                    # = LANDING PAGE (Public)
│   ├── layout/                 # Landing layout wrapper
│   │   ├── LandingLayout.tsx   # Public landing layout (no sidebar)
│   │   └── index.ts
│   │
│   ├── routes/                 # Landing route definitions
│   │   ├── landing.routes.tsx  # Public routes
│   │   └── index.ts
│   │
│   ├── pages/                  # Public pages
│   │   ├── Home.tsx            # Landing page
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   ├── About.tsx
│   │   └── Contact.tsx
│   │
│   └── components/             # Landing page specific components
│       ├── hero/
│       ├── features/
│       ├── pricing/
│       └── shared/
│
├── auth/                       # = AUTHENTICATION PAGES (Public)
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ...
│   └── components/
│
├── shared/                     # = SHARED ACROSS ALL APPS
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── form/               # Form components
│   │   └── common/             # Common components (Button, Card, etc.)
│   │
│   ├── layouts/                # Shared layouts
│   │   ├── EmptyLayout.tsx     # Layout without header/sidebar
│   │   └── AuthLayout.tsx      # Auth pages layout
│   │
│   ├── hooks/                  # Shared hooks
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   └── ...
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── cn.ts               # className utility
│   │   ├── format.ts           # Format utilities
│   │   └── validation.ts       # Validation helpers
│   │
│   ├── types/                  # Shared TypeScript types
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── ...
│   │
│   └── constants/              # Shared constants
│       ├── routes.ts
│       └── config.ts
│
├── store/                      # Redux Store
│   ├── index.ts
│   ├── slices/
│   └── api/
│
├── lib/                        # External library configurations
│   ├── axios.ts                # Axios configuration
│   └── ...
│
├── config/                     # App-wide configuration
│   └── index.ts
│
└── styles/                     # Global styles
    └── index.css
```

## Route Structure

### Public Routes (Landing + Auth)
- `/` - Landing page
- `/features` - Features page
- `/pricing` - Pricing page
- `/login` - Login page
- `/register` - Register page
- `/forgot-password` - Forgot password

### Company App Routes (Protected)
- `/dashboard` - Main dashboard
- `/dashboard/products` - Products
- `/dashboard/customers` - Customers
- `/dashboard/sales` - Sales & Orders
- `/dashboard/accounting` - Accounting
- `/dashboard/settings` - Settings

### Admin Panel Routes (Protected)
- `/admin` - Admin dashboard
- `/admin/users` - Users management
- `/admin/companies` - Companies management
- `/admin/plans` - Subscription plans
- `/admin/settings` - Admin settings

## Key Principles

1. **Separation of Concerns**: Each section (landing, app, admin) is completely isolated
2. **Scalability**: Easy to add new modules/features without affecting others
3. **Reusability**: Shared components are in the `shared/` directory
4. **Maintainability**: Clear folder structure makes it easy to find and update code
5. **Type Safety**: TypeScript types organized by domain
