import { Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import { useNavigate } from "react-router";
import type { SubscriptionPlan } from "@/shared";


interface PricingCardProps {
    plan: SubscriptionPlan;
    price: number;
    isMostPopular: boolean;
    isAnnual: boolean;
}

export default function PricingCard({ plan, price, isMostPopular, isAnnual }: PricingCardProps) {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        const cycle = isAnnual ? 'yearly' : 'monthly';
        navigate(`/register?plan=${encodeURIComponent(plan.name)}&cycle=${cycle}`, {
            state: { planId: plan.id, cycle }
        });
    };

    return (
        <div
            className={`rounded-[20px] bg-white p-6 lg:p-8 flex flex-col text-left ${
                isMostPopular
                    ? 'shadow-[0_10px_40px_-10px_rgba(173,70,255,0.2)] border border-[#D8B4FE] transform lg:-translate-y-4 z-10 relative'
                    : 'shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-100'
            }`}
        >
            {isMostPopular && (
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                    <span className="rounded-full bg-linear-to-r from-[#CC90FB] to-[#AD46FF] px-4 py-1.5 text-[10px] lg:text-[11px] tracking-wider text-white shadow-sm">
                        Most Popular
                    </span>
                </div>
            )}
            <h3 className="text-xl lg:text-2xl font-medium text-[#0A0A0A]">{plan.name}</h3>
            <p className="mt-2 text-sm lg:text-[15px] text-gray-500">{plan.description}</p>
            <p className="mt-4 lg:mt-6 flex items-baseline text-4xl lg:text-5xl font-bold text-[#0A0A0A]">
                ${price}
                <span className="ml-1 text-sm lg:text-[17px] font-medium text-gray-500">/month</span>
            </p>
            <Button
                variant={isMostPopular ? "default" : "outline"}
                className={`mt-6 lg:mt-8 w-full rounded-xl py-6 lg:py-2.5 font-medium text-base ${
                    isMostPopular
                        ? 'bg-[#0A0A0A] text-white hover:bg-black/80 shadow-md'
                        : 'border-gray-200 shadow-sm'
                }`}
                onClick={handleGetStarted}
            >
                Get Started
            </Button>
            <ul className="mt-6 lg:mt-8 flex flex-col space-y-3 lg:space-y-4 text-sm lg:text-[15px] text-gray-600">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                        <div className="bg-[#22C55E]/20 rounded-full p-0.5 mr-3 shrink-0">
                            <Check className="h-3 w-3 text-[#16A34A]" strokeWidth={4} />
                        </div>
                        {feature.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
