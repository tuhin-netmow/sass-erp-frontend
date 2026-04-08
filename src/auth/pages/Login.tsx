import { Link, useNavigate } from "react-router";
import { Shield, Building2, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/store/features/auth/authApiService";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/store";
import { setCredentials } from "@/store/features/auth/authSlice";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { setCurrency } from "@/store/currencySlice";
import { sidebarItemLink } from "@/app/config/sidebar.config";
import { flattenPermissions, getFirstAllowedRoute } from "@/shared/utils/permissionUtils";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import type { LoginResponse, User } from "@/shared/types/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

// --- Helper Functions ---
const getSubdomainInfo = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  const isCompanyPortal = parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'lvh';
  const subdomain = isCompanyPortal ? parts[0] : null;
  const formattedName = subdomain ? subdomain.charAt(0).toUpperCase() + subdomain.slice(1) : null;

  return { isCompanyPortal, subdomain, formattedName };
};

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { data: companyProfileSettings } = useGetSettingsInfoQuery();
  const [login] = useLoginMutation();
  const subdomainInfo = getSubdomainInfo();

  const handleLoginSuccess = (res: LoginResponse) => {
    const { token, data } = res;
    const { user, company, dashboardType, redirectTo } = data || {};

    // Store credentials
    dispatch(setCredentials({ user: user as User, token, company }));
    dispatch(setCurrency(companyProfileSettings?.data?.currency || "RM"));

    // Store in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    if (company) localStorage.setItem("company", JSON.stringify(company));

    // Navigation logic
    if (dashboardType === 'superadmin') {
      toast.info("Redirecting to Admin Dashboard...");
      setTimeout(() => navigate("/admin/dashboard"), 500);
    } else if (dashboardType === 'company' && redirectTo) {
      const currentHost = window.location.hostname;
      const isOnCorrectSubdomain = currentHost.includes(company?.subdomain || '');

      if (isOnCorrectSubdomain) {
        const permissions = flattenPermissions((user as User)?.role?.permissions || []);
        const firstRoute = getFirstAllowedRoute(sidebarItemLink, permissions);
        setTimeout(() => navigate(firstRoute), 500);
      } else {
        toast.info(`Redirecting to ${company?.name || "your company"} workspace...`);
        setTimeout(() => {
          const separator = redirectTo.includes('?') ? '&' : '?';
          window.location.href = `${redirectTo}${separator}token=${encodeURIComponent(token)}&source=login`;
        }, 500);
      }
    } else {
      const permissions = flattenPermissions((user as User)?.role?.permissions || []);
      const firstRoute = getFirstAllowedRoute(sidebarItemLink, permissions);
      setTimeout(() => navigate(firstRoute), 500);
    }
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      const res = await login(values).unwrap();
      if (res) {
        toast.success(res?.message || "Login successful!");
        handleLoginSuccess(res);
      }
    } catch (error) {
      setIsLoading(false);
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row relative">
      {/* Branding Section - Left */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#AD46FF] via-[#9333EA] to-[#7C22FE] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
        

          <h2 className="text-4xl md:text-5xl font-bold italic font-merriweather leading-tight mb-6">
            {subdomainInfo.isCompanyPortal ? (
              <>Welcome to<br /><span className="text-purple-200">{subdomainInfo.formattedName}</span></>
            ) : (
              <>One Login.<br /><span className="text-purple-200">All Your Workspaces.</span></>
            )}
          </h2>

          <p className="text-lg text-purple-100 mb-10 max-w-md">
            {subdomainInfo.isCompanyPortal
              ? `Sign in to access your ${subdomainInfo.formattedName} workspace.`
              : "Access all your workspaces from a single login. We'll automatically redirect you to the right place."}
          </p>

          <div className="space-y-6">
            <FeatureItem icon={Shield} title="Secure Access" description="Enterprise-grade security for your data." />
            <FeatureItem
              icon={Lock}
              title={subdomainInfo.isCompanyPortal ? "Isolated Workspace" : "Smart Redirect"}
              description={subdomainInfo.isCompanyPortal ? "Your company's isolated and secure environment." : "Automatically redirected to your workspace."}
            />
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-purple-200/50 text-xs font-bold uppercase tracking-widest">Trusted by 5,000+ businesses worldwide</p>
        </div>
      </div>

      {/* Form Section - Right */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-linear-to-br from-gray-50 to-purple-50/30">
        <div className="w-full max-w-md">
         

          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={'/assets/img/header-logo.png'} alt="Logo" width={50} height={50} className="rounded-xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 font-merriweather italic">Sign In</h1>
          </div>

          {/* Portal Badge */}
          <div className="mb-8 inline-flex items-center gap-3 px-4 py-3 bg-linear-to-r from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200 w-full">
            <Building2 className="w-5 h-5 text-[#AD46FF]" />
            <div className="text-left">
              <p className="text-xs font-bold text-[#AD46FF] uppercase tracking-wider">
                {subdomainInfo.isCompanyPortal ? "Company Portal" : "Universal Login"}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {subdomainInfo.isCompanyPortal
                  ? `${subdomainInfo.subdomain}.${window.location.hostname.split('.').slice(1).join('.')}`
                  : "Access any workspace"}
              </p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold italic font-merriweather text-gray-900 mb-3">
              {subdomainInfo.isCompanyPortal ? "Welcome Back!" : "Welcome!"}
            </h1>
            <p className="text-gray-600">
              {subdomainInfo.isCompanyPortal
                ? `Sign in to access your ${subdomainInfo.formattedName} workspace.`
                : "Enter your email and password. We'll detect your account and redirect you."}
            </p>
          </div>

          {/* Login Card */}
          <Card className="py-6 rounded-3xl border-purple-100 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold">Sign In to Your Account</CardTitle>
              <CardDescription className="text-gray-500">
                {subdomainInfo.isCompanyPortal
                  ? `Enter your credentials to access your ${subdomainInfo.formattedName} account`
                  : "Enter your email and password to continue"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
                <FieldGroup className="space-y-5">
                  <Controller
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-sm font-semibold text-gray-700">Email Address</FieldLabel>
                        <Input
                          type="email"
                          placeholder="you@yourcompany.com"
                          disabled={isLoading}
                          className="h-11 rounded-xl border-gray-200 focus:border-[#AD46FF] focus:ring-[#AD46FF]"
                          {...field}
                        />
                        {form.formState.errors.email?.message && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <Field>
                        <div className="flex items-center justify-between mb-2">
                          <FieldLabel className="text-sm font-semibold text-gray-700">Password</FieldLabel>
                          <Link to="/forgot-password" title="Reset your password"
                            className="text-xs text-[#AD46FF] hover:text-[#9333EA] underline-offset-2 hover:underline font-medium">
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="h-11 pr-10 rounded-xl border-gray-200 focus:border-[#AD46FF] focus:ring-[#AD46FF]"
                            disabled={isLoading}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {form.formState.errors.password?.message && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                        )}
                      </Field>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#AD46FF] hover:bg-[#9333EA] rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="text-center text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Don&apos;t have an account?</span>{" "}
                    <Link to="/register" className="text-[#AD46FF] hover:text-[#9333EA] font-semibold hover:underline">Sign up now</Link>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <TrustBadge title="14-Day Trial" subtitle="Free to try" />
            <TrustBadge title="Secure" subtitle="256-bit SSL" />
            <TrustBadge title="Support" subtitle="24/7 Help" />
          </div>

          {/* System Status */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">All Systems Operational</span>
              </div>
              <Link to="/contact" className="text-xs font-bold text-gray-400 hover:text-[#AD46FF] transition uppercase tracking-wider">Server Status</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

interface FeatureItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureItem = ({ icon: Icon, title, description }: FeatureItemProps) => (
  <div className="flex items-start gap-4">
    <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl"><Icon className="w-5 h-5" /></div>
    <div>
      <p className="font-bold text-lg mb-1">{title}</p>
      <p className="text-purple-100/70 text-sm">{description}</p>
    </div>
  </div>
);

const TrustBadge = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="flex items-center gap-1 mb-1">
      <CheckCircle2 className="w-3 h-3 text-green-500" />
      <p className="text-xs font-bold text-gray-700">{title}</p>
    </div>
    <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>
  </div>
);
