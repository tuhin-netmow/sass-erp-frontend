"use client";


import { Button } from "@/shared/components/ui/button";
import { Check, Play, Scissors } from "lucide-react";

const TestHero = () => {
    return (
        <section className="relative pt-16 pb-32 overflow-hidden bg-[linear-gradient(135deg,#F5F3FF_0%,#FFFFFF_50%,#F5F3FF_100%)]">
            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 opacity-20">
                <Scissors className="w-8 h-8 rotate-45 text-purple-400" />
            </div>
            <div className="absolute top-40 right-20 opacity-20">
                <span className="text-4xl font-bold text-purple-300">×</span>
            </div>
            <div className="absolute bottom-40 left-20 opacity-20">
                <span className="text-4xl font-bold text-purple-300">×</span>
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-purple-100 shadow-sm mb-8">
                    <div className="w-2 h-2 rounded-full bg-[#AD46FF]"></div>
                    <span className="text-sm font-medium text-gray-600">Trusted by 5,000+ enterprises worldwide</span>
                </div>

                {/* Heading */}
                <h1 className="text-5xl md:text-6xl lg:text-[72px] leading-[1.1] font-normal text-[#0A0A0A] mb-8 font-yeseva max-w-5xl mx-auto italic">
                    Full <span className="text-[#AD46FF] not-italic">Operational</span> Control.
                    <br />
                    Infinite <span className="text-[#AD46FF] not-italic">Scalability</span>.
                </h1>

                {/* Subheading */}
                <p className="text-gray-500 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed mb-10">
                    A unified ERP platform with 23 integrated modules. Eliminate silos. Automate workflows. Gain real-time visibility across finance, operations, supply chain, and human capital.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                    <Button className="bg-[#AD46FF] hover:bg-[#9535E5] text-white px-8 py-6 h-auto text-lg rounded-xl flex items-center gap-2">
                        Schedule a Demo <ArrowRight className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-6 h-auto text-lg rounded-xl flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-purple-200 flex items-center justify-center">
                            <Play className="w-4 h-4 fill-purple-600 text-purple-600" />
                        </div>
                        Watch Platform Tour
                    </Button>
                </div>

                {/* Feature List */}
                <div className="flex flex-wrap justify-center gap-8 mb-16 text-gray-600 font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                        </div>
                        <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                        </div>
                        <span>30-day free trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                        </div>
                        <span>Migration support included</span>
                    </div>
                </div>

                {/* Dashed Line with Scissors */}
                <div className="relative w-full max-w-4xl mx-auto mb-20">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dashed border-purple-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <div className="bg-white px-4 py-2 rounded-lg border border-purple-100 shadow-sm">
                            <Scissors className="w-5 h-5 text-purple-400 rotate-90" />
                        </div>
                    </div>
                </div>

                {/* Dashboard Screenshot */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Decorative blobs behind dashboard */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-200/50 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-200/50 rounded-full blur-3xl -z-10"></div>
                    
                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-purple-100 bg-white p-2">
                        <div className="rounded-2xl overflow-hidden">
                            <img
                                src="/assets/img/hero-dashboard.webp" 
                                alt="ERP Dashboard" 
                                width={1200} 
                                height={800} 
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default TestHero;
