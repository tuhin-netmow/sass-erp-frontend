import { CheckCircle2, ShieldCheck, CreditCard, } from "lucide-react"
import { TenantOnboardForm } from "@/shared/components/auth/TenantOnboardForm"
import { useLocation } from "react-router"
import { useGetPublicPlansQuery,  } from "@/store/features/admin/saasApiService"
import type { SubscriptionPlan } from "@/shared";


// --- Helper Functions ---
const calculatePlanPrice = (plan: SubscriptionPlan | undefined, cycle: string) => {
  if (!plan?.price) return '0';
  const price = plan.price;
  const basePrice = cycle === 'yearly'
    ? (typeof price.yearly === 'number' ? price.yearly : parseFloat(String(price.yearly || 0)))
    : (typeof price.monthly === 'number' ? price.monthly : parseFloat(String(price.monthly || 0)));

  if (isNaN(basePrice)) return '0';

  switch (cycle) {
    case 'quarterly': return (basePrice * 3 * 0.95).toFixed(0);
    case 'biannual': return (basePrice * 6 * 0.90).toFixed(0);
    case 'yearly': return basePrice.toFixed(0);
    default: return basePrice.toFixed(0);
  }
};

const formatFeatureValue = (val: unknown): string => {
  if (val === -1 || val === '-1') return 'Unlimited';
  if (val === 0 || val === '0') return 'None';
  return String(val || '');
};

const CYCLE_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Every 3 Months',
  biannual: 'Every 6 Months',
  yearly: 'Yearly'
};

const FEATURE_LABELS: Record<string, string> = {
  max_products: 'Products',
  max_users: 'User Accounts',
  max_staff: 'Staff Members',
  max_suppliers: 'Suppliers',
  max_customers: 'Customers',
  max_purchase_invoices: 'Purchase Invoices',
  max_sales_invoices: 'Sales Invoices',
  max_purchase_returns: 'Purchase Returns',
  max_production_entries: 'Production Entries',
  max_storage_gb: 'Storage (GB)',
  max_companies: 'Companies'
};

const FEATURE_DISPLAY_ORDER = [
  'max_products', 'max_users', 'max_staff', 'max_suppliers', 'max_customers',
  'max_storage_gb', 'max_purchase_invoices', 'max_sales_invoices'
];

export default function RegisterPage() {
  const location = useLocation();
  const { data: plansData } = useGetPublicPlansQuery();
  const queryParams = new URLSearchParams(location.search);

  const queryPlan = queryParams.get('plan');
  const queryCycle = queryParams.get('cycle') || location.state?.cycle || 'monthly';

  // Find selected plan based on state or query param
  const selectedPlan = plansData?.data?.find((p) =>
    p.id === location.state?.planId || (queryPlan && p.name?.toLowerCase() === queryPlan.toLowerCase())
  ) || plansData?.data?.[0];

  const price = calculatePlanPrice(selectedPlan, queryCycle);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-purple-50/30 flex flex-col">
      

      {/* Hero Section */}
      <section className="py-12 px-6 text-center bg-linear-to-r from-purple-100/50 to-purple-50/50 border-b border-purple-100">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-[#AD46FF] mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
            </span>
            Start your 14-day free trial today
          </div>
          <h1 className="text-3xl md:text-5xl font-bold italic font-merriweather text-gray-900 mb-4">
            Get Started with <span className="text-[#AD46FF]">KIRA ERP</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your business profile to activate your professional ERP workspace. No credit card required.
          </p>
        </div>
      </section>

      <main className="grow grid lg:grid-cols-5 max-w-7xl mx-auto w-full p-6 md:p-12 gap-12">
        {/* Left: Summary */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-xl space-y-6">
            <SummaryHeader />

            <div className="space-y-4">
              <SummaryRow label="Plan Name" value={(selectedPlan?.name as string) || 'Starter'} isBold />
              <SummaryRow label="Billing Cycle" value={CYCLE_LABELS[queryCycle] || queryCycle} />
              <div className="flex justify-between items-center pt-4 border-t border-purple-50">
                <p className="text-xl font-black text-gray-900">Total Due Now</p>
                <div className="text-right">
                  <PriceDisplay price={price} />
                  <p className="text-xs text-gray-400 font-bold italic">
                    {Number(price) > 0 ? "Secure redirect to payment next" : "No credit card required for trial"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-purple-50">
              <p className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest">Plan Limits & Features</p>
              <FeaturesList features={selectedPlan?.features} />
            </div>
          </div>

          <TrustBadges />
        </div>

        {/* Right: Registration Form */}
        <div className="lg:col-span-3 flex flex-col justify-center">
          <TenantOnboardForm className="w-full" />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Trusted by 5,000+ businesses globally. Powering the next generation of ERP.</p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>14-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Sub-components ---

const SummaryHeader = () => (
  <div className="flex justify-between items-center pb-6 border-b border-purple-50">
    <h2 className="font-bold text-lg text-gray-900 uppercase tracking-wider">Subscription Summary</h2>
    <span className="bg-linear-to-r from-purple-50 to-purple-100 text-[#AD46FF] px-4 py-1.5 rounded-full text-xs font-black uppercase border border-purple-200">
      Selected
    </span>
  </div>
);

const SummaryRow = ({ label, value, isBold = false }: { label: string, value: string, isBold?: boolean }) => (
  <div className="flex justify-between items-center">
    <p className="text-gray-500 font-medium text-sm">{label}</p>
    <p className={`${isBold ? 'font-black' : 'font-bold'} text-gray-900 capitalize text-sm`}>{value}</p>
  </div>
);

const PriceDisplay = ({ price }: { price: string }) => (
  <p className="text-3xl font-black text-[#AD46FF]">{Number(price) === 0 ? 'Free' : `$${price}`}</p>
);

const FeaturesList = ({ features }: { features: unknown }) => {
  let parsedFeatures = (features as Record<string, unknown>) || {};
  if (typeof features === 'string') {
    try { parsedFeatures = JSON.parse(features); } catch { parsedFeatures = {}; }
  }

  return (
    <ul className="space-y-3">
      {FEATURE_DISPLAY_ORDER.filter(key => Object.prototype.hasOwnProperty.call(parsedFeatures, key)).map(key => (
        <li key={key} className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <span><span className="font-semibold text-gray-900">{FEATURE_LABELS[key] || key}</span>: {formatFeatureValue(parsedFeatures[key])}</span>
        </li>
      ))}
      <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        <span className="font-semibold text-gray-900">Modules</span>: {(parsedFeatures.modules as unknown[])?.length || 0} included
      </li>
    </ul>
  );
};

const TrustBadges = () => (
  <div className="grid grid-cols-2 gap-4">
    <TrustBadge icon={ShieldCheck} title="Secure Setup" sub="256-bit Encryption" />
    <TrustBadge icon={CreditCard} title="Instant Access" sub="Zero Setup Fees" />
  </div>
);

const TrustBadge = ({ icon: Icon, title, sub }: { icon: React.ElementType, title: string, sub: string }) => (
  <div className="bg-linear-to-br from-purple-50 to-purple-100/50 p-5 rounded-2xl flex items-center gap-3 border border-purple-200">
    <div className="bg-white p-2 rounded-xl">
      <Icon className="w-5 h-5 text-[#AD46FF]" />
    </div>
    <div>
      <p className="text-xs font-black text-gray-900">{title}</p>
      <p className="text-[10px] text-gray-600 font-bold">{sub}</p>
    </div>
  </div>
);
