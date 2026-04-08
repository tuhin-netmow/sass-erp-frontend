import { Helmet } from 'react-helmet-async';
import CtaSection from "./CtaSection";
import landingPageMetadata from '../config/metadata';




const stats = [
    { value: "10+", label: "Years of Excellence" },
    { value: "5000+", label: "Active Users" },
    { value: "50+", label: "Countries" },
    { value: "99.9%", label: "Uptime" },
];

const coreValues = [
    {
        icon: "/assets/about/icon/focus.svg",
        title: "Customer Focus",
        description:
            "Our customers' success is our success. We listen, adapt, and deliver solutions that truly make a difference.",
    },
    {
        icon: "/assets/about/icon/inovation.svg",
        title: "Innovation",
        description:
            "We continuously innovate to stay ahead of industry trends and provide cutting-edge solutions.",
    },
    {
        icon: "/assets/about/icon/integraty.svg",
        title: "Integrity",
        description:
            "We maintain the highest standards of honesty, transparency, and ethical business practices.",
    },
    {
        icon: "/assets/about/icon/colloboration.svg",
        title: "Collaboration",
        description:
            "We believe in the power of teamwork and building strong partnerships with our customers.",
    },
];

const teamMembers = [
    { initials: "JS", name: "John Smith", role: "CEO & Founder", image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { initials: "SJ", name: "Sarah Johnson", role: "CTO", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { initials: "MC", name: "Michael Chen", role: "VP of Product", image: "https://randomuser.me/api/portraits/men/46.jpg" },
    { initials: "ED", name: "Emily Davis", role: "VP of Customer Success", image: "https://randomuser.me/api/portraits/men/22.jpg" },
];

export default function About() {
    const metadata = landingPageMetadata.about;

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
                <link rel="canonical" href="https://kiraerp.com/about" />
            </Helmet>
            {/* ── Hero ── */}
            <section className="relative py-10 md:py-16 lg:py-28 overflow-hidden bg-linear-to-b from-[#F9F5FF] via-white to-white text-center">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#AD46FF]/10 blur-[100px] rounded-full"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#AD46FF]/5 blur-[100px] rounded-full"></div>

                    {/* Floating Cards (Hidden on mobile for better readability) */}
                    <div className="absolute top-[5%] xl:top-[10%] left-[-80px] xl:left-[-40px] hidden lg:block opacity-90">
                        <img src="/assets/about/left.png" alt="Stats Card" width={280} height={280} className="object-contain" />
                    </div>

                    <div className="absolute top-[10%] right-[-120px] xl:right-[-60px] hidden lg:block opacity-90">
                        <img src="/assets/about/right.png" alt="Dashboard Chart" width={380} height={380} className="object-contain" />
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

                <div className="container relative z-10">
                    <h1 className="text-4xl md:text-5xl lg:text-[60px] leading-tight font-normal text-[#0A0A0A] mb-4 lg:mb-6 font-yeseva text-wrap max-w-4xl mx-auto font-serif">
                        <span className="text-[var(--color-brand)] inline-block">About</span>{" "}
                        <span className="inline-block">Our</span>{" "}
                        <span className="text-[var(--color-brand)] tracking-wide inline-block">ERP</span>{" "}
                        <span className="inline-block">Solution</span>
                    </h1>
                    <p className="text-gray-500 max-w-[600px] mx-auto text-base md:text-lg leading-relaxed">
                        We&apos;re on a mission to empower businesses with comprehensive, intuitive, and powerful
                        ERP software that drives growth and operational excellence.
                    </p>
                </div>
            </section>

            {/* ── Our Story ── */}
            <section className="py-10 lg:py-20 bg-white relative z-10">
                <div className="container">
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                        {/* Left – Story text */}
                        <div className="w-full lg:w-[45%] text-center lg:text-left">
                            <h2 className="text-3xl lg:text-[42px] font-semibold text-[#0A0A0A] mb-6 lg:mb-8">Our Story</h2>
                            <div className="space-y-4 lg:space-y-6 text-gray-500 text-[15px] lg:text-[16px] leading-[1.8]">
                                <p>
                                    Founded in 2025, our ERP solution was born from a simple observation:
                                    businesses needed integrated software that was both powerful and easy to use.
                                </p>
                                <p>
                                    Over the years, we&apos;ve grown from a small startup to a trusted partner for
                                    thousands of businesses worldwide. Our platform has evolved to include 23
                                    comprehensive modules that address every aspect of business operations.
                                </p>
                                <p>
                                    Today, we continue to innovate and expand our capabilities, driven by
                                    feedback from our customers and our commitment to excellence.
                                </p>
                            </div>
                        </div>

                        {/* Right – Stats grid */}
                        <div className="w-full lg:w-[55%]">
                            <div className="grid grid-cols-2 gap-4 md:gap-5">
                                {stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="flex flex-col items-center justify-center rounded-[20px] bg-[#0F172B] py-8 lg:py-10 px-4 lg:px-6 shadow-xl text-center"
                                    >
                                        <span className="text-3xl lg:text-[46px] font-bold bg-linear-to-r from-[#CC90FB] to-[#AD46FF] bg-clip-text text-transparent mb-1 lg:mb-2">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs md:text-[15px] text-gray-400">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Our Core Values ── */}
            <section className="py-10 lg:py-20 bg-[#0F172B]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 lg:mb-16">
                        <h2 className="text-3xl lg:text-[40px] font-semibold text-white mb-2 lg:mb-3">Our Core Values</h2>
                        <p className="text-gray-400 text-base lg:text-lg">The principles that guide everything we do</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coreValues.map((value) => {
                            return (
                                <div
                                    key={value.title}
                                    className="rounded-[20px] bg-white p-6 lg:p-8 shadow-md group hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    <div className="flex size-12 lg:size-14 items-center justify-center group-hover:bg-[var(--color-brand)] rounded-full bg-[#0F172B] mb-5 lg:mb-6 transition-all duration-300 group-hover:scale-105">
                                        <img src={value.icon} alt={value.title} width={26} height={26} className="w-6 h-6 lg:w-[26px] lg:h-[26px]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2 lg:mb-3">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm lg:text-[15px] leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Our Leadership Team ── */}
            <section className="py-10 lg:py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 lg:mb-16">
                        <h2 className="text-3xl lg:text-[40px] font-semibold text-[#0A0A0A] mb-2 lg:mb-3">Our Leadership Team</h2>
                        <p className="text-gray-500 text-base lg:text-lg">Meet the experts driving innovation and excellence</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {teamMembers.map((member) => (
                            <div
                                key={member.name}
                                className="flex flex-col items-center rounded-[20px] bg-white p-8 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]"
                            >
                                {/* Avatar */}
                                <div className="size-[100px] mb-6 relative">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover rounded-full shadow-sm"
                                        width={100}
                                        height={100}

                                    />
                                    <div className="hidden absolute inset-0 items-center justify-center rounded-full bg-[#F5F3FF] text-[#AD46FF] font-semibold text-2xl">
                                        {member.initials}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-[#0A0A0A] mb-1">{member.name}</h3>
                                <p className="text-gray-500 text-sm">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <CtaSection />
        </>
    );
}




