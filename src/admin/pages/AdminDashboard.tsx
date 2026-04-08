import { useGetDashboardQuery } from "@/store/features/admin/adminApiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Users2, Building2, CreditCard, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useGetDashboardQuery(undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = dashboardData?.data || {
    totalUsers: 0,
    totalCompanies: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the ERP Admin Panel. Here's an overview of your SaaS platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users across all companies
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active tenant companies
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-bold">${stats.monthlyRevenue?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recurring monthly revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="px-6 pt-6">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/users"
              className="flex items-center gap-4 p-4 border rounded-xl hover:bg-accent hover:border-accent transition-all duration-200 group"
            >
              <div className="p-2.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Manage Users</p>
                <p className="text-xs text-muted-foreground mt-0.5">View and manage user accounts</p>
              </div>
            </a>

            <a
              href="/admin/companies"
              className="flex items-center gap-4 p-4 border rounded-xl hover:bg-accent hover:border-accent transition-all duration-200 group"
            >
              <div className="p-2.5 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Manage Companies</p>
                <p className="text-xs text-muted-foreground mt-0.5">View and manage tenant companies</p>
              </div>
            </a>

            <a
              href="/admin/plans"
              className="flex items-center gap-4 p-4 border rounded-xl hover:bg-accent hover:border-accent transition-all duration-200 group"
            >
              <div className="p-2.5 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Subscription Plans</p>
                <p className="text-xs text-muted-foreground mt-0.5">Manage pricing and plans</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
