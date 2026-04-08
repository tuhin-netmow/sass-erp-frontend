

import { useState } from "react";
import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import CtaSection from "./CtaSection";
import { useGetPublicPlansQuery } from "@/store/features/admin/saasApiService";
import PricingCard from "@/landing/components/shared/PricingCard";
import { Check } from "lucide-react";
import landingPageMetadata from '../config/metadata';




export default function Pricing() {
    const { data: plansData } = useGetPublicPlansQuery();
    const plans = plansData?.data || [];
    const [isAnnual, setIsAnnual] = useState(false);
    const metadata = landingPageMetadata.pricing;

    // Sort plans by displayOrder
    const sortedPlans = [...plans].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Find the middle plan for "Most Popular" badge
    const mostPopularIndex = Math.floor(sortedPlans.length / 2);

    


    return (
        <>
            <Helmet>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                <meta name="keywords" content={metadata.keywords.join(', ')} />
                <meta property="og:title" content={metadata.title} />
                <meta property="og:description" content={metadata.description} />
                <meta property="og:image" content={metadata.ogImage} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metadata.title} />
                <meta name="twitter:description" content={metadata.description} />
                <link rel="canonical" href="https://kiraerp.com/pricing" />
            </Helmet>
            {/* ── Hero & Pricing Cards ── */}
            <section className="relative pt-16 pb-16 lg:pt-28 lg:pb-20 overflow-hidden bg-linear-to-b from-[#F9F5FF] via-white to-white text-center">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#AD46FF]/10 blur-[100px] rounded-full"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#AD46FF]/5 blur-[100px] rounded-full"></div>

                    {/* Floating Cards (Hidden on mobile for better readability) */}
                    <div className="absolute top-[5%] xl:top-[12%] -left-20 xl:-left-10 hidden lg:block opacity-90">
                        <img src="/assets/about/left.png" alt="Stats Card" width={280} height={280} className="object-contain"  />
                    </div>

                    <div className="absolute top-[10%] right-[-120px] xl:right-[-60px] hidden lg:block opacity-90">
                        <img src="/assets/about/right.png" alt="Dashboard Chart" width={380} height={380} className="object-contain"  />
                    </div>

                    {/* Decorative Icons */}
                    <div className="absolute top-[10%] left-[10%] md:left-[15%] opacity-80 animate-pulse">
                        <img src="/assets/about/1.png" alt="Decorative Icon 1" width={20} height={20} className="object-contain" />
                    </div>
                    <div className="absolute top-[45%] left-[18%] md:left-[22%] opacity-80">
                        <img src="/assets/about/2.png" alt="Decorative Icon 2" width={24} height={24} className="object-contain" />
                    </div>
                    <div className="absolute top-[12%] right-[12%] md:right-[18%] opacity-80 hidden md:block animate-[bounce_3s_ease-in-out_infinite]">
                        <img src="/assets/about/3.png" alt="Decorative Icon 3" width={40} height={40} className="object-contain" />
                    </div>
                    <div className="absolute bottom-[20%] right-[20%] md:right-[26%] opacity-80">
                        <img src="/assets/about/4.png" alt="Decorative Icon 4" width={24} height={24} className="object-contain" />
                    </div>
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl lg:text-[60px] leading-tight font-normal text-[#0A0A0A] mb-4 lg:mb-6 font-yeseva text-wrap max-w-4xl mx-auto">
                        <span className="text-(--color-brand)">Simple,</span>{" "}
                        <span>Transparent</span>{" "}
                        <span className="text-(--color-brand) tracking-wide">Pricing</span>
                    </h1>
                    <p className="text-gray-500 max-w-[650px] mx-auto text-base md:text-lg leading-relaxed">
                        Choose the plan that&apos;s right for your business. All plans include core features with no
                        hidden fees. Upgrade or downgrade anytime.
                    </p>

                    {/* Toggle */}
                    <div className="mt-12 flex items-center rounded-full shadow-sm bg-white p-2 justify-center space-x-4 max-w-[350px] mx-auto">
                        <span className={`text-[15px] font-medium ${!isAnnual ? 'text-gray-700' : 'text-gray-500'}`}>Monthly</span>
                        <div
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-linear-to-r from-[#CC90FB] to-[#AD46FF] transition-colors focus:outline-none cursor-pointer"
                            onClick={() => setIsAnnual(!isAnnual)}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                        <span className={`text-[15px] ${isAnnual ? 'text-gray-700' : 'text-gray-500'}`}>
                            Annual <span className="text-green-500 ml-1">(Save 20%)</span>
                        </span>
                    </div>

                    {/* Pricing Cards */}
                    <div className="mt-10 lg:mt-16 grid gap-6 lg:gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
                        {sortedPlans.map((plan, index) => {
                            const isMostPopular = index === mostPopularIndex;
                            const price = isAnnual
                                ? (typeof plan.price.yearly === 'number' ? plan.price.yearly : parseFloat(plan.price.yearly || '0'))
                                : (typeof plan.price.monthly === 'number' ? plan.price.monthly : parseFloat(plan.price.monthly || '0'));

                            return (
                                <PricingCard
                                    key={plan.id}
                                    plan={plan}
                                    price={price}
                                    isMostPopular={isMostPopular}
                                    isAnnual={isAnnual}
                                />
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── All Plans Include ── */}
            <section className="py-10 lg:py-20 bg-[#111827]">
                <div className="container mx-auto px-4 max-w-[1000px]">
                    <div className="text-center mb-10 lg:mb-12">
                        <h2 className="text-3xl lg:text-4xl font-medium text-white mb-3 lg:mb-4">All Plans Include</h2>
                        <p className="text-gray-400 text-base lg:text-[17px]">Core features available across all subscription tiers</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                        {[
                            "Cloud-based access", "Data encryption", "Regular backups",
                            "Mobile apps", "User management", "Role-based permissions",
                            "Email notifications", "Import/export tools", "Multi-language support",
                            "Regular updates", "99.9% uptime SLA", "GDPR compliant"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center bg-white rounded-xl p-4 shadow-sm">
                                <div className="bg-[#F3E8FF] rounded-full p-[3px] mr-3.5 shrink-0">
                                    <Check className="h-3.5 w-3.5 text-[#A855F7]" strokeWidth={3} />
                                </div>
                                <span className="text-[#374151] font-medium text-[15px]">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Frequently Asked Questions ── */}
            <section className="py-10 lg:py-20 bg-white">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-10 lg:mb-14">
                        <h2 className="text-3xl lg:text-4xl font-medium text-[#0A0A0A]">Frequently Asked Questions</h2>
                    </div>

                    <Accordion type="single" collapsible className="space-y-4 w-full">
                        {[
                            {
                                q: "Can I change my plan later?",
                                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences."
                            },
                            {
                                q: "Is there a free trial?",
                                a: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to start."
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We accept all major credit cards, PayPal, and bank transfers for annual plans. Enterprise customers can request invoicing."
                            },
                            {
                                q: "Do you offer discounts for annual subscriptions?",
                                a: "Yes, annual subscriptions receive a 20% discount compared to monthly billing. That's like getting 2 months free!"
                            },
                            {
                                q: "What kind of support do you provide?",
                                a: "All plans include email support. Professional plans get priority support, and Enterprise customers receive 24/7 dedicated support with a guaranteed response time."
                            },
                        ].map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border border-gray-100 rounded-[20px] bg-white px-6 md:px-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] hover:border-gray-200 transition-colors">
                                <AccordionTrigger className="text-lg font-medium text-[#0A0A0A] hover:no-underline py-6 md:py-8 text-left">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-500 text-[15px] leading-relaxed pb-6 md:pb-8">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <CtaSection />
        </>
    );
}