import { Card, CardContent } from "@/shared/components/ui/card";
import { Factory, ShoppingBag, Building2, Pill, Zap, Truck } from "lucide-react";


const industries = [
    {
        icon: Factory,
        name: "Manufacturing",
        description: "Production planning, BOM management, and shop floor control for discrete and process manufacturing."
    },
    {
        icon: ShoppingBag,
        name: "Wholesale & Distribution",
        description: "Multi-warehouse inventory, order management, and route optimization for distributors and wholesalers."
    },
    {
        icon: Building2,
        name: "Professional Services",
        description: "Project accounting, resource allocation, and time tracking for consulting and service firms."
    },
    {
        icon: Pill,
        name: "Healthcare & Pharma",
        description: "Batch tracking, regulatory compliance, and supply chain visibility for medical and pharmaceutical operations."
    },
    {
        icon: Zap,
        name: "Technology & Software",
        description: "Subscription billing, resource management, and financial consolidation for SaaS and tech companies."
    },
    {
        icon: Truck,
        name: "Logistics & Transportation",
        description: "Fleet management, route planning, and real-time tracking for 3PL and transportation providers."
    }
];

export function HomeIndustryUseCases() {
    return (
        <section className="bg-[#0F172B] py-10 md:py-20">
            <div className="container">
                <div className="mb-10 md:mb-16 text-center">
                    <h2 className="mb-4 text-3xl md:text-4xl text-white">
                        Built for Your Industry
                    </h2>
                    <p className="mx-auto max-w-3xl text-lg text-gray-400">
                        Configurable workflows and industry-specific features that adapt to your business model.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {industries.map((industry, index) => {
                        const Icon = industry.icon;
                        return (
                            <Card key={index} className="border-gray-200 hover:border-[#AD46FF] transition-all hover:shadow-md group py-0 border-1 border-transparent hover:border-[var(--color-brand)]">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-[#0F172B] text-white group-hover:bg-[var(--color-brand)] group-hover:text-white transition-all">
                                        <Icon className="size-6" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                        {industry.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {industry.description}
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