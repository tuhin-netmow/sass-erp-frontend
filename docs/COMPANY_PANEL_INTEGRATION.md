# Company Panel API Integration

This document describes the complete integration of all tenant module APIs into the frontend company panel.

## Overview

All 26+ tenant modules from the backend are now fully integrated with the frontend, providing a complete ERP system for company/tenant management.

## Architecture

```
Backend (API)                    Frontend (Company Panel)
┌─────────────────────┐          ┌──────────────────────────────┐
│ /api/v1/accounting  │ ←──────→ │ accoutntingApiService.ts     │
│ /api/v1/assets      │ ←──────→ │ assetsApiService.ts         │
│ /api/v1/attendance  │ ←──────→ │ attendenceApiService.ts     │
│ /api/v1/checkin     │ ←──────→ │ checkIn.ts                   │
│ /api/v1/customers   │ ←──────→ │ customersApi.ts             │
│ /api/v1/dashboard   │ ←──────→ │ dashboardApiService.ts      │
│ /api/v1/database    │ ←──────→ │ databaseApiService.ts       │
│ /api/v1/departments│ ←──────→ │ departmentApiService.ts     │
│ /api/v1/docs        │ ←──────→ │ (Module Documentation)       │
│ /api/v1/help        │ ←──────→ │ helpApiService.ts           │
│ /api/v1/payroll     │ ←──────→ │ payrollApiService.ts        │
│ /api/v1/products    │ ←──────→ │ productsApiService.ts       │
│ /api/v1/warehouse   │ ←──────→ │ (included in products)       │
│ /api/v1/purchase    │ ←──────→ │ purchaseOrderApiService.ts  │
│ /api/v1/purchase-return←─────→│ purchaseReturnApiService.ts │
│ /api/v1/raw-materials←───────→│ rawMaterialApiService.ts    │
│ /api/v1/reports     │ ←──────→ │ reportApiService.ts         │
│ /api/v1/production  │ ←──────→ │ productionApiService.ts     │
│ /api/v1/sales       │ ←──────→ │ salesOrder.ts               │
│ /api/v1/sales-route ←───────→│ salesRoute.ts               │
│ /api/v1/sales-return←───────→│ salesReturnApiService.ts    │
│ /api/v1/quotations  │ ←──────→ │ quotationApiService.ts      │
│ /api/v1/staffs      │ ←──────→ │ staffApiService.ts          │
│ /api/v1/suppliers   │ ←──────→ │ supplierApiService.ts       │
│ /api/v1/users       │ ←──────→ │ usersApiService.ts          │
│ /api/v1/settings    │ ←──────→ │ settingsApiService.ts       │
│ /api/v1/roles       │ ←──────→ │ roleApiService.ts           │
└─────────────────────┘          └──────────────────────────────┘
```

## File Structure

### Backend Routes
- **Location**: `saas_erp_mongodb_api/src/routes/index.js`
- **Purpose**: Central route registration for all tenant modules
- **Status**: ✅ All 26+ modules registered

### Frontend API Services
- **Location**: `saas_erp_mongodb_frontend/src/store/features/`
- **Structure**: Organized by module (e.g., `customers/customersApi.ts`)
- **Status**: ✅ All modules have corresponding API services

### Frontend Pages
- **Location**: `saas_erp_mongodb_frontend/src/app/pages/`
- **Structure**: Organized by feature (e.g., `customer/Customers.tsx`)
- **Status**: ✅ All major modules have UI pages

## Usage Examples

### Using Individual API Services

```typescript
import { useGetActiveCustomersQuery } from '@/store/features/customers/customersApi';

function CustomersList() {
  const { data, isLoading } = useGetActiveCustomersQuery({
    page: 1,
    limit: 10,
    search: ''
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.data.map(customer => (
        <li key={customer.id}>{customer.name}</li>
      ))}
    </ul>
  );
}
```

### Using the Unified Company Panel API

```typescript
import { companyPanelApi } from '@/services/companyPanelApi';

function CompanyDashboard() {
  const { customers, sales } = companyPanelApi;

  const { data: customersList } = customers.useAll({ page: 1, limit: 10 });
  const { data: orders } = sales.orders.useAll({ page: 1 });

  return (
    <div>
      <h2>Customers: {customersList?.data.length}</h2>
      <h2>Orders: {orders?.data.length}</h2>
    </div>
  );
}
```

### Using Custom Hooks

```typescript
import { useCompanyOverview, useCustomers } from '@/hooks';

function DashboardOverview() {
  const { overview, isLoading } = useCompanyOverview();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Total Revenue: ${overview.sales?.revenue}</h2>
      <h2>Active Customers: {overview.customers?.total}</h2>
      <h2>Staff Members: {overview.staff?.total}</h2>
    </div>
  );
}
```

## Available Modules

### Core Modules

| Module | API Service | Page Location | Status |
|--------|-------------|---------------|--------|
| **Dashboard** | `dashboardApiService.ts` | `dashboard/Dashboard.tsx` | ✅ |
| **Settings** | `settingsApiService.ts` | `Settings/Settings.tsx` | ✅ |
| **Users** | `usersApiService.ts` | `users/UsersList.tsx` | ✅ |
| **Roles** | `roleApiService.ts` | `roles/RoleList.tsx` | ✅ |

### Business Modules

| Module | API Service | Page Location | Status |
|--------|-------------|---------------|--------|
| **Products** | `productsApiService.ts` | `products/Products.tsx` | ✅ |
| **Customers** | `customersApi.ts` | `customer/Customers.tsx` | ✅ |
| **Suppliers** | `supplierApiService.ts` | `suppliers/suppliersList.tsx` | ✅ |
| **Staff** | `staffApiService.ts` | `staffs/Staffs.tsx` | ✅ |
| **Departments** | `departmentApiService.ts` | `departments/index.tsx` | ✅ |

### Sales Modules

| Module | API Service | Page Location | Status |
|--------|-------------|---------------|--------|
| **Orders** | `salesOrder.ts` | `salesOrders/order/OrderList.tsx` | ✅ |
| **Invoices** | `salesOrder.ts` | `salesOrders/invoices/` | ✅ |
| **Payments** | `salesOrder.ts` | `salesOrders/payments/` | ✅ |
| **Quotations** | `quotationApiService.ts` | `salesOrders/quotations/QuotationsList.tsx` | ✅ |
| **Sales Routes** | `salesRoute.ts` | `salesOrders/salesRoutes/SalesRoutePage.tsx` | ✅ |
| **Sales Returns** | `salesReturnApiService.ts` | `salesOrders/returns/` | ✅ |

### Purchase Modules

| Module | API Service | Page Location | Status |
|--------|-------------|---------------|--------|
| **Purchase Orders** | `purchaseOrderApiService.ts` | `suppliers/purchaseOrder/` | ✅ |
| **Purchase Returns** | `purchaseReturnApiService.ts` | `suppliers/purchaseReturn/` | ✅ |

### Inventory Modules

| Module | API Service | Page Location | Status |
|--------|-------------|---------------|--------|
| **Warehouses** | `productsApiService.ts` | `products/warehouses/WarehousesList.tsx` | ✅ |
| **Raw Materials** | `rawMaterialApiService.ts` | `raw-materials/` | ✅ |
| **Stock Management** | `productsApiService.ts` | `products/stock.tsx` | ✅ |

### Production Modules

| Module | API Service | Page Location | Status |
|--------|-------------|---------------|--------|
| **Production** | `productionApiService.ts` | `production/` | ✅ |

### HR & Payroll Modules

| Module | API Service | Page Location | Status |
|--------|-------------|---------------|--------|
| **Attendance** | `attendenceApiService.ts` | `staffs/attendance/` | ✅ |
| **Check-In** | `checkIn.ts` | `checkIn/CheckIn.tsx` | ✅ |
| **Leave** | `leaveApiService.ts` | `staffs/leaves/` | ✅ |
| **Payroll** | `payrollApiService.ts` | `HrAndPayroll/` | ✅ |

### Accounting Modules

| Module | API Service | Page Location | Status |
|--------|-------------|---------------|--------|
| **Accounting** | `accoutntingApiService.ts` | `accounting/Accounting.tsx` | ✅ |
| **Transactions** | `accoutntingApiService.ts` | `accounting/Transactions.tsx` | ✅ |
| **Reports** | `accoutntingApiService.ts` | `accounting/` | ✅ |

### Other Modules

| Module | API Service | Page Location | Status |
|--------|-------------|---------------|--------|
| **Assets** | `assetsApiService.ts` | `assets/` | ✅ |
| **Reports** | `reportApiService.ts` | `reports/` | ✅ |
| **Help** | `helpApiService.ts` | `help/Help.tsx` | ✅ |
| **Database** | `databaseApiService.ts` | `data_management/DatabaseTables.tsx` | ✅ |

## API Endpoints

### Base URL
```
Development: http://{subdomain}.lvh.me:5006/api/v1
Production: {VITE_API_URL}/api/v1
```

### Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer {token}
```

### Module Check
Most endpoints also require module access check:
```
x-module: {module_name}
```

## Permissions

The system uses a comprehensive RBAC (Role-Based Access Control) system. Permissions are defined in `src/app/config/permissions.ts`:

```typescript
// Module Permissions
DashboardPermission.VIEW          // "dashboard.view"
ProductPermission.LIST            // "products.list"
CustomerPermission.CREATE         // "customers.create"
SalesPermission.ORDERS            // "sales.orders"
AccountingPermission.TRANSACTIONS // "accounting.transactions"
// ... and more
```

## Type Safety

All API services are fully typed with TypeScript:

```typescript
// Customer Types
import type { Customer } from '@/shared/types/types';

// Sales Route Types
import type { SalesRoute } from '@/shared/types/salesRoute.types';

// Quotation Types
import type { Quotation } from '@/shared/types/quotation.types';
```

## Caching & Invalidations

The system uses RTK Query for automatic caching and cache invalidation:

```typescript
// Provides cache tag
providesTags: ['Customers'],

// Invalidates cache on mutation
invalidatesTags: ['Customers', 'Stats'],
```

## Error Handling

Global error handling is configured in `baseApi.ts`:

- 401 Unauthorized → Auto token refresh
- 403 Forbidden → Show error toast
- 404 Not Found → Show error toast
- 400 Bad Request → Show error toast

## Contributing

When adding new modules:

1. **Backend**: Create route file in `src/modules/tenant/{module}/`
2. **Register**: Add to `src/routes/index.js`
3. **Frontend Service**: Create API service in `src/store/features/{module}/`
4. **Types**: Add TypeScript types in `src/shared/types/`
5. **Pages**: Create UI pages in `src/app/pages/`
6. **Routes**: Add to `src/app/config/sidebar.config.tsx`
7. **Permissions**: Add to `src/app/config/permissions.ts`
8. **Export**: Add to `src/store/features/index.ts`

## Support

For issues or questions about the integration, please refer to:
- Backend: `saas_erp_mongodb_api/README.md`
- Frontend: `saas_erp_mongodb_frontend/README.md`
- API Documentation: `/api/v1/docs` (when running)
