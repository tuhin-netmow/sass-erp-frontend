import { Button } from "@/shared/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router";


export function HomeCTA() {
    return (
        <section className="relative overflow-hidden py-10 md:py-20" style={{ backgroundImage: "url('/assets/img/bg-cta.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            {/* Background shapes */}
            {/* <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-40 -top-40 size-96 rounded-full bg-purple-500 opacity-30 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-pink-500 opacity-30 blur-3xl"></div>

                <div className="absolute top-20 right-1/4 size-32 rotate-45 border-4 border-white opacity-10"></div>
                <div className="absolute bottom-20 left-1/3 size-24 rounded-full border-4 border-white opacity-10"></div>
                <div className="absolute top-1/2 right-20 size-16 rotate-12 border-4 border-white opacity-10"></div>
            </div> */}

            <div className="relative z-10 container text-center text-white">
                <h2 className="mb-6 text-3xl md:text-5xl font-bold">
                    Ready to Transform Your Operations?
                </h2>
                <p className="mb-10 text-lg md:text-xl text-purple-100 leading-relaxed">
                    Join thousands of organizations that have modernized their business with our platform.
                    See it in action with a personalized demo tailored to your industry.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button size="lg" variant="secondary" className="gap-2 text-base px-8 py-6 bg-white text-[#AD46FF] hover:bg-gray-100 cursor-pointer">
                        <Link to="/contact" className="flex gap-2 items-center">
                            <Calendar className="size-5" />
                            Schedule Your Demo
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="gap-2 border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#AD46FF] text-base px-8 py-6 cursor-pointer"
                    >
                        <Link to="/contact" className="flex gap-2 items-center">
                            Start Free Trial <ArrowRight className="size-5" />
                        </Link>
                    </Button>
                </div>
                <p className="mt-8 text-sm text-purple-200">
                    Implementation begins in as little as 2 weeks • Dedicated success manager included • No long-term contracts
                </p>
            </div>
        </section>
    );
}