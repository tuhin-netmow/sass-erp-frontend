/**
 * Company Panel Custom Hooks
 *
 * Convenient React hooks for common company panel operations.
 * These hooks combine multiple API calls and provide computed data.
 */

import { useMemo, useState, useEffect } from 'react';

// Import all API services
import {
  useGetDashboardStatsQuery,
} from '@/store/features/admin/dashboardApiService';
import {
  useGetActiveCustomersQuery,
} from '@/store/features/app/customers/customersApi';
import {
  useGetAllSalesRouteQuery,
} from '@/store/features/app/salesRoute/salesRoute';
import {
  useGetAllStaffsQuery,
} from '@/store/features/app/staffs/staffApiService';
import {
  useGetAllProductsQuery,
} from '@/store/features/admin/productsApiService';
import {
  useGetAllSalesOrdersQuery,
  useGetSalesInvoicesQuery,
  useGetSalesPaymentQuery,
} from '@/store/features/app/salesOrder/salesOrder';

// ==================== DASHBOARD HOOKS ====================

/**
 * Hook for company dashboard overview
 * Provides key metrics and statistics
 */
export function useCompanyDashboard() {
  const { data: dashboardStats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: customers, isLoading: customersLoading } = useGetActiveCustomersQuery({ limit: 5 });
  const { data: routes, isLoading: routesLoading } = useGetAllSalesRouteQuery({ limit: 1000 });

  // Compute additional metrics
  const metrics = useMemo(() => {
    const activeRoutes = routes?.data?.filter((r: any) => r.is_active).length || 0;
    const totalRoutes = routes?.data?.length || 0;

    return {
      activeRoutes,
      totalRoutes,
      routeCoverage: totalRoutes > 0 ? (activeRoutes / totalRoutes) * 100 : 0,
    };
  }, [routes]);

  return {
    stats: dashboardStats?.data,
    customers: customers?.data?.slice(0, 5),
    metrics,
    isLoading: statsLoading || customersLoading || routesLoading,
  };
}

// ==================== CUSTOMER HOOKS ====================

/**
 * Hook for customer management
 * Provides list, stats, and filtering
 */
export function useCustomers(options?: { page?: number; limit?: number; search?: string }) {
  const { data, isLoading, error } = useGetActiveCustomersQuery(options || {});

  const customerStats = useMemo(() => {
    const customers = data?.data || [];
    return {
      total: customers.length,
      active: customers.filter((c: any) => c.isActive).length,
      inactive: customers.filter((c: any) => !c.isActive).length,
      totalSales: customers.reduce((sum: number, c: any) => sum + (c.totalSales || 0), 0),
      totalOutstanding: customers.reduce((sum: number, c: any) => sum + (c.outstandingBalance || 0), 0),
    };
  }, [data]);

  return {
    customers: data?.data || [],
    pagination: data?.pagination,
    stats: customerStats,
    isLoading,
    error,
  };
}

// ==================== SALES HOOKS ====================

/**
 * Hook for sales overview
 * Provides orders, invoices, and payment summaries
 */
export function useSalesOverview() {
  const { data: orders, isLoading: ordersLoading } = useGetAllSalesOrdersQuery({ limit: 1000 });
  const { data: invoices, isLoading: invoicesLoading } = useGetSalesInvoicesQuery({ limit: 1000 });
  const { data: payments, isLoading: paymentsLoading } = useGetSalesPaymentQuery({ limit: 1000 });

  const salesStats = useMemo(() => {
    const orderList = orders?.data || [];
    const invoiceList = invoices?.data || [];
    const paymentList = payments?.data || [];

    // Calculate totals
    const totalOrders = orderList.length;
    const totalInvoices = invoiceList.length;
    const totalPayments = paymentList.length;

    const totalRevenue = orderList.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
    const totalPaid = paymentList.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const totalOutstanding = totalRevenue - totalPaid;

    // Status breakdown
    const pendingOrders = orderList.filter((o: any) => o.status === 'Pending').length;
    const confirmedOrders = orderList.filter((o: any) => o.status === 'Confirmed').length;
    const deliveredOrders = orderList.filter((o: any) => o.status === 'Delivered').length;

    return {
      totalOrders,
      totalInvoices,
      totalPayments,
      totalRevenue,
      totalPaid,
      totalOutstanding,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
    };
  }, [orders, invoices, payments]);

  return {
    orders: orders?.data || [],
    invoices: invoices?.data || [],
    payments: payments?.data || [],
    stats: salesStats,
    isLoading: ordersLoading || invoicesLoading || paymentsLoading,
  };
}

// ==================== SALES ROUTES HOOKS ====================

/**
 * Hook for sales routes management
 * Provides routes list and staff assignment status
 */
export function useSalesRoutes() {
  const { data, isLoading } = useGetAllSalesRouteQuery({ limit: 1000 });

  const routes = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const routeStats = useMemo(() => {
    const total = routes.length;
    const active = routes.filter((r: any) => r.is_active).length;
    const withStaff = routes.filter((r: any) => r.assignedStaffMembers?.length > 0).length;

    return {
      total,
      active,
      inactive: total - active,
      withStaff,
      withoutStaff: total - withStaff,
    };
  }, [routes]);

  return {
    routes,
    stats: routeStats,
    isLoading,
  };
}

// ==================== STAFF HOOKS ====================

/**
 * Hook for staff management
 * Provides staff list and department breakdown
 */
export function useStaff() {
  const { data, isLoading } = useGetAllStaffsQuery({ limit: 1000 });

  const staff = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const staffStats = useMemo(() => {
    const total = staff.length;
    const active = staff.filter((s: any) => s.status === 'active').length;
    const onLeave = staff.filter((s: any) => s.status === 'on_leave').length;
    const inactive = staff.filter((s: any) => s.status === 'inactive').length;

    // Department breakdown
    const departments = staff.reduce((acc: Record<string, number>, s: any) => {
      const dept = s.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      onLeave,
      inactive,
      departments,
    };
  }, [staff]);

  return {
    staff,
    stats: staffStats,
    isLoading,
  };
}

// ==================== INVENTORY HOOKS ====================

/**
 * Hook for inventory overview
 * Provides products and stock levels
 */
export function useInventory() {
  const { data: products, isLoading: productsLoading } = useGetAllProductsQuery({ page: 1, limit: 1000 });

  const inventory = useMemo(() => {
    return products?.data || [];
  }, [products]);

  const inventoryStats = useMemo(() => {
    const total = inventory.length;
    const active = inventory.filter((p: any) => p.isActive).length;
    const lowStock = inventory.filter((p: any) => {
      const minLevel = p.minStockLevel || 0;
      return p.stockQuantity <= minLevel;
    }).length;
    const outOfStock = inventory.filter((p: any) => p.stockQuantity === 0).length;

    // Calculate total inventory value
    const totalValue = inventory.reduce((sum: number, p: any) => {
      return sum + (p.cost * p.stockQuantity || 0);
    }, 0);

    return {
      total,
      active,
      inactive: total - active,
      lowStock,
      outOfStock,
      totalValue,
    };
  }, [inventory]);

  return {
    products: inventory,
    stats: inventoryStats,
    isLoading: productsLoading,
  };
}

// ==================== COMBINED HOOKS ====================

/**
 * Hook for complete company overview
 * Combines all major metrics for the company dashboard
 */
export function useCompanyOverview() {
  const dashboard = useCompanyDashboard();
  const customers = useCustomers({ limit: 5 });
  const sales = useSalesOverview();
  const routes = useSalesRoutes();
  const staff = useStaff();
  const inventory = useInventory();

  const isLoading = useMemo(() => {
    return dashboard.isLoading ||
           customers.isLoading ||
           sales.isLoading ||
           routes.isLoading ||
           staff.isLoading ||
           inventory.isLoading;
  }, [dashboard, customers, sales, routes, staff, inventory]);

  const overview = useMemo(() => ({
    dashboard: dashboard.stats,
    customers: {
      recent: customers.customers,
      total: customers.stats.total,
    },
    sales: {
      revenue: sales.stats.totalRevenue,
      outstanding: sales.stats.totalOutstanding,
      orders: sales.stats.totalOrders,
    },
    routes: {
      total: routes.stats.total,
      active: routes.stats.active,
    },
    staff: {
      total: staff.stats.total,
      active: staff.stats.active,
    },
    inventory: {
      totalProducts: inventory.stats.total,
      lowStock: inventory.stats.lowStock,
      value: inventory.stats.totalValue,
    },
  }), [dashboard, customers, sales, routes, staff, inventory]);

  return {
    overview,
    isLoading,
  };
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook for pagination helper
 */
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
    setPage,
    setLimit,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    resetPage: () => setPage(1),
  };
}

/**
 * Hook for search with debounce
 */
export function useSearch(initialSearch = '', delay = 300) {
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, delay);

    return () => clearTimeout(timer);
  }, [search, delay]);

  return {
    search,
    debouncedSearch,
    setSearch,
  };
}
