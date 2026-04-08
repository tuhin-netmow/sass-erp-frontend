import { Card, CardContent } from "@/shared/components/ui/card";
import { Database, Workflow, TrendingUp } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Database,
        title: "Data Centralization",
        description: "Consolidate disparate systems into a single source of truth. Migrate existing data seamlessly with our onboarding team."
    },
    {
        number: "02",
        icon: Workflow,
        title: "Workflow Automation",
        description: "Configure approval chains, notifications, and business rules. Eliminate manual handoffs and reduce cycle times by up to 70%."
    },
    {
        number: "03",
        icon: TrendingUp,
        title: "Performance Optimization",
        description: "Monitor system health, track KPIs, and iterate. Our analytics engine identifies bottlenecks and recommends improvements."
    }
];

export function HowItWorks() {
    return (
        <section className="py-10 md:py-20 bg-white relative overflow-hidden" style={{ backgroundImage: "url('/assets/img/bg-hiw.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            {/* Background shapes */}
            <div className="absolute top-10 right-10 size-64 rounded-full bg-purple-100 opacity-30 blur-3xl"></div>
            <div className="absolute bottom-10 left-10 size-48 rotate-45 border-8 border-purple-200 opacity-20"></div>

            <div className="relative container">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl md:text-4xl text-gray-900">
                        How the Platform Works
                    </h2>
                    <p className="mx-auto max-w-3xl text-lg text-gray-600">
                        From deployment to optimization-a proven methodology trusted by enterprise clients worldwide.
                    </p>
                </div>

                <div className="mb-16 grid gap-8 md:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <Card key={index} className="relative border-gray-200 hover:border-[#AD46FF] transition-all group py-0">
                                <CardContent className="p-8">
                                    <div className="text-6xl font-bold text-gray-100 group-hover:text-purple-200 transition-colors">
                                        {step.number}
                                    </div>
                                    <div className="mb-4 inline-flex size-14 items-center justify-center rounded-xl bg-[#0F172B] group-hover:bg-[var(--color-brand)] text-white transition-all duration-300">
                                        <Icon className="size-7" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Image showcase */}
                <div className="relative max-w-full">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#AD46FF] to-purple-400 rounded-3xl blur-2xl opacity-20"></div>
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-[size:100%_100%] bg-center bg-no-repeat h-auto md:h-[600px] lg:h-[853px]" style={{ backgroundImage: "url('/assets/img/how-it-works-image.jpg')" }}>
                        <div className="flex flex-col md:flex-row gap-2 p-6 items-center md:items-end justify-center md:justify-start pointer-events-none h-full">
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both">
                                <img
                                    src="/assets/img/dashboard-report.png"
                                    alt="Dashboard report"
                                    width={280}
                                    height={220}
                                    className="h-[120px] md:h-[180px] lg:h-[220px] w-auto rounded-lg md:rounded-xl shadow-xl md:shadow-2xl backdrop-blur-sm object-cover"
                                />
                            </div>
                            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 fill-mode-both">
                                <img
                                    src="/assets/img/workflow-cricle.png"
                                    alt="Workflow chart"
                                    width={200}
                                    height={200}
                                    className="h-[120px] md:h-[180px] lg:h-[220px] w-auto rounded-lg md:rounded-xl shadow-xl md:shadow-2xl backdrop-blur-sm object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}