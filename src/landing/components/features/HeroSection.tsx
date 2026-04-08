import { Button } from "@/shared/components/ui/button";
import { ArrowRight, CheckCircle2, CirclePlay } from "lucide-react";
import { Link } from "react-router";


export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-10 md:pt-20" style={{ backgroundImage: "url('/assets/img/hero-bg.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="container">
                <div className="grid items-center gap-12">
                    {/* Left Side - Content */}
                    <div className="space-y-6 flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs md:text-sm font-medium text-purple-600">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
                            </span>
                            Trusted by 5,000+ enterprises worldwide
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold italic leading-tight tracking-tight text-gray-900 font-merriweather">
                            Full <span className="text-(--color-brand)">Operational</span> Control <span className="md:block">Infinite <span className="text-(--color-brand)">Scalability</span></span>

                        </h1>

                        <p className="max-w-4xl text-sm md:text-lg text-gray-600">
                            A unified ERP platform with 23 integrated modules. Eliminate silos. Automate workflows. Gain real-time visibility across finance, operations, supply chain, and human capital.
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Button size="lg" className="bg-[#AD46FF] hover:bg-[#9333EA] cursor-pointer">
                                <Link to="/contact" className="inline-flex items-center justify-center gap-2 cursor-pointer">
                                    Schedule a Demo
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border border-(--color-brand) text-(--color-brand) hover:bg-(--color-brand) hover:text-white cursor-pointer transition duration-300">
                                <Link to="/contact" className="inline-flex items-center justify-center gap-2 cursor-pointer">
                                    <CirclePlay className="h-4 w-4" />
                                    Watch Platform Tour
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center md:gap-6 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-green-500" />
                                <span>14-Day Free Trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-green-500" />
                                <span>No Credit Card Required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-green-500" />
                                <span>Cancel Anytime</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom - Image */}
                    <div className="relative">
                        <div className="relative">
                            <img
                                src="/assets/img/hero-dashboard.webp"
                                alt="KIRA ERP Dashboard"
                                width={800}
                                height={600}
                                className="relative z-10 w-full shadow-xxl h-auto"
                            />
                            <div className="absolute -bottom-8 -right-8 -z-10 h-full w-full rounded-2xl bg-purple-100"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}