import { Card, CardContent } from "@/shared/components/ui/card";
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


const featuredModules = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/modules/dashboard",
        description: "Real-time business insights"
    },
    {
        name: "Products",
        icon: Package,
        path: "/modules/products",
        description: "Manage your inventory"
    },
    {
        name: "Sales & Orders",
        icon: ShoppingBag,
        path: "/modules/sales-orders",
        description: "Process orders efficiently"
    },
    {
        name: "Accounting",
        icon: Calculator,
        path: "/modules/accounting",
        description: "Financial management"
    },
    {
        name: "Production",
        icon: Factory,
        path: "/modules/production",
        description: "Manufacturing workflows"
    },
    {
        name: "Customers",
        icon: Users,
        path: "/modules/customers",
        description: "Relationship management"
    },
    {
        name: "Reports",
        icon: BarChart3,
        path: "/modules/reports",
        description: "Business analytics"
    },
    {
        name: "Settings",
        icon: Settings,
        path: "/modules/settings",
        description: "System configuration"
    },
];

export function FeaturedModules() {
    return (
        <section className="py-10 md:py-20" style={{ background: "linear-gradient(180deg, #DEBCFF -26.51%, #FFF 36.75%, #FFF 100%)" }}>
            <div className="container">
                <div className="mb-10 md:mb-12 text-center">
                    <h2 className="mb-4 text-3xl md:text-4xl text-gray-900">
                        Essential Modules at Your Fingertips
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600">
                        Quick access to the most powerful features of our ERP solution
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {featuredModules.map((module, index) => {
                        const Icon = module.icon;
                        return (
                            <Link key={index} to={module.path}>
                                <Card className="group h-full transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer hover:border-[#AD46FF] py-0 bg-black">
                                    <CardContent className="p-6">
                                        <div className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-white text-black transition-all group-hover:bg-[#AD46FF] group-hover:text-white group-hover:scale-110">
                                            <Icon className="size-6" />
                                        </div>
                                        <h3 className="mb-1 font-medium text-white">
                                            {module.name}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {module.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}