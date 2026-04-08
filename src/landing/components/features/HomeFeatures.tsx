import { Card, CardContent } from "@/shared/components/ui/card";
import { Layers, LayoutDashboard, Image as ImageIcon, Box, Database, Factory } from "lucide-react";


const categories = [
    {
        title: "Core System",
        subtitle: "Foundation & central configuration",
        features: [
            {
                title: "General",
                description: "System-wide configuration and company setup for unified business control",
                icon: Layers,
                color: "purple",
                img: "/assets/img/feature-1.webp"
            },
            {
                title: "Dashboard",
                description: "Executive command center with real-time KPIs, analytics, and customizable widgets.",
                icon: LayoutDashboard,
                color: "blue",
                img: "/assets/img/feature2.webp"
            },
            {
                title: "My Gallery",
                description: "Centralized digital asset management for documents, images, and media files.",
                icon: ImageIcon,
                color: "indigo",
                img: "/assets/img/feature3.webp"
            }
        ]
    },
    {
        title: "Operations & Inventory",
        subtitle: "Manufacturing, supply chain & logistics",
        features: [
            {
                title: "Products",
                description: "Complete product catalog management covering SKUs, variants, pricing & lifecycle.",
                icon: Box,
                color: "slate",
                img: "/assets/img/feature4.webp"
            },
            {
                title: "Raw Materials",
                description: "Material requirements planning with reorder automation & supplier integration.",
                icon: Database,
                img: "/assets/img/feature5.webp",
                color: "emerald"
            },
            {
                title: "Production",
                description: "End-to-end manufacturing execution from work orders to quality tracking.",
                icon: Factory,
                color: "orange",
                img: "/assets/img/feature6.webp"
            }
        ]
    }
];

export default function HomeFeatures() {
    return (
        <section className="relative overflow-hidden py-10 md:py-20" style={{ background: "linear-gradient(179deg, #FFF 1.03%, #FFF 64.25%, #DEBCFF 127.48%)" }}>
            <div className="container relative z-10">
                {categories.map((category, catIndex) => (
                    <div key={catIndex} className={catIndex > 0 ? "mt-20" : ""}>
                        {/* Category Header/Divider */}
                        <div className="relative mb-10 flex items-center justify-center">
                            <div className="relative flex flex-col items-center bg-transparent px-8 text-center">
                                <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
                                    {category.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {category.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {category.features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <Card key={index} className="group relative overflow-hidden border-1 border-gray-100 bg-white transition-all py-4 md:py-6 rounded-3xl hover:border-[var(--color-brand)]">
                                        <CardContent className="px-4 md:px-6">
                                            {/* Illustration Area Container */}
                                            <div className="relative group/canvas">
                                                <div
                                                    className="relative w-full h-48 overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all"
                                                >
                                                    <div className="relative h-full w-full opacity-90 transition-all duration-500 group-hover:scale-110">
                                                        <img
                                                            src={feature.img}
                                                            alt={feature.title}
                                                            
                                                            className="object-cover"
                                                        />
                                                        {/* Optional overlay on hover */}
                                                        <div className="absolute inset-0 bg-[#AD46FF]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="pt-6 pb-2 flex gap-4 items-start">
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F172B] text-white shadow-sm transition-all duration-300 group-hover:bg-[#AD46FF] group-hover:scale-110 group-hover:shadow-[#AD46FF]/20">
                                                    <Icon className="size-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="mb-1 text-lg font-bold text-gray-900 leading-tight">
                                                        {feature.title}
                                                    </h4>
                                                    <p className="text-sm leading-relaxed text-gray-600">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}

               
            </div>
        </section>
    );
}