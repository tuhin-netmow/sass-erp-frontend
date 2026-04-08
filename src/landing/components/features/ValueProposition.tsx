import { Card, CardContent } from "@/shared/components/ui/card";
import { CheckCircle, Zap, TrendingUp, Shield } from "lucide-react";


const valueProps = [
    {
        icon: CheckCircle,
        title: "Operational Integration",
        description: "Eliminate data silos. Connect every department—from warehouse to boardroom—on a single, unified system."
    },
    {
        icon: Zap,
        title: "Real-Time Intelligence",
        description: "Instant visibility into KPIs, cash flow, inventory, and workforce metrics. Make decisions based on live data, not yesterday's reports."
    },
    {
        icon: TrendingUp,
        title: "Scalable Architecture",
        description: "Built for growth. Add users, locations, and modules as you expand. Cloud-native infrastructure that scales with your business."
    },
    {
        icon: Shield,
        title: "Compliance & Control",
        description: "Role-based access, audit trails, and built-in compliance frameworks. Maintain governance without sacrificing agility."
    }
];

export default function ValueProposition() {
    return (
        <section className="py-10 md:py-20 bg-[#0F172B]">
            <div className="container">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl md:text-4xl text-white">
                        Why Leading Enterprises Choose Our Platform
                    </h2>
                    <p className="mx-auto max-w-xl text-lg text-gray-400">
                        Purpose-built for organizations that demand reliability, flexibility, and complete operational transparency.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {valueProps.map((prop, index) => {
                        const Icon = prop.icon;
                        return (
                            <Card key={index} className="border-gray-200 hover:border-[#AD46FF] transition-all hover:shadow-lg group py-0">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-purple-100 text-[#AD46FF] group-hover:bg-[#AD46FF] group-hover:text-white transition-all">
                                        <Icon className="size-7" />
                                    </div>
                                    <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                        {prop.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {prop.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}