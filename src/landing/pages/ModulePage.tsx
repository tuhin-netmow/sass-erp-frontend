

import { Button } from "@/shared/components/ui/button";
import { ArrowRight, Activity, LayoutGrid, BarChart3, Clock, TrendingUp, Zap, Check } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import CtaSection from "./CtaSection";
import { useParams } from "react-router";
import landingPageMetadata from '../config/metadata';





const heroContent = {
    title: "Dashboard Module",
    description: "Visual summary of key business metrics and activities with real-time insights. Get a comprehensive overview of your entire business operation at a glance.",
    mainImage: "/assets/module/dashboard_module.png",
    icon: LayoutGrid
};

const features = [
    {
        title: "Real-Time Analytics",
        description: "Monitor business performance with live data updates and interactive visualizations.",
        icon: Activity,
        bgColor: "bg-[#1a1f36]",
        iconColor: "text-white",
    },
    {
        title: "Custom Widgets",
        description: "Create personalized dashboard layouts with drag-and-drop widget customization.",
        icon: LayoutGrid,
        bgColor: "bg-[#1a1f36]",
        iconColor: "text-white",
    },
    {
        title: "KPI Tracking",
        description: "Track key performance indicators with customizable goals and benchmarks.",
        icon: TrendingUp,
        bgColor: "bg-[#1a1f36]",
        iconColor: "text-white",
    },
    {
        title: "Visual Reports",
        description: "Access stunning charts, graphs, and visual representations of your data.",
        icon: Clock,
        bgColor: "bg-[#1a1f36]",
        iconColor: "text-white",
    },
    {
        title: "Trend Analysis",
        description: "Identify patterns and trends with historical data comparison and forecasting.",
        icon: BarChart3,
        bgColor: "bg-[#1a1f36]",
        iconColor: "text-white",
    },
    {
        title: "Quick Actions",
        description: "Execute common tasks directly from dashboard widgets for improved efficiency.",
        icon: Zap,
        bgColor: "bg-[#1a1f36]",
        iconColor: "text-white",
    },
];



const benefits = [
    "Make informed decisions with real-time business insights",
    "Identify issues and opportunities before they become critical",
    "Personalized views for different roles and departments",
    "Mobile-responsive design for on-the-go access",
    "Reduce time spent searching for information",
    "Automated alerts for important metrics and thresholds",
];

const capabilities = [
    {
        title: "Financial Overview",
        items: [
            "Revenue and profit trends",
            "Cash flow visualization",
            "Budget vs. actual comparison",
            "Outstanding receivables and payables",
        ]
    },
    {
        title: "Operations Metrics",
        items: [
            "Production efficiency and output",
            "Inventory levels and turnover",
            "Order fulfillment status",
            "Supply chain performance",
        ]
    },
    {
        title: "Sales & Marketing",
        items: [
            "Sales pipeline and conversion rates",
            "Customer acquisition metrics",
            "Product performance analysis",
            "Regional sales breakdown",
        ]
    },
    {
        title: "HR & Resources",
        items: [
            "Employee attendance and productivity",
            "Workforce allocation",
            "Training completion rates",
            "Resource utilization metrics",
        ]
    }
];






const ModulePage = () => {
    const { module } = useParams();
    const metadata = landingPageMetadata['module-page'];

    // Process module name for display
    const moduleName = module ? module.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Dashboard";

    // Placeholder for dynamic API call based on module name
    // const moduleData = await getModuleData(module); 

    const displayContent = {
        ...heroContent,
        title: `${moduleName} Module` || heroContent.title
    };

    return (
        <>
            <Helmet>
                <title>{metadata.title.replace('Modules', `${moduleName} Module`)}</title>
                <meta name="description" content={metadata.description.replace('Modules', moduleName)} />
                <meta name="keywords" content={metadata.keywords.join(', ')} />
                <meta property="og:title" content={metadata.title.replace('Modules', `${moduleName} Module`)} />
                <meta property="og:description" content={metadata.description.replace('Modules', moduleName)} />
                <meta property="og:image" content={metadata.ogImage} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metadata.title.replace('Modules', `${moduleName} Module`)} />
                <meta name="twitter:description" content={metadata.description.replace('Modules', moduleName)} />
                <link rel="canonical" href={`https://kiraerp.com/modules/${module}`} />
            </Helmet>
            <div className="flex flex-col min-h-screen bg-white font-sans text-[#1a1f36] overflow-hidden">

                {/* -- Hero Section -- */}
                <section className="relative w-full bg-linear-to-br from-[#FAF5FF] to-[#FFFFFF] py-20 px-6 lg:px-8 overflow-hidden text-[#a068ff]">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-purple-200/20 rounded-full blur-[80px] z-0" />

                    {/* Floating Abstract Shapes */}
                    <div className="absolute left-[3%] bottom-[10%] pointer-events-none">
                        <div className="w-[20px] h-[20px]">
                            <img src="/assets/module/4.png" alt="Floating Shape" width={1800} height={1800} className="w-full h-auto object-cover" />
                        </div>
                    </div>
                    <div className="absolute right-[3%] top-0 pointer-events-none">
                        <div className="w-[54px] h-[54px]">
                            <img src="/assets/module/4.png" alt="Floating Shape" width={1800} height={1800} className="w-full h-auto object-cover" />
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between relative z-10 text-[#1a1f36]">
                        {/* Hero Content */}
                        <div className="lg:w-[45%] flex flex-col items-start">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex items-center justify-center rounded-full p-5 bg-linear-to-br from-[#CC90FB] to-[#AD46FF] shadow-xl shadow-[#a068ff]/30 text-white">
                                    <displayContent.icon size={40} strokeWidth={2.5} />
                                </div>
                                <div className="w-[40px] h-[40px]">
                                    <img src="/assets/module/2.png" alt="Floating Shape" width={2000} height={2000} className="w-full h-auto object-cover" />
                                </div>
                            </div>

                            <h1 className="text-[48px] lg:text-[56px] font-medium tracking-tight text-[#1a1f36] mb-4 leading-tight">
                                {displayContent.title}
                            </h1>
                            <p className="text-[18px] text-[#5c688b] mb-10 leading-[1.6] max-w-lg">
                                {displayContent.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <Button className="rounded-lg bg-[#AD46FF] hover:bg-[#9a47da] text-white px-4 py-3  text-sm font-medium shadow-lg shadow-[#a068ff]/25 transition-all group">
                                    Get Started
                                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button className="rounded-lg border-2 border-[#AD46FF] bg-white text-[#AD46FF] hover:bg-[#AD46FF] hover:text-white px-4 py-3  text-sm font-medium transition-all shadow-sm">
                                    Schedule Demo
                                </Button>
                            </div>
                        </div>

                        {/* Hero Image Group */}
                        <div className="lg:w-[50%] w-full mt-20 lg:mt-0 relative">
                            {/* Decorative overlap shapes */}
                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-400 opacity-20 rounded-2xl -z-10" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500 opacity-15 rounded-full blur-xl -z-10" />

                            <div className="relative rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] bg-white border border-[#f0f2f9]">
                                <img
                                    src={displayContent.mainImage}
                                    alt="Dashboard laptop"
                                    width={1000}
                                    height={1000}
                                    className="w-full h-auto object-cover"
                                   
                                />
                                {/* Purple corner overlays as seen in image */}
                                <div className="absolute top-2 right-2 w-16 h-16 bg-[#a068ff]/20 rounded-xl blur-sm pointer-events-none" />
                                <div className="absolute bottom-4 left-4 w-24 h-24 bg-[#a068ff]/15 rounded-full blur-md pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* -- Key Features Section -- */}
                <section className="w-full bg-[#0b1121] py-10 md:py-20 relative overflow-hidden">
                    <div className="container flex flex-col items-center">
                        <div className="text-center mb-10 md:mb-16">
                            <h2 className="text-[32px] lg:text-[42px] font-semibold text-white mb-6 tracking-tight">Key Features</h2>
                            <p className="text-slate-400 text-[16px] lg:text-[18px] max-w-xl mx-auto font-light">
                                Powerful capabilities designed to streamline your operations
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1200px]">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-white rounded-[16px] p-10 flex flex-col items-start transition-all duration-300 hover:-translate-y-1 shadow-sm border border-transparent ${idx === 0 ? " ring-1 ring-[#a068ff]/30 shadow-[#a068ff]/10 shadow-xl" : "hover:border-[#AD46FF38]"} group`}
                                >
                                    <div className={`w-12 h-12 rounded-full ${feature.bgColor} group-hover:bg-[#AD46FF] flex items-center justify-center mb-8 transition-all group-hover:scale-105 duration-300`}>
                                        <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                    </div>
                                    <h3 className="text-[20px] font-bold text-[#1a1f36] mb-3">{feature.title}</h3>
                                    <p className="text-[#5c688b] text-[15px] leading-[1.6]">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* -- Benefits Section -- */}
                <section className="w-full bg-white py-10 md:py-20">
                    <div className="container flex flex-col items-center">
                        <div className="text-center mb-10 md:mb-16">
                            <h2 className="text-[36px] lg:text-[42px] font-medium text-[#1a1f36] mb-4 tracking-tight">Benefits</h2>
                            <p className="text-[#5c688b] text-[16px] lg:text-[18px] max-w-xl mx-auto font-light leading-relaxed">
                                Transform your business operations with measurable results
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full">
                            {benefits.map((benefit, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-4 group bg-[#FAF6FF] p-4 sm:p-5 rounded-[10px]"
                                >
                                    <div className="shrink-0 w-6 h-6 mt-[2px] rounded-full bg-[#AD46FF26] flex items-center justify-center transition-transform group-hover:scale-110">
                                        <Check className="w-3.5 h-3.5 text-[#AD46FF]" strokeWidth={3} />
                                    </div>
                                    <p className="text-[15px] text-[#364153] leading-relaxed">
                                        {benefit}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* -- Core Capabilities Section -- */}
                <section className="w-full bg-white py-10 md:py-20">
                    <div className="container flex flex-col items-center">
                        <div className="text-center mb-10 md:mb-16">
                            <h2 className="text-[36px] lg:text-[42px] font-medium text-[#1a1f36] mb-4 tracking-tight">Core Capabilities</h2>
                            <p className="text-[#5c688b] text-[16px] lg:text-[18px] max-w-xl mx-auto font-light">
                                Comprehensive functionality to meet all your business needs
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1100px]">
                            {capabilities.map((cap, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white border border-[#AD46FF38]/60 rounded-[24px] p-8 shadow-[0_10px_30px_-15px_rgba(160,104,255,0.05)] hover:shadow-[0_15px_40px_-12px_rgba(160,104,255,0.12)] flex flex-col hover:scale-[1.01] transition-all duration-300 transform-gpu will-change-transform"
                                >
                                    <h3 className="text-[20px] font-bold text-[#1a1f36] mb-10">{cap.title}</h3>
                                    <ul className="space-y-4">
                                        {cap.items.map((item, i) => (
                                            <li key={i} className="flex items-center gap-4 group">
                                                <div className="shrink-0 w-6 h-6 rounded-full bg-[#f3f0ff] flex items-center justify-center transition-colors">
                                                    <ArrowRight className="w-3.5 h-3.5 text-[#a068ff]" strokeWidth={3} />
                                                </div>
                                                <span className="text-[15.5px] text-[#5c688b] font-medium transition-colors group-hover:text-[#1a1f36]">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* -- CTA Section -- */}
                <CtaSection />

            </div>
        </>
    );
};




export default ModulePage;
