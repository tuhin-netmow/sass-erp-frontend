/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import {
    Activity,
    CheckCircle2,
    Clock,
    Layers,
    ArrowUpRight,
} from "lucide-react";
import { useGetBatchesQuery } from "@/store/features/admin/productionApiService";
import { useEffect, useState } from "react";

export default function ProductionDashboard() {
    const [stats, setStats] = useState({
        activeProductions: 0,
        pending: 0,
        completedToday: 0,
        totalBatches: 0,
    });

    // Fetch production runs data (tenant-filtered)
    const { data: batchesData } = useGetBatchesQuery({ page: 1, limit: 100 });

    // Calculate statistics from real data
    useEffect(() => {
        if (batchesData?.data) {
            const batches = batchesData.data;
            const today = new Date().toISOString().split('T')[0];

            const activeProductions = batches.filter((b: any) =>
                b.status === 'in_progress' || b.status === 'scheduled'
            ).length;

            const pending = batches.filter((b: any) =>
                b.status === 'scheduled'
            ).length;

            const completedToday = batches.filter((b: any) =>
                b.status === 'completed' &&
                b.end_date && b.end_date.split('T')[0] === today
            ).length;

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStats({
                activeProductions,
                pending,
                completedToday,
                totalBatches: batches.length,
            });
        }
    }, [batchesData]);

    // Get recent activity from production runs
    const recentActivity = batchesData?.data?.slice(0, 5).map((batch: any, index: number) => ({
        id: index + 1,
        action: `Production Run #${batch.run_number} ${batch.status.replace('_', ' ')}`,
        time: batch.updatedAt ? getTimeAgo(new Date(batch.updatedAt)) : '-',
        User: batch.created_by ? `User ${batch.created_by}` : 'System'
    })) || [];

    function getTimeAgo(date: Date): string {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return new Date(date).toLocaleDateString();
    }

    const statCards = [
        {
            label: "Active Productions",
            value: stats.activeProductions,
            change: stats.pending > 0 ? `${stats.pending} scheduled` : "Running",
            icon: <Activity className="w-5 h-5 text-blue-600" />,
            className: "border-l-4 border-blue-600",
        },
        {
            label: "Pending / Planned",
            value: stats.pending,
            change: "On schedule",
            icon: <Clock className="w-5 h-5 text-orange-600" />,
            className: "border-l-4 border-orange-600",
        },
        {
            label: "Completed Today",
            value: stats.completedToday,
            change: stats.completedToday > 0 ? "Today" : "None",
            icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
            className: "border-l-4 border-green-600",
        },
        {
            label: "Total Batches",
            value: stats.totalBatches,
            change: "All time",
            icon: <Layers className="w-5 h-5 text-purple-600" />,
            className: "border-l-4 border-purple-600",
        },
    ];

    return (
        <div className="w-full space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Production Overview</h2>
                <p className="text-gray-500">Real-time insights into your manufacturing process.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className={`shadow-sm ${stat.className}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.label}
                            </CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                {stat.change && <ArrowUpRight className="w-3 h-3 mr-1" />} {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from the production floor.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? recentActivity.map((activity: any) => (
                                <div key={activity.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium leading-none">{activity.action}</p>
                                            <p className="text-xs text-gray-500 mt-1">by {activity.User}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">{activity.time}</div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Production Status Overview</CardTitle>
                        <CardDescription>Distribution of production runs by status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {batchesData?.data && batchesData.data.length > 0 ? (
                                (() => {
                                    const batches = batchesData.data;
                                    const statusCounts = batches.reduce((acc: any, batch: any) => {
                                        acc[batch.status] = (acc[batch.status] || 0) + 1;
                                        return acc;
                                    }, {});

                                    const total = batches.length;
                                    const statusConfig = {
                                        'scheduled': { label: 'Scheduled', color: 'bg-blue-500' },
                                        'in_progress': { label: 'In Progress', color: 'bg-green-500' },
                                        'completed': { label: 'Completed', color: 'bg-purple-500' },
                                        'cancelled': { label: 'Cancelled', color: 'bg-red-500' }
                                    };

                                    return Object.entries(statusCounts).map(([status, count]) => {
                                        const countValue = count as number;
                                        const percentage = Math.round((countValue / total) * 100);
                                        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };

                                        return (
                                            <div key={status} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">{config.label}</span>
                                                    <span className="text-gray-500">{countValue} ({percentage}%)</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${config.color}`} style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No production data available</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
