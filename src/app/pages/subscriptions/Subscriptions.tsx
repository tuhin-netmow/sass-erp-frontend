import { CreditCard, ExternalLink, Loader2, Shield, FileText, Calendar, BarChart3, Package, Users, TrendingUp, Database, AlertCircle } from "lucide-react";
import { useAuthUserQuery, useGetUsageStatsQuery } from "@/store/features/auth/authApiService";
import { useGetPublicPlansQuery } from "@/store/features/admin/saasApiService";
import {
    useGetPortalUrlMutation,
    useCancelSubscriptionMutation,
    useResumeSubscriptionMutation,
    useUpdatePlanMutation,
    useGetBillingHistoryQuery
} from "@/store/features/app/billing/billingApiService";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";


type TabType = 'subscriptions' | 'usage';

export default function Subscriptions() {

    const [activeTab, setActiveTab] = useState<TabType>('subscriptions');
    const { data: userData, isLoading: isUserLoading, refetch: refetchUser } = useAuthUserQuery();
    const { data: publicPlans } = useGetPublicPlansQuery();
    const { data: historyData, isLoading: isHistoryLoading } = useGetBillingHistoryQuery();
    const { data: usageStats, isLoading: isUsageStatsLoading,  } = useGetUsageStatsQuery();

    const [cancelSubscription] = useCancelSubscriptionMutation();
    const [resumeSubscription] = useResumeSubscriptionMutation();
    const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
    const [getPortalUrl] = useGetPortalUrlMutation();

    // Refresh user data periodically or on mount to ensure subscription status is up to date
    // useEffect(() => { refetchUser(); }, [refetchUser]);

    const handleManageBilling = async () => {
        try {
            const result = await getPortalUrl().unwrap();
            if (result.data?.url) {
                window.location.href = result.data.url;
            } else {
                toast.error("Could not retrieve billing portal URL.");
            }
        } catch (error: any) {
            console.error('[Billing Portal Error]:', error);
            const errorMessage = error?.data?.message || error?.error || 'Failed to access billing portal.';
            toast.error(errorMessage);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to cancel? You will lose access to premium features at the end of your billing cycle.")) return;
        try {
            await cancelSubscription().unwrap();
            await refetchUser();
            toast.success("Subscription canceled.");
        } catch (error: any) {
            toast.error(error?.data?.message || "Error");
        }
    };

    const handleResumeSubscription = async () => {
        try {
            await resumeSubscription().unwrap();
            await refetchUser();
            toast.success("Subscription resumed.");
        } catch (error: any) {
            toast.error(error?.data?.message || "Error");
        }
    };

    const handleUpdatePlan = async (planId: number) => {
        // For simplicity, defaulting to 'monthly'. Ideally, add a toggle in UI.
        // Assuming user wants to keep same cycle or switch to monthly.
        if (!confirm("Confirm plan change?")) return;
        try {
            console.log('[FRONTEND] Updating plan:', planId);
            const result = await updatePlan({ planId, cycle: 'monthly' }).unwrap();
            console.log('[FRONTEND] Update result:', result);

            // If response contains checkout_url, redirect to Stripe checkout
            if ((result.data as any)?.needs_checkout && (result.data as any)?.checkout_url) {
                console.log('[FRONTEND] Redirecting to Stripe checkout:', (result.data as any).checkout_url);
                window.location.href = (result.data as any).checkout_url;
                return;
            }

            // For free plans or direct updates
            console.log('[FRONTEND] Refetching user data');
            await refetchUser(); // Refresh UI to show new plan
            toast.success(result.data?.message || "Plan updated.");
        } catch (error: any) {
            console.error('[FRONTEND] Plan update error:', error);
            toast.error(error?.data?.message || "Error");
        }
    };

    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    // Access company data from the nested user object structure
    const company = (userData?.data as any)?.user?.company;
    const currentPlan = company?.plan || { name: "Free Trial", price: "0" };

    // Calculate display price based on billing cycle
    const basePrice = Number(currentPlan.price) || 0;
    const billingCycle = company?.billing_cycle || 'monthly';
    let displayPrice = basePrice;


    switch (billingCycle) {
        case 'monthly':
            displayPrice = basePrice;
            break;
        case 'quarterly':
            displayPrice = basePrice * 3;
            break;
        case 'biannual':
            displayPrice = basePrice * 6;
            break;
        case 'yearly':
            displayPrice = basePrice * 12;
            break;
    }

    // Calculate next payment date based on billing cycle
    const calculateNextPaymentDate = () => {
        // If subscription_expires_at is set, use it
        if (company?.subscription_expires_at) {
            return new Date(company.subscription_expires_at);
        }

        // Otherwise, calculate from company creation date
        const createdAt = company?.createdAt ? new Date(company.createdAt) : new Date();
        const nextDate = new Date(createdAt);

        switch (billingCycle) {
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'biannual':
                nextDate.setMonth(nextDate.getMonth() + 6);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }

        return nextDate;
    };

    const nextPaymentDate = calculateNextPaymentDate();

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="space-y-2 mb-8">
                    <h1 className="text-3xl font-normal text-gray-900">Payments & subscriptions</h1>
                    <p className="text-gray-600 text-sm">Manage your payment methods, subscriptions, and view usage statistics.</p>
                </header>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`px-6 py-3 font-medium text-sm transition-all relative ${
                            activeTab === 'subscriptions'
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Subscriptions
                        </div>
                        {activeTab === 'subscriptions' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('usage')}
                        className={`px-6 py-3 font-medium text-sm transition-all relative ${
                            activeTab === 'usage'
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Usage Statistics
                        </div>
                        {activeTab === 'usage' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'subscriptions' ? (
                    <div className="space-y-10">
                        <div className="max-w-4xl mx-auto space-y-10">

                {/* Payment Methods Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        Payment methods
                    </h2>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                        <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group" onClick={handleManageBilling}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Manage payment methods</p>
                                    <p className="text-xs text-gray-500">Update cards, backup methods, and billing info</p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-600" />
                        </div>
                    </div>
                </section>

                {/* Subscriptions Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        Subscriptions
                    </h2>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${company?.subscription_status === 'active' ? 'text-green-600 bg-green-50' :
                                    company?.subscription_status === 'canceled' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'
                                    }`}>
                                    {company?.subscription_status || 'Active'}
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-gray-900">{currentPlan.name} Plan</h3>
                                    <p className="text-gray-600 text-sm">ERP {currentPlan.name} (SaaS Solution)</p>

                                    {/* Next Payment Date */}
                                    {(company?.subscription_status === 'active' || company?.subscription_status === 'trialing') && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-bold text-blue-900">Next Payment Date</span>
                                            </div>
                                            <p className="text-lg font-black text-blue-700">
                                                {nextPaymentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    )}

                                    <p className="text-gray-500 text-sm mt-3 pt-2">
                                        {(company?.subscription_status === 'active' || company?.subscription_status === 'trialing') ? (
                                            `Amount: $${displayPrice.toLocaleString()} (${billingCycle})`
                                        ) : company?.subscription_status === 'canceled' ? (
                                            `Access expires on ${nextPaymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                        ) : (
                                            `Current Status: ${company?.subscription_status || 'Active'}`
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 w-full sm:w-auto">
                                    <Button onClick={handleManageBilling} variant="outline" className="rounded-lg px-8 font-bold text-blue-600 border-gray-200 hover:bg-blue-50/50">
                                        Manage
                                    </Button>
                                    {(!company?.subscription_status || company?.subscription_status === 'active' || company?.subscription_status === 'trialing') ? (
                                        <button onClick={handleCancelSubscription} className="text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                                            Cancel subscription
                                        </button>
                                    ) : (
                                        <button onClick={handleResumeSubscription} className="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest text-center">
                                            Resume subscription
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Budget & History Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Order history
                    </h2>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {isHistoryLoading ? (
                            <div className="p-8 text-center text-gray-500 animate-pulse font-medium">Fetching history...</div>
                        ) : historyData?.data?.length ? (
                            <div className="divide-y divide-gray-100">
                                {historyData.data.slice(0, 5).map((item: any) => (
                                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                                <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{item.description}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{new Date(item.occurred_at || item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900">{item.amount ? `$${item.amount}` : '-'}</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${item.status === 'success' ? 'text-green-600' : 'text-gray-500'}`}>{item.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-sm font-medium text-gray-400">No transactions recorded yet.</p>
                            </div>
                        )}
                        <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
                            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 mx-auto" onClick={handleManageBilling}>
                                View all activity in Stripe <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Other Plans Section (Google Style) */}
                <section className="space-y-4 pt-10">
                    <h2 className="text-xl font-medium text-gray-900 border-b border-gray-100 pb-3">Available upgrades</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {publicPlans?.data?.filter((p: any) => p.id !== currentPlan.id).map((plan: any) => (
                            <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between hover:border-blue-200 hover:shadow-sm transition-all">
                                <div>
                                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">{plan.name}</p>
                                    <h4 className="text-xl font-bold text-gray-900 mb-1">${parseFloat(plan.price).toFixed(0)} <span className="text-sm font-normal text-gray-500">/ mo</span></h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">Unlock advanced ERP tools, increased storage and multi-user support.</p>
                                </div>
                                <Button
                                    onClick={() => handleUpdatePlan(plan.id)}
                                    disabled={isUpdating}
                                    variant="outline"
                                    className="mt-6 rounded-full font-bold border-gray-300 hover:bg-gray-50"
                                >
                                    {parseFloat(plan.price) > parseFloat(currentPlan.price) ? 'Upgrade' : 'Switch Plan'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
                        </div>
                    </div>
                ) : (
                    <UsageStatsContent company={company} currentPlan={currentPlan} usageStats={usageStats?.data} isLoading={isUsageStatsLoading} />
                )}
            </div>

            <footer className="max-w-4xl mx-auto py-12 px-4 text-center">
                <p className="text-xs text-gray-400 font-medium">
                    Secure billing by Stripe. Your data is protected by industry-standard encryption.
                    <br />
                    Powered by <span className="font-bold">ERP SAAS</span> &copy; 2026
                </p>
            </footer>
        </div>
    );
}

// Usage Stats Component
function UsageStatsContent({ company, currentPlan, usageStats, isLoading }: any) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    const featureLabels: Record<string, string> = {
        products: 'Products',
        users: 'User Accounts',
        staff: 'Staff Members',
        suppliers: 'Suppliers',
        customers: 'Customers',
        purchase_invoices: 'Purchase Invoices',
        sales_invoices: 'Sales Invoices',
        purchase_returns: 'Purchase Returns',
        production_entries: 'Production Entries',
        storage_gb: 'Storage (GB)'
    };

    const featureIcons: Record<string, any> = {
        products: Package,
        users: Users,
        staff: Users,
        suppliers: TrendingUp,
        customers: Database,
        storage_gb: Database,
        purchase_invoices: FileText,
        sales_invoices: FileText,
        purchase_returns: FileText,
        production_entries: BarChart3
    };

    const displayOrder = [
        'products', 'users', 'staff', 'suppliers', 'customers',
        'storage_gb', 'purchase_invoices', 'sales_invoices', 'purchase_returns', 'production_entries'
    ];

    const usage = usageStats?.usage || {};

    const displayFeatures = displayOrder
        .filter((key: string) => usage.hasOwnProperty(key))
        .map((key: string) => {
            const data = usage[key];
            const isUnlimited = data.limit === -1 || data.limit === 'unlimited';
            const isNone = data.limit === 0;
            const percentage = isUnlimited ? 0 : Math.min(100, data.percentage || 0);
            const isNearLimit = percentage >= 80;
            const isAtLimit = percentage >= 100;

            return {
                label: featureLabels[key] || key.replace(/_/g, ' '),
                key,
                icon: featureIcons[key] || BarChart3,
                current: data.current || 0,
                limit: data.limit || 0,
                remaining: data.remaining || 0,
                percentage,
                period: data.period || null,
                isUnlimited,
                isNone,
                isNearLimit,
                isAtLimit
            };
        });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Current Plan Usage</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        {currentPlan.name} Plan - {company?.subscription_status || 'Active'}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayFeatures.map((feature) => {
                    const Icon = feature.icon;

                    if (feature.isNone) {
                        return (
                            <div key={feature.key} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-lg bg-gray-100">
                                        <Icon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span className="text-xs font-black uppercase px-2 py-1 rounded bg-gray-100 text-gray-600">
                                        Not Available
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {feature.label}
                                </h3>
                                <p className="text-2xl font-bold text-gray-400">
                                    Not Included
                                </p>
                            </div>
                        );
                    }

                    if (feature.isUnlimited) {
                        return (
                            <div key={feature.key} className="bg-white rounded-xl border border-green-200 bg-green-50/30 p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-lg bg-green-100">
                                        <Icon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-xs font-black uppercase px-2 py-1 rounded bg-green-100 text-green-700">
                                        Unlimited
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {feature.label}
                                </h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {feature.current.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">No limit on your plan</p>
                            </div>
                        );
                    }

                    return (
                        <div key={feature.key} className={`bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-all ${
                            feature.isAtLimit ? 'border-red-200' :
                            feature.isNearLimit ? 'border-yellow-200' :
                            'border-gray-200'
                        }`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg ${
                                    feature.isAtLimit ? 'bg-red-100' :
                                    feature.isNearLimit ? 'bg-yellow-100' :
                                    'bg-blue-100'
                                }`}>
                                    <Icon className={`w-5 h-5 ${
                                        feature.isAtLimit ? 'text-red-600' :
                                        feature.isNearLimit ? 'text-yellow-600' :
                                        'text-blue-600'
                                    }`} />
                                </div>
                                <div className="flex items-center gap-2">
                                    {feature.isNearLimit && (
                                        <AlertCircle className={`w-4 h-4 ${feature.isAtLimit ? 'text-red-500' : 'text-yellow-500'}`} />
                                    )}
                                    <span className={`text-xs font-black uppercase px-2 py-1 rounded ${
                                        feature.isAtLimit ? 'bg-red-100 text-red-700' :
                                        feature.isNearLimit ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {feature.isAtLimit ? 'Limit Reached' : feature.isNearLimit ? 'Almost Full' : 'Active'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                {feature.label}
                                {feature.period && <span className="text-xs text-gray-400 font-normal ml-1">({feature.period})</span>}
                            </h3>

                            <p className={`text-2xl font-bold ${
                                feature.isAtLimit ? 'text-red-600' :
                                feature.isNearLimit ? 'text-yellow-600' :
                                'text-gray-900'
                            }`}>
                                {feature.current.toLocaleString()} / {feature.limit.toLocaleString()}
                            </p>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                    <span>{feature.percentage}% used</span>
                                    <span>{feature.remaining.toLocaleString()} remaining</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${
                                        feature.isAtLimit ? 'bg-red-500' :
                                        feature.isNearLimit ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                    }`} style={{ width: `${Math.min(100, feature.percentage)}%` }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Plan Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Need More Resources?</h3>
                        <p className="text-sm text-gray-600">Upgrade your plan to unlock higher limits</p>
                    </div>
                </div>
                <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
                    View Available Plans
                </Button>
            </div>
        </div>
    );
}
