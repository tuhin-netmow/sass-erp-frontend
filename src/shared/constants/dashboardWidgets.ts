
export interface DashboardWidget {
  id: string;
  label: string;
  description: string;
  defaultPosition: {
    w: number;
    h: number;
  };
}

export const AVAILABLE_DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: "sales_overview",
    label: "Sales Overview",
    description: "Real-time sales chart and total revenue",
    defaultPosition: { w: 4, h: 3 }
  },
  {
    id: "recent_orders",
    label: "Recent Orders",
    description: "List of most recent sales orders",
    defaultPosition: { w: 4, h: 3 }
  },
  {
    id: "top_products",
    label: "Top Products",
    description: "Most sold products by quantity and revenue",
    defaultPosition: { w: 4, h: 3 }
  },
  {
    id: "quick_stats",
    label: "Quick Stats Cards",
    description: "Summary cards for total sales, customers, etc.",
    defaultPosition: { w: 8, h: 1 }
  },
  {
    id: "customer_growth",
    label: "Customer Growth",
    description: "New customers added over time",
    defaultPosition: { w: 4, h: 3 }
  },
  {
    id: "inventory_alerts",
    label: "Low Stock Alerts",
    description: "Products that are below minimum stock level",
    defaultPosition: { w: 4, h: 3 }
  },
  {
    id: "staff_performance",
    label: "Staff Performance",
    description: "Sales and activities broken down by staff member",
    defaultPosition: { w: 4, h: 3 }
  },
  {
    id: "expense_summary",
    label: "Expense Summary",
    description: "Categorized business expenses breakdown",
    defaultPosition: { w: 4, h: 3 }
  }
];
