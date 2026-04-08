import { cn } from "@/shared/utils/utils"
import { Button } from "@/shared/components/ui/button"
import { CreditCard } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Link, useNavigate, useLocation } from "react-router"
import { useAuthOnboardMutation } from "@/store/features/auth/authApiService"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import { useGetPublicPlansQuery } from "@/store/features/admin/saasApiService"
import type { SubscriptionPlan } from "@/shared/types/admin"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"

export function TenantOnboardForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const navigate = useNavigate();
    const location = useLocation();
    const [onboard, { isLoading }] = useAuthOnboardMutation();
    const { data: plansData } = useGetPublicPlansQuery();

    const searchParams = new URLSearchParams(location.search);
    const queryPlanName = searchParams.get("plan"); // Plan Name (e.g. "Professional") or ID
    const queryCycle = searchParams.get("cycle"); // Cycle (e.g. "monthly", "yearly")
    const statePlanId = location.state?.planId;
    const stateCycle = location.state?.cycle;

    const selectedPlanId = useMemo(() => {
        // First priority: statePlanId from location.state
        if (statePlanId) return statePlanId;

        // Second priority: find plan from queryPlanName
        if (plansData?.data && queryPlanName) {
            const found = plansData.data.find((p: SubscriptionPlan) =>
                p.name.toLowerCase() === queryPlanName.toLowerCase() ||
                p.id.toString() === queryPlanName
            );
            return found?.id || null;
        }

        return null;
    }, [statePlanId, plansData, queryPlanName]);

    const effectiveCycle = stateCycle || queryCycle;

    const [formData, setFormData] = useState({
        companyName: "",
        adminEmail: "",
        adminPassword: "",
        confirmPassword: ""
    });

    const selectedPlan = plansData?.data?.find((p: SubscriptionPlan) => p.id === selectedPlanId);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.adminPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const result = await onboard({
                companyName: formData.companyName,
                adminEmail: formData.adminEmail,
                adminPassword: formData.adminPassword,
                planId: selectedPlanId || undefined,
                cycle: effectiveCycle || undefined // Don't send null, send undefined instead
            }).unwrap();

            // Backend returns { success: true, message: "...", data: {...} }
            if (result.success && result.data) {
                // If paid plan, redirect to Stripe checkout
                if (result.data.checkoutUrl) {
                    toast.success("Redirecting to secure checkout...");
                    window.location.href = result.data.checkoutUrl;
                } else {
                    // This case handles free plans - auto-complete and log user in
                    if (result.data.token) {
                        toast.success("Workspace activated successfully!");

                        // Use redirectTo URL from API response if available (for multi-tenant subdomain redirect)
                        const redirectTo = (result.data as { redirectTo?: string }).redirectTo;
                        if (redirectTo) {
                            toast.info("Redirecting to your company dashboard...");
                            setTimeout(() => {
                                // For cross-subdomain authentication, redirect to auth/callback on the subdomain
                                // with the token and user data as URL parameters
                                const redirectUrl = new URL(redirectTo);
                                // Replace /dashboard with /auth/callback to handle token storage
                                redirectUrl.pathname = '/auth/callback';
                                redirectUrl.searchParams.set('token', (result.data as { token: string }).token);
                                redirectUrl.searchParams.set('source', 'registration');
                                if (result.data.user) {
                                    redirectUrl.searchParams.set('user', JSON.stringify(result.data.user));
                                }
                                if (result.data.company) {
                                    redirectUrl.searchParams.set('company', JSON.stringify(result.data.company));
                                }
                                window.location.href = redirectUrl.toString();
                            }, 1500);
                        } else {
                            // Fallback: Store credentials locally and navigate to dashboard
                            localStorage.setItem('auth_token', result.data.token);
                            if (result.data.user) {
                                localStorage.setItem('user', JSON.stringify(result.data.user));
                            }
                            if (result.data.company) {
                                localStorage.setItem('company', JSON.stringify(result.data.company));
                            }
                            navigate("/dashboard");
                        }
                    } else {
                        toast.success("Registration received! Please check your email to continue.");
                        navigate("/login");
                    }
                }
            }
        } catch (error: unknown) {
            // Handle RTK Query error structure
            let errorMsg = "Onboarding failed";

            const fetchError = error as FetchBaseQueryError;
            if (fetchError?.data) {
                const data = fetchError.data as { message?: string; error?: { message?: string }; errors?: Array<{ message?: string }> };
                if (data.message) {
                    errorMsg = data.message;
                } else if (data.error?.message) {
                    errorMsg = data.error.message;
                } else if (data.errors?.[0]?.message) {
                    errorMsg = data.errors[0].message;
                }
            }

            toast.error(errorMsg, {
                position: 'top-right',
                duration: 5000,
            });
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Register your Business</CardTitle>
                    <CardDescription>
                        Enter your company and admin details below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                                <Input
                                    id="companyName"
                                    type="text"
                                    placeholder="Acme Global Inc"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="adminEmail">Admin Email</FieldLabel>
                                <Input
                                    id="adminEmail"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={formData.adminEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="adminPassword">Password</FieldLabel>
                                        <Input
                                            id="adminPassword"
                                            type="password"
                                            value={formData.adminPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="confirmPassword">
                                            Confirm
                                        </FieldLabel>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Field>
                                </div>
                            </Field>
                            <Field>
                                <Button type="submit" size="lg" className="w-full py-6 text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200" disabled={isLoading}>
                                    {isLoading ? (
                                        "Provisioning..."
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {Number(selectedPlan?.price || 0) > 0 && <CreditCard className="w-5 h-5" />}
                                            Activate {selectedPlan?.name || 'Starter'} Workspace
                                        </div>
                                    )}
                                </Button>
                                <FieldDescription className="text-center font-bold">
                                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center text-xs">
                By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a>{" "}
                and <a href="#" className="underline">Privacy Policy</a>.
            </FieldDescription>
        </div>
    )
}
