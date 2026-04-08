"use client";

import React, { useState } from "react";
import { Helmet } from 'react-helmet-async';

import { ArrowRight, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Link } from "react-router";
import { Textarea } from "@/shared/components/ui/textarea";
import landingPageMetadata from '../config/metadata';


export default function ContactPage() {
    const metadata = landingPageMetadata.contact;
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        phone: "",
        subject: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Prepare payload
        const payload = {
            ...formData,
            submittedAt: new Date().toISOString(),
        };

        console.log("Contact Form Payload Ready:", payload);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        alert("Message sent! Check console for payload.");
        setIsSubmitting(false);
    };

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
                <link rel="canonical" href="https://kiraerp.com/contact" />
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

                <div className="container relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-[60px] leading-tight font-normal text-[#0A0A0A] mb-2 font-yeseva max-w-4xl mx-auto text-wrap font-serif">
                        <span className="text-[var(--color-brand)] inline-block">Get</span>{" "}
                        <span className="inline-block">in</span>{" "}
                        <span className="text-[var(--color-brand)] inline-block">Touch</span>
                    </h1>
                    <p className="text-gray-500 max-w-[600px] mx-auto text-base md:text-lg leading-relaxed">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>
            {/* Contact Form & Info */}
            <section className="py-10 md:py-20">
                <div className="container">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Contact Form */}
                        <div>
                            <h2 className="mb-6 text-2xl font-medium">
                                Send us a Message
                            </h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="John"
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Doe"
                                            required
                                        />
                                    </Field>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="company">Company Name</FieldLabel>
                                    <Input
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        placeholder="Your Company"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="subject">Subject</FieldLabel>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="message">Message</FieldLabel>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us more about your inquiry..."
                                        rows={6}
                                        required
                                    />
                                </Field>

                                <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                                    {isSubmitting ? "Sending..." : "Send Message"} <Send className="size-4" />
                                </Button>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="mb-2 text-2xl font-medium">
                                    Contact Information
                                </h2>
                                <p className="mb-4 text-gray-600">
                                    Reach out to us through any of these channels. We're here to help!
                                </p>
                            </div>

                            <div className="space-y-6">
                                <Card className="py-0">
                                    <CardContent className="flex items-start gap-4 p-6">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                                            <Mail className="size-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-medium">Email</h3>
                                            <p className="text-sm text-gray-600">
                                                Send us an email anytime
                                            </p>
                                            <a href="mailto:support@erpsolution.com" className="text-[var(--color-brand)] hover:underline">
                                                support@erpsolution.com
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="py-0">
                                    <CardContent className="flex items-start gap-4 p-6">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                                            <Phone className="size-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-medium">Phone</h3>
                                            <p className="text-sm text-gray-600">
                                                Call us during business hours
                                            </p>
                                            <a href="tel:+15551234567" className="text-[var(--color-brand)] hover:underline">
                                                +1 (555) 123-4567
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="py-0">
                                    <CardContent className="flex items-start gap-4 p-6">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                                            <MapPin className="size-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-medium">Office</h3>
                                            <p className="text-sm text-gray-600">
                                                Visit our headquarters
                                            </p>
                                            <p className="text-gray-700">
                                                123 Business Street<br />
                                                San Francisco, CA 94105<br />
                                                United States
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="py-0">
                                    <CardContent className="flex items-start gap-4 p-6">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                                            <Clock className="size-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-medium">Business Hours</h3>
                                            <p className="text-sm text-gray-600">
                                                We're available
                                            </p>
                                            <p className="text-gray-700">
                                                Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                                                Saturday: 10:00 AM - 4:00 PM PST<br />
                                                Sunday: Closed
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-10 md:py-20 bg-gray-50">
                <div className="mx-auto max-w-7xl">
                    <h2 className="mb-8 text-center text-2xl font-medium">
                        Find Us on the Map
                    </h2>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 shadow-inner">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0633842323!2d-122.3952445!3d37.7881775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858079d92e5977%3A0xc3f1a0e7a2322304!2s123+Business+St%2C+San+Francisco%2C+CA+94105%2C+USA!5e0!3m2!1sen!2sus!4v1710750000000!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Office Location"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-10 md:py-16 text-white" style={{ backgroundImage: "url('/assets/img/bg-cta-contact.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
                <div className="container text-center">
                    <h2 className="mb-4 text-2xl md:text-3xl">
                        Ready to Join Us?
                    </h2>
                    <p className="mb-6 text-blue-100">
                        Discover how our ERP solution can transform your business operations.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button size="lg" variant="secondary" className="rounded-md bg-white text-[#1a1f36] hover:bg-slate-100 px-6 h-10 text-[14px] font-medium transition-all shadow-sm cursor-pointer">
                            <Link to="/contact" className="flex items-center gap-2">
                                Contact Us
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-md border border-white/30 text-white hover:bg-white/10 hover:text-white px-6 h-10 text-[14px] font-medium transition-all bg-transparent cursor-pointer">
                            <Link to="/pricing" className="flex items-center gap-2 color">
                                View Pricing
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}