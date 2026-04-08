# Company Panel API - Quick Reference

## Import Paths

### Unified API (Recommended)
```typescript
import { companyPanelApi } from '@/services/companyPanelApi';
```

### Individual Services
```typescript
// Customers
import { useGetActiveCustomersQuery } from '@/store/features/customers/customersApi';

// Sales
import { useGetAllOrdersQuery } from '@/store/features/salesOrder/salesOrder';

// Products
import { useGetAllProductsQuery } from '@/store/features/admin/productsApiService';
```

### Custom Hooks
```typescript
import {
  useCompanyOverview,
  useCustomers,
  useSalesOverview,
} from '@/hooks';
```

## Common Patterns

### Fetching Data
```typescript
function MyComponent() {
  const { data, isLoading, error } = useGetActiveCustomersQuery({
    page: 1,
    limit: 10,
    search: 'john'
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <CustomerList customers={data?.data} />;
}
```

### Creating Data
```typescript
function CreateCustomerForm() {
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const handleSubmit = async (values) => {
    try {
      await createCustomer(values).unwrap();
      toast.success('Customer created!');
    } catch (err) {
      toast.error('Failed to create customer');
    }
  };

  return <Form onSubmit={handleSubmit} />;
}
```

### Updating Data
```typescript
function EditCustomer({ id }) {
  const [updateCustomer] = useUpdateCustomerMutation();
  const { data } = useGetCustomerByIdQuery(id);

  const handleSubmit = async (values) => {
    await updateCustomer({ id, data: values }).unwrap();
  };

  return <Form initialValues={data} onSubmit={handleSubmit} />;
}
```

### Deleting Data
```typescript
function DeleteButton({ id }) {
  const [deleteCustomer, { isLoading }] = useDeleteCustomerMutation();

  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      deleteCustomer(id);
    }
  };

  return <Button onClick={handleDelete} disabled={isLoading}>Delete</Button>;
}
```

## Module-Specific Examples

### Customers
```typescript
// List customers
const { data } = useGetActiveCustomersQuery({ page: 1, limit: 10 });

// Get customer stats
const { data: stats } = useGetCustomerStatsQuery();

// Get customer maps
const { data: maps } = useGetCustomerMapsQuery();
```

### Sales Orders
```typescript
// List orders
const { data } = useGetAllOrdersQuery({ page: 1 });

// Get pending orders
const { data: pending } = useGetPendingOrdersQuery();

// Get order stats
const { data: stats } = useGetOrderStatsQuery();
```

### Sales Routes
```typescript
// List all routes
const { data } = useGetAllSalesRouteQuery({ limit: 1000 });

// Assign staff to route
const [assignStaff] = useAssignStaffMutation();
await assignStaff({ routeId: 1, body: { staff_ids: [1, 2, 3] } });
```

### Products
```typescript
// List products
const { data } = useGetAllProductsQuery({ page: 1, limit: 20 });

// Get categories
const { data: categories } = useGetAllCategoriesQuery();

// Get units
const { data: units } = useGetAllUnitsQuery();

// Check stock
const { data: stock } = useGetAllStocksQuery();
```

### Warehouse
```typescript
// List warehouses
const { data } = useGetWarehousesQuery({ page: 1 });

// Get warehouse stock
const { data: stock } = useGetWarehouseByIdQuery(1);
```

### Staff
```typescript
// List staff
const { data } = useGetAllStaffsQuery({ page: 1 });

// Get staff routes
const { data: routes } = useGetStaffRoutesQuery();
```

## Response Formats

### Paginated Response
```typescript
{
  status: true,
  message: "Success",
  data: [...],
  pagination: {
    total: 100,
    page: 1,
    limit: 10,
    totalPage: 10
  }
}
```

### Single Item Response
```typescript
{
  status: true,
  message: "Success",
  data: { id: 1, name: "Item" }
}
```

### Mutation Response
```typescript
{
  status: true,
  message: "Created successfully",
  data: { id: 1, name: "New Item" }
}
```

## Error Handling

```typescript
const [mutation, { error }] = useCreateCustomerMutation();

if (error) {
  if ('status' in error) {
    // Fetch error
    if (error.status === 401) {
      // Unauthorized
    } else if (error.status === 403) {
      // Forbidden
    }
  } else {
    // Network error or other
    console.error('An error occurred');
  }
}
```

## Permissions

```typescript
import { useAppSelector } from '@/store/store';
import { CustomerPermission } from '@/app/config/permissions';

function MyComponent() {
  const permissions = useAppSelector(state => state.auth.user?.role?.permissions || []);

  const canDelete = permissions.includes(CustomerPermission.DELETE);
  const canCreate = permissions.includes(CustomerPermission.CREATE);

  return (
    <>
      {canCreate && <Button>Create</Button>}
      {canDelete && <Button>Delete</Button>}
    </>
  );
}
```

## Cache Invalidation

```typescript
// Automatic invalidation
invalidatesTags: ['Customers'],

// Multiple tags
invalidatesTags: ['Customers', 'Stats', 'Orders'],

// Conditional invalidation
invalidatesTags: (result, error, id) => [
  'Customers',
  { type: 'Customers', id }
],
```

## Search & Filter

```typescript
// Search
const { data } = useGetActiveCustomersQuery({
  search: 'john doe',
  page: 1,
  limit: 10
});

// Filter by status
const { data } = useGetAllOrdersQuery({
  status: 'pending',
  page: 1
});

// Date range
const { data } = useGetOrdersByCustomerQuery({
  customerId: 1,
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
```

## Common Queries

### Dashboard Stats
```typescript
import { useGetDashboardStatsQuery } from '@/store/features/admin/dashboardApiService';

const { data } = useGetDashboardStatsQuery();
```

### Recent Items
```typescript
// Recent customers
const { data } = useGetActiveCustomersQuery({ limit: 5, sort: 'newest' });

// Recent orders
const { data } = useGetAllOrdersQuery({ limit: 10, sort: 'newest' });
```

### Statistics
```typescript
// Customer stats
const { data } = useGetCustomerStatsQuery();

// Order stats
const { data } = useGetOrderStatsQuery();

// Product stats
const { data } = useGetProductStatsQuery();
```

## Useful Hooks

```typescript
// Permissions
import { usePermissions } from '@/hooks/usePermissions';
const { hasPermission } = usePermissions();

// Currency
import { useAppSelector } from '@/store/store';
const currency = useAppSelector(state => state.currency.value);

// Settings
const { data: settings } = useGetSettingsQuery();
```

## Tips & Tricks

### Prefetch Data
```typescript
import { usePrefetch } from '@/store/features/customers/customersApi';

function CustomerRow({ id }) {
  const prefetch = usePrefetch('getCustomerById');

  return (
    <div
      onMouseEnter={() => prefetch(id)}
      onClick={() => navigate(`/customers/${id}`)}
    >
      {name}
    </div>
  );
}
```

### Optimistic Updates
```typescript
const [updateCustomer] = useUpdateCustomerMutation({
  onQueryStarted: async (args, { dispatch, getState, queryFulfilled }) => {
    // Optimistically update cache
    const patchResult = dispatch(
      api.util.updateQueryData('getCustomerById', args.id, (draft) => {
        Object.assign(draft, args.body);
      })
    );

    try {
      await queryFulfilled;
    } catch {
      patchResult.undo();
    }
  },
});
```

### Polling
```typescript
// Auto-refetch every 30 seconds
const { data } = useGetActiveCustomersQuery(
  { page: 1 },
  { pollingInterval: 30000 }
);
```

## TypeScript Types

```typescript
import type {
  Customer,
  Product,
  SalesRoute,
  Quotation,
  Order,
  Invoice,
} from '@/shared/types';

// Use in components
interface Props {
  customer: Customer;
  onSave: (data: Customer) => void;
}
```
