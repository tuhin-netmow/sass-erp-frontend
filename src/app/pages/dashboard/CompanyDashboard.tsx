import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent } from "@/shared/components/ui/tabs";
import {
  Building2,
  Users,
  FileText,
  Settings,
  BarChart3,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Database,
  Zap,
  Globe,
} from "lucide-react";
import { getSubdomainInfo } from "@/shared/utils/subdomain";
import { useAppSelector } from "@/store/store";



interface CompanyStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  thisMonthRevenue: number;
  storageUsed: number;
  storageLimit: number;
  apiCalls: number;
  apiLimit: number;
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string>("");
  const [subdomain, setSubdomain] = useState<string>("");

  // const user = useAppSelector((state) => state.auth.user) as User | null;
  const company = useAppSelector((state) => state.auth.company);

  useEffect(() => {
    // Get subdomain info
    const subdomainInfo = getSubdomainInfo();

    if (!subdomainInfo.isCompanyPortal || !subdomainInfo.subdomain) {
      // Not on company portal, redirect
      navigate("/dashboard");
      return;
    }

    setSubdomain(subdomainInfo.subdomain);
    setCompanyName(company?.name || subdomainInfo.subdomain.charAt(0).toUpperCase() + subdomainInfo.subdomain.slice(1));

    // Fetch company stats
    // eslint-disable-next-line react-hooks/immutability
    fetchCompanyStats();
  }, []);

  const fetchCompanyStats = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await companyApi.getStats();
      // setStats(response.data);

      // Mock data for now
      setTimeout(() => {
        setStats({
          totalUsers: 156,
          activeUsers: 89,
          totalOrders: 1245,
          pendingOrders: 23,
          revenue: 45890,
          thisMonthRevenue: 12500,
          storageUsed: 2.4,
          storageLimit: 10,
          apiCalls: 45678,
          apiLimit: 100000,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to fetch company stats:", error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.revenue?.toLocaleString() || 0}`,
      change: "+12.5%",
      changePositive: true,
      icon: <DollarSign className="w-5 h-5" />,
      gradient: "from-blue-600 to-blue-400",
      shadow: "shadow-blue-500/30",
    },
    {
      title: "This Month",
      value: `$${stats?.thisMonthRevenue?.toLocaleString() || 0}`,
      change: "+8.2%",
      changePositive: true,
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: "from-emerald-600 to-emerald-400",
      shadow: "shadow-emerald-500/30",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      change: "+5.1%",
      changePositive: true,
      icon: <Users className="w-5 h-5" />,
      gradient: "from-violet-600 to-violet-400",
      shadow: "shadow-violet-500/30",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      change: "-3.2%",
      changePositive: false,
      icon: <Clock className="w-5 h-5" />,
      gradient: "from-amber-600 to-amber-400",
      shadow: "shadow-amber-500/30",
    },
  ];

  const usageStats = [
    {
      label: "Storage",
      used: stats?.storageUsed || 0,
      limit: stats?.storageLimit || 10,
      unit: "GB",
      icon: <Database className="w-4 h-4" />,
      color: "bg-blue-500",
    },
    {
      label: "API Calls",
      used: stats?.apiCalls || 0,
      limit: stats?.apiLimit || 100000,
      unit: "",
      icon: <Zap className="w-4 h-4" />,
      color: "bg-emerald-500",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "Add, edit, or remove users",
      icon: <Users className="w-5 h-5" />,
      href: "/dashboard/users",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "View Orders",
      description: "Manage all orders",
      icon: <FileText className="w-5 h-5" />,
      href: "/dashboard/sales/orders",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Analytics",
      description: "View business insights",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/dashboard?tab=analytics",
      color: "bg-violet-100 text-violet-600",
    },
    {
      title: "Settings",
      description: "Company settings",
      icon: <Settings className="w-5 h-5" />,
      href: "/dashboard/settings",
      color: "bg-gray-100 text-gray-600",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "order",
      message: "New order #1234 received",
      time: "5 minutes ago",
      icon: <FileText className="w-4 h-4" />,
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      type: "user",
      message: "New user John Doe registered",
      time: "15 minutes ago",
      icon: <Users className="w-4 h-4" />,
      iconColor: "bg-emerald-100 text-emerald-600",
    },
    {
      id: 3,
      type: "payment",
      message: "Payment of $250 received",
      time: "1 hour ago",
      icon: <DollarSign className="w-4 h-4" />,
      iconColor: "bg-violet-100 text-violet-600",
    },
    {
      id: 4,
      type: "alert",
      message: "Low stock alert: Product XYZ",
      time: "2 hours ago",
      icon: <AlertCircle className="w-4 h-4" />,
      iconColor: "bg-amber-100 text-amber-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Company Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 p-4 shadow-lg shadow-blue-500/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Globe className="w-3 h-3" />
              {subdomain}.{window.location.hostname.split('.').slice(-2).join('.')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/dashboard/settings")}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, idx) => (
              <Card key={idx} className="overflow-hidden border-0">
                <div className={`relative overflow-hidden rounded-xl bg-linear-to-br ${stat.gradient} p-6 shadow-lg ${stat.shadow}`}>
                  {/* Background Pattern */}
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-black/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
                        {stat.icon}
                      </div>
                      <div
                        className={`flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm`}
                      >
                        {stat.changePositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        {stat.value}
                      </h3>
                      <p className="text-xs font-medium text-white/80 uppercase tracking-wider mt-1">
                        {stat.title}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Usage Statistics
              </CardTitle>
              <CardDescription>Track your resource usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {usageStats.map((usage, idx) => {
                  const percentage = (usage.used / usage.limit) * 100;
                  const isWarning = percentage > 80;
                  const isDanger = percentage > 90;

                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-lg p-2 ${isDanger ? 'bg-red-100' : isWarning ? 'bg-amber-100' : 'bg-gray-100'}`}>
                            {usage.icon}
                          </div>
                          <span className="font-medium text-gray-900">{usage.label}</span>
                        </div>
                        <span className={`text-sm font-semibold ${isDanger ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-600'}`}>
                          {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} {usage.unit}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : usage.color} transition-all duration-500`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      {isDanger && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          You've used {percentage.toFixed(0)}% of your {usage.label} limit. Consider upgrading.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(action.href)}
                      className="flex flex-col items-start gap-2 rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50/50"
                    >
                      <div className={`rounded-lg p-2 ${action.color}`}>
                        {action.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates in your workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${activity.iconColor}`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Billing Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Plan</p>
                  <p className="text-lg font-bold text-gray-900">Professional Plan</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Billing Date</p>
                  <p className="text-lg font-bold text-gray-900">April 27, 2026</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Cost</p>
                  <p className="text-lg font-bold text-gray-900">$99.00</p>
                </div>
                <Button onClick={() => navigate("/dashboard/billing/status")}>
                  Manage Billing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
