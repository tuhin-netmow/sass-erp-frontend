import { Card, CardContent } from "@/shared/components/ui/card";
import { LayoutDashboard, Calculator, Package, Users, Shield } from "lucide-react";


const features = [
    {
        icon: LayoutDashboard,
        title: "Intelligent Dashboards",
        points: [
            "Role-based views for executives, managers, and operators",
            "Drag-and-drop widget customization",
            "Real-time data refresh with sub-second latency",
            "Mobile-responsive for iOS and Android"
        ]
    },
    {
        icon: Calculator,
        title: "Accounting Engine",
        points: [
            "Multi-entity, multi-currency general ledger",
            "Automated bank reconciliation",
            "Financial consolidation and intercompany eliminations",
            "Audit-ready compliance and SOX controls"
        ]
    },
    {
        icon: Package,
        title: "Production & Inventory Control",
        points: [
            "MRP/MPS planning with demand forecasting",
            "Barcode and RFID integration",
            "Lot and serial number traceability",
            "Cycle counting and perpetual inventory"
        ]
    },
    {
        icon: Users,
        title: "HR & Payroll Automation",
        points: [
            "Biometric attendance integration",
            "Tax calculation for 50+ countries",
            "Benefits administration and compliance",
            "Employee self-service portal"
        ]
    },
    {
        icon: Shield,
        title: "Role-Based Access Control",
        points: [
            "Field-level security and data masking",
            "Multi-factor authentication (MFA)",
            "SSO integration with Active Directory/SAML",
            "Complete audit trails and activity logs"
        ]
    }
];

export function HomeFeatureHighlights() {
    return (
        <section className="py-10 md:py-20 bg-white relative overflow-hidden" style={{ backgroundImage: "url('/assets/img/bg-highlight.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            {/* Modern shapes */}
            <div className="absolute top-20 left-10 size-32 rounded-full bg-[#AD46FF] opacity-10 blur-2xl"></div>
            <div className="absolute bottom-20 right-10 size-40 rotate-45 border-8 border-purple-200 opacity-20"></div>

            <div className="relative container">
                <div className="mb-10 md:mb-16 grid gap-12 lg:grid-cols-2 items-center">
                    {/* Left: Image */}
                    <div className="relative order-2 lg:order-1">
                        <div className="absolute -inset-4 bg-linear-to-r from-purple-400 to-[#AD46FF] rounded-3xl blur-2xl opacity-20 z-0"></div>
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl z-10">
                            <img
                                src="/assets/img/enterprise-img.webp"
                                alt="Professional team collaboration"
                                className="size-full object-cover"
                                width={1000}
                                height={1000}
                            />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -top-6 -left-6 size-24 rounded-xl bg-[#AD46FF] opacity-20"></div>
                        <div className="absolute -bottom-6 -right-6 size-32 rounded-full bg-purple-300 opacity-20 z-0"></div>
                    </div>

                    {/* Right: Title */}
                    <div className="order-1 lg:order-2">
                        <h2 className="mb-4 text-3xl md:text-4xl text-gray-900">
                            Enterprise-Grade Capabilities
                        </h2>
                        <p className="text-lg text-gray-600">
                            Advanced features that power mission-critical operations for organizations of all sizes.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={index} className="border-gray-200 hover:border-[#AD46FF] transition-all hover:shadow-lg group py-0 border">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-[#0F172B] text-white group-hover:bg-(--color-brand) group-hover:scale-110 transition-transform">
                                        <Icon className="size-6" />
                                    </div>
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                        {feature.title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {feature.points.map((point, pointIndex) => (
                                            <li key={pointIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-black group-hover:bg-(--color-brand) transition-colors"></span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}