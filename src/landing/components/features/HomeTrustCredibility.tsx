import { Card, CardContent } from "@/shared/components/ui/card";
import { Shield, Cloud, Database, Users, FileCheck, Lock } from "lucide-react";


const trustFactors = [
    {
        icon: Shield,
        title: "Enterprise Security",
        description: "SOC 2 Type II certified. AES-256 encryption at rest and TLS 1.3 in transit. Annual penetration testing."
    },
    {
        icon: Cloud,
        title: "Cloud Infrastructure",
        description: "Hosted on AWS/Azure with multi-region redundancy. Auto-scaling architecture handles peak loads seamlessly."
    },
    {
        icon: Database,
        title: "Automated Backups",
        description: "Continuous backup with 15-minute RPO. Point-in-time recovery up to 30 days. Geo-replicated storage."
    },
    {
        icon: Users,
        title: "Multi-User Environment",
        description: "Unlimited concurrent users. No performance degradation. Session management and conflict resolution."
    },
    {
        icon: FileCheck,
        title: "E-Invoice Compliance",
        description: "Government-approved formats (ZATCA, Peppol, FatturaPA). Digital signature integration. Real-time submission."
    },
    {
        icon: Lock,
        title: "GDPR & Privacy",
        description: "Full GDPR compliance. Data residency options. Right to be forgotten automation. Privacy by design."
    }
];

export function HomeTrustCredibility() {
    return (
        <section className="bg-slate-900 py-10 md:py-20 text-white relative overflow-hidden">
            {/* Background shapes */}
            <div className="absolute top-0 right-0 size-96 rounded-full bg-[#AD46FF] opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 size-80 rotate-45 border-8 border-purple-400 opacity-10"></div>

            <div className="relative container">
                <div className="mb-10 md:mb-16 w-full lg:w-1/2">
                    <h2 className="mb-4 text-3xl md:text-4xl">
                        Security & Reliability You Can Trust
                    </h2>
                    <p className="mb-8 text-lg text-gray-400">
                        Bank-grade security infrastructure with enterprise SLAs. Your data is protected, available, and compliant.
                    </p>
                </div>
                <div className="mb-16 grid gap-12 lg:grid-cols-2 items-center">
                    {/* Left: Content */}
                    <div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {trustFactors.map((factor, index) => {
                                const Icon = factor.icon;
                                return (
                                    <Card key={index} className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800 transition-all py-0 hover:border-[var(--color-brand)] border-1 border-transparent">
                                        <CardContent className="p-6">
                                            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-[#AD46FF]/20 text-[#AD46FF]">
                                                <Icon className="size-6" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold text-white">
                                                {factor.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {factor.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#AD46FF] to-purple-500 rounded-3xl blur-2xl opacity-30"></div>
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                            <img
                                src="/assets/img/trust.webp"
                                alt="Enterprise technology infrastructure"
                                className="size-full object-cover"
                                width={1000}
                                height={1000}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}