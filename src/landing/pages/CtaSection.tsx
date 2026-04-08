
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";


interface CtaSectionProps {
    title?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    backgroundImage?: string;
}

const CtaSection = ({
    title = "Ready to Join Us?",
    description = "Discover how our ERP solution can transform your business operations.",
    primaryButtonText = "Contact Us",
    primaryButtonLink = "/contact",
    secondaryButtonText = "View Pricing",
    secondaryButtonLink = "/pricing",
    backgroundImage = "/assets/module/cta-bg.jpeg",
}: CtaSectionProps) => {
    return (
        <section
            className="relative py-10 md:py-20 overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
        >
            <div className="container text-center relative z-10 flex flex-col items-center">
                <h2 className="text-[32px] md:text-[36px] font-medium text-white mb-4 tracking-tight">
                    {title}
                </h2>
                <p className="text-slate-100 text-[15px] mb-8 font-light">
                    {description}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-4">
                    <Link to={primaryButtonLink} className="cursor-pointer">
                        <Button className="rounded-md bg-white text-[#1a1f36] hover:bg-slate-100 px-6 h-10 text-[14px] font-medium transition-all shadow-sm cursor-pointer">
                            {primaryButtonText}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                    {secondaryButtonText && (
                        <Link to={secondaryButtonLink} className="cursor-pointer">
                            <Button
                                variant="outline"
                                className="rounded-md border border-white/30 text-white hover:bg-white/10 hover:text-white px-6 h-10 text-[14px] font-medium transition-all bg-transparent cursor-pointer"
                            >
                                {secondaryButtonText}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CtaSection;
