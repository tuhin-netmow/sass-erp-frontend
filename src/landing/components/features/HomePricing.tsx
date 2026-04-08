import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Check } from "lucide-react";

export default function HomePricing() {
    return (
        <section className="py-10 md:py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="container">
                <div className="mb-10 md:mb-12 text-center">
                    <h2 className="mb-4 text-3xl md:text-4xl text-gray-900">
                        Flexible, Modular Pricing
                    </h2>
                    <p className="mx-auto max-w-3xl text-lg text-gray-600">
                        Subscribe to the modules you need. Scale as your business grows. Transparent pricing with no hidden fees.
                    </p>
                </div>

                <Card className="mx-auto max-w-4xl border-purple-200 shadow-xl py-0">
                    <CardContent className="px-8 py-6 md:p-12">
                        <div className="grid gap-8 md:grid-cols-2">
                            <div>
                                <h3 className="mb-6 text-2xl font-semibold text-gray-900">
                                    What's Included
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        "Choose from 23 integrated modules",
                                        "Unlimited users (no per-seat fees)",
                                        "Unlimited storage and transactions",
                                        "24/7 enterprise support",
                                        "Free training and onboarding",
                                        "Regular feature updates",
                                        "99.9% uptime guarantee",
                                        "Data migration assistance"
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                <Check className="size-3" />
                                            </div>
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col justify-center rounded-lg bg-purple-50 px-8 py-6">
                                <div className="mb-6 text-center">
                                    <div className="mb-2 text-sm font-medium text-[#AD46FF] uppercase tracking-wide">
                                        Enterprise Plans Starting At
                                    </div>
                                    <div className="mb-1 text-5xl font-bold text-gray-900">Custom</div>
                                    <div className="text-gray-600">Based on your module selection</div>
                                </div>

                                <Button size="lg" className="mb-4 w-full bg-[#AD46FF] hover:bg-[#9333EA] cursor-pointer">
                                    Request Pricing
                                </Button>

                                <p className="text-center text-sm text-gray-600">
                                    Talk to our sales team for a customized quote
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-8">
                            <div className="grid gap-4 text-center md:grid-cols-3">
                                <div>
                                    <div className="mb-1 font-semibold text-gray-900">No Setup Fees</div>
                                    <div className="text-sm text-gray-600">Get started immediately</div>
                                </div>
                                <div>
                                    <div className="mb-1 font-semibold text-gray-900">Cancel Anytime</div>
                                    <div className="text-sm text-gray-600">No long-term lock-in</div>
                                </div>
                                <div>
                                    <div className="mb-1 font-semibold text-gray-900">30-Day Trial</div>
                                    <div className="text-sm text-gray-600">Test before you commit</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}