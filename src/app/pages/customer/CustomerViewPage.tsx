
import { useParams, Link } from "react-router";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
    Dialog,
    DialogContent,
} from "@/shared/components/ui/dialog";
import {
    ShoppingCart,
    Pencil,
    Mail,
    Phone,
    MapPin,
    Building2,
    CreditCard,
    Wallet,
    FileText,
    Calendar,
    Star,
    Hash,
    MoveLeft,
    MoveRight,
    Car
} from "lucide-react";
import { useGetCustomerByIdQuery } from "@/store/features/app/customers/customersApi";
import { useAppSelector } from "@/store/store";
import { BackButton } from "@/shared/components/common/BackButton";
import { MapEmbed } from "@/shared/components/common/MapEmbed";
// import { ACTIONS, MODULES } from "@/app/config/permissions";
// import { perm, usePermissions } from "@/shared/hooks/usePermissions";

export default function CustomerViewPage() {
    const { customerId } = useParams();
    const currency = useAppSelector((state) => state.currency.value);
    const [previewData, setPreviewData] = useState<{
        images: string[];
        index: number;
    } | null>(null);

    // permissions
    // const { hasPermission, isAdmin } = usePermissions();
    // const canViewCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.VIEW));
    // const canCreateCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.CREATE));
    // const canEditCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.UPDATE));
    // const canDeleteCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.DELETE));

    const { data, isLoading, error } = useGetCustomerByIdQuery(customerId!);
    const customer = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p>Loading customer details...</p>
                </div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
                <div className="bg-destructive/10 p-4 rounded-full text-destructive">
                    <FileText size={48} />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Customer Not Found</h3>
                    <p className="text-muted-foreground">The customer you are looking for does not exist or an error occurred.</p>
                </div>
                <BackButton />
            </div>
        );
    }

    const fullAddress = [
        customer.address,
        customer.city,
        customer.state,
        customer.postalCode,
        customer.country
    ].filter(Boolean).join(", ");

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50 duration-500 pb-20">
            {/* TOP NAVIGATION / HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BackButton />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{customer.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Badge variant="outline" className="text-xs font-normal">ID: {customer._id}</Badge>
                            <span className="text-xs">•</span>
                            <span className="text-sm flex items-center gap-1">
                                <Building2 size={12} /> {customer.customerType === "business" ? "Business Customer" : "Individual Customer"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link to={`/dashboard/sales/orders/create?customerId=${customer.publicId || customer._id}`}>
                        <Button className="shadow-sm">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Create Order
                        </Button>
                    </Link>
                    <Link to={`/dashboard/customers/${customer.publicId || customer._id}/edit`}>
                        <Button variant="outline" className="shadow-sm">
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: IDENTIFICATION & CONTACT */}
                <div className="lg:col-span-4 space-y-6">
                    {/* PROFILE CARD */}
                    <Card className="overflow-hidden shadow-md border-border/60">
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <CardContent className="pt-0 relative px-6 pb-6">
                            <div className="flex justify-between items-end -mt-10 mb-4">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-xl font-bold bg-slate-100 text-slate-700">
                                        {getInitials(customer.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <Badge
                                    className={`mb-2 px-3 py-1 ${customer.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                    variant="secondary"
                                >
                                    {customer.isActive ? "Active Status" : "Inactive"}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold">{customer.name}</h2>
                                    {customer.company && (
                                        <p className="text-primary font-medium">{customer.company}</p>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                                        <div className="bg-muted p-2 rounded-md group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Mail size={16} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-medium uppercase text-muted-foreground/70 mb-0.5">Email Address</p>
                                            <p className="truncate font-medium">{customer.email || "—"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                                        <div className="bg-muted p-2 rounded-md group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase text-muted-foreground/70 mb-0.5">Phone Number</p>
                                            <p className="font-medium">{customer.phone || "—"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                                        <div className="bg-muted p-2 rounded-md group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase text-muted-foreground/70 mb-0.5">Address</p>
                                            <p className="font-medium leading-relaxed max-w-[250px]">{fullAddress || "—"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* LOCATION / MAP */}
                    {(customer.latitude && customer.longitude || fullAddress) && (
                        <Card className="shadow-sm border-border/60 overflow-hidden ">
                            <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/20">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-500" /> Location / Map
                                </CardTitle>
                                <a
                                    href={`https://www.waze.com/ul?ll=${customer.latitude},${customer.longitude}&navigate=yes`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-[#33CCFF] text-white rounded-md text-xs font-bold hover:bg-[#2EB8E6] transition-colors flex items-center gap-1"
                                >
                                    <Car size={14} /> Waze
                                </a>
                            </CardHeader>
                            <CardContent className="p-0 border-t">
                                <div className="w-full h-[300px]">
                                    <MapEmbed
                                        location={
                                            (customer.latitude && customer.longitude)
                                                ? `${customer.latitude},${customer.longitude}`
                                                : fullAddress
                                        }
                                        height={300}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* RIGHT COLUMN: FINANCIALS & DETAILS */}
                <div className="lg:col-span-8 space-y-6">

                    {/* FINANCIAL OVERVIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="shadow-sm border-l-4 border-l-blue-500 border-t-0 border-b-0 border-r-0 ring-1 ring-border/60">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Outstanding Balance</p>
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {currency} {Number(customer.dueAmount ?? customer.outstandingBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <Wallet size={24} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-l-4 border-l-emerald-500 border-t-0 border-b-0 border-r-0 ring-1 ring-border/60">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Credit Limit</p>
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {currency} {Number(customer.creditLimit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                    <CreditCard size={24} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ADDITIONAL DETAILS TABLE */}
                    <Card className="shadow-sm border-border/60 overflow-hidden">
                        <CardHeader className="border-b-1 bg-muted/20 py-4 gap-0">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Additional Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">

                                <div className="space-y-1">
                                    <dt className="text-sm font-medium text-muted-foreground">Tax / VAT ID</dt>
                                    <dd className="text-base font-medium flex items-center gap-2">
                                        <Hash size={14} className="text-muted-foreground" />
                                        {customer.taxId || "Not Provided"}
                                    </dd>
                                </div>

                                <div className="space-y-1">
                                    <dt className="text-sm font-medium text-muted-foreground">Company Name</dt>
                                    <dd className="text-base font-medium flex items-center gap-2">
                                        <Building2 size={14} className="text-muted-foreground" />
                                        {customer.company || "Not Provided"}
                                    </dd>
                                </div>

                                <div className="space-y-1">
                                    <dt className="text-sm font-medium text-muted-foreground">Customer Since</dt>
                                    <dd className="text-base font-medium flex items-center gap-2">
                                        <Calendar size={14} className="text-muted-foreground" />
                                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "Unknown"}
                                    </dd>
                                </div>

                                <div className="space-y-1">
                                    <dt className="text-sm font-medium text-muted-foreground">Preferred Currency</dt>
                                    <dd className="text-base font-medium">{currency} (Default)</dd>
                                </div>

                            </dl>
                        </CardContent>
                    </Card>

                    {/* NOTES SECTION */}
                    {customer.notes && (
                        <Card className="shadow-sm border-border/60 bg-amber-50/50 dark:bg-amber-900/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-500">
                                    <Star size={16} className="fill-amber-600 text-amber-600 dark:text-amber-500" />
                                    Important Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {customer.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* CUSTOMER GALLERY */}
                    <Card className="shadow-sm border-border/60 overflow-hidden">
                        <CardHeader className="border-b-1 bg-muted/20 py-4 gap-0">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-muted-foreground" />
                                <CardTitle className="text-lg">Customer Gallery</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {customer.galleryItems && customer.galleryItems.length > 0 ? (
                                    customer.galleryItems.map((url: string, i: number) => (
                                        <div
                                            key={url}
                                            className="aspect-square rounded-xl overflow-hidden border bg-muted cursor-pointer hover:opacity-80 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                                            onClick={() =>
                                                setPreviewData({
                                                    images: customer.galleryItems || [],
                                                    index: i,
                                                })
                                            }
                                        >
                                            <img
                                                src={url}
                                                alt={`Gallery ${i}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="col-span-full text-sm text-muted-foreground text-center py-8 bg-muted/10 rounded-xl border border-dashed">
                                        No gallery images available
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Lightbox Modal */}
            <Dialog
                open={!!previewData}
                onOpenChange={(open) => !open && setPreviewData(null)}
            >
                <DialogContent className="max-w-3xl p-5 overflow-hidden bg-white border-none shadow-2xl">
                    <div className="relative flex items-center justify-center min-h-[50vh]">
                        {previewData && (
                            <>
                                <img
                                    src={previewData.images[previewData.index]}
                                    alt="Customer Preview"
                                    className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-sm"
                                />

                                {/* Left Arrow (Previous) */}
                                {previewData.images.length > 1 && (
                                    <button
                                        onClick={() =>
                                            setPreviewData((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        index:
                                                            prev.index === 0
                                                                ? prev.images.length - 1
                                                                : prev.index - 1,
                                                    }
                                                    : null
                                            )
                                        }
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110 active:scale-95"
                                    >
                                        <MoveLeft className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Right Arrow (Next) */}
                                {previewData.images.length > 1 && (
                                    <button
                                        onClick={() =>
                                            setPreviewData((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        index:
                                                            prev.index === prev.images.length - 1
                                                                ? 0
                                                                : prev.index + 1,
                                                    }
                                                    : null
                                            )
                                        }
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-110 active:scale-95"
                                    >
                                        <MoveRight className="w-5 h-5" />
                                    </button>
                                )}

                                {/* Counter */}
                                {previewData.images.length > 1 && (
                                    <div className="absolute bottom-2 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium">
                                        {previewData.index + 1} / {previewData.images.length}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
