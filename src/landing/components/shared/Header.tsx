"use client";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Calculator,
    Factory,
    Users,
    BarChart3,
    Settings
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { useAppSelector } from "@/store/store";
import { selectCurrentUser } from "@/store/features/auth/authSlice";




const featuredModules = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/modules/dashboard" },
    { name: "Products", icon: Package, path: "/modules/products" },
    { name: "Sales & Orders", icon: ShoppingBag, path: "/modules/sales-orders" },
    { name: "Accounting", icon: Calculator, path: "/modules/accounting" },
    { name: "Production", icon: Factory, path: "/modules/production" },
    { name: "Customers", icon: Users, path: "/modules/customers" },
    { name: "Reports", icon: BarChart3, path: "/modules/reports" },
    { name: "Settings", icon: Settings, path: "/modules/settings" },
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
    const user = useAppSelector(selectCurrentUser);
    const { isAuthenticated: isAdminAuthenticated } = useAppSelector((state) => state.admin);
    const isCompanyUserLoggedIn = !!user;
    const isAdminLoggedIn = isAdminAuthenticated;

    const isLoggedIn = isCompanyUserLoggedIn || isAdminLoggedIn;
    const dashboardUrl = isAdminLoggedIn ? "/admin/dashboard" : "/dashboard";

 

    return (
        <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
            <div className="container">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        {/* <Image src={'/assets/img/header-logo.png'} alt="Logo" width={100} height={100} /> */}
                        <img src={'/assets/img/header-logo.png'} alt="Logo" width={100} height={100} />
                    </Link>
        
                    <div className="hidden items-center gap-8 md:flex">
                        <Link to="/" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                            Home
                        </Link>

                        {/* Modules Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setModulesDropdownOpen(true)}
                            onMouseLeave={() => setModulesDropdownOpen(false)}
                        >
                            <button className="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900">
                                Modules <ChevronDown className="size-4" />
                            </button>

                            {modulesDropdownOpen && (
                                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                                    <div className="w-[600px] rounded-lg border bg-white p-6 shadow-xl">
                                        <div className="mb-4">
                                            <h3 className="mb-1 font-medium">Featured Modules</h3>
                                            <p className="text-sm text-gray-600">Quick access to essential features</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {featuredModules.map((module, index) => {
                                                const Icon = module.icon;
                                                return (
                                                    <Link
                                                        key={index}
                                                        to={module.path}
                                                        className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-purple-50"
                                                        onClick={() => setModulesDropdownOpen(false)}
                                                    >
                                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-[#AD46FF]">
                                                            <Icon className="size-5" />
                                                        </div>
                                                        <span className="text-sm font-medium">{module.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-4 border-t pt-4">
                                            <Link
                                                to="/"
                                                className="text-sm text-[#AD46FF] hover:underline"
                                                onClick={() => {
                                                    setTimeout(() => {
                                                        const modulesSection = document.querySelector('#modules-section');
                                                        if (modulesSection) {
                                                            modulesSection.scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                    }, 100);
                                                }}
                                            >
                                                View all 23 modules →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/about" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                            About
                        </Link>
                        <Link to="/pricing" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                            Pricing
                        </Link>
                        <Link to="/contact" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                            Contact
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">

                        {isLoggedIn ? (
                            <Button className="hidden md:inline-flex bg-(--color-brand) hover:bg-[#9333EA] cursor-pointer">
                                <Link to={dashboardUrl} className="cursor-pointer">
                                    Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" className="hidden md:inline-flex cursor-pointer">
                                    <Link to="/login" className="cursor-pointer">
                                        Sign In
                                    </Link>
                                </Button>

                                <Button className="hidden md:inline-flex bg-(--color-brand) hover:bg-[#9333EA] cursor-pointer">
                                    <Link to="/register" className="cursor-pointer">
                                        Get Started
                                    </Link>
                                </Button>
                            </>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="border-t py-4 md:hidden">
                        <div className="flex flex-col space-y-3">
                            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <div className="border-t pt-3">
                                <p className="mb-2 text-sm font-medium text-gray-900">Featured Modules</p>
                                <div className="space-y-2 pl-3">
                                    {featuredModules.map((module, index) => {
                                        const Icon = module.icon;
                                        return (
                                            <Link
                                                key={index}
                                                to={module.path}
                                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Icon className="size-4" />
                                                {module.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                            <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>
                                About
                            </Link>
                            <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>
                                Pricing
                            </Link>
                            <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>
                                Contact
                            </Link>
                            <div className="flex flex-col gap-2 pt-2">
                                {isLoggedIn ? (
                                    <Button className="w-full bg-[#AD46FF] hover:bg-[#9333EA]">
                                        <Link to={dashboardUrl} className="w-full">Dashboard</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="ghost" className="w-full">
                                            <Link to="/login" className="w-full">Sign In</Link>
                                        </Button>
                                        <Button className="w-full bg-[#AD46FF] hover:bg-[#9333EA]">
                                            <Link to="/register" className="w-full">Get Started</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}