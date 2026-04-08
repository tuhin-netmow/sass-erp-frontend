import { cn } from "@/shared/utils/utils";
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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/store/features/auth/authApiService";
import { useNavigate } from "react-router";
import { useAppDispatch } from "@/store/store";
import { setCredentials } from "@/store/features/auth/authSlice";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { setCurrency } from "@/store/currencySlice";
import { sidebarItemLink } from "@/app/config/sidebar.config";
import { getFirstAllowedRoute, flattenPermissions } from "@/shared/utils/permissionUtils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { data: companyProfileSettings } = useGetSettingsInfoQuery();
  const [login] = useLoginMutation();

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);

      const res = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      console.log("Login successful:", res);

      if (res) {
        toast.success(res?.message || "Login successful!");

        const token = res.token;
        const user = res.data?.user;
        const company = res.data?.company;
        const dashboardType = res.data?.dashboardType;
        const redirectTo = res.data?.redirectTo;

        // Store credentials
        dispatch(
          setCredentials({
            user: user,
            token: token,
            company: company,
          })
        );

        dispatch(setCurrency(companyProfileSettings?.data?.currency || "RM"));

        // Also store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        if (company) {
          localStorage.setItem("company", JSON.stringify(company));
        }

        // Handle different dashboard types
        if (dashboardType === 'superadmin') {
          // Super Admin - Navigate to admin dashboard
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 500);
        } else if (dashboardType === 'company' && redirectTo) {
          // Check if we're on the correct subdomain
          const currentHost = window.location.hostname;
          const companySubdomain = company?.subdomain;
          const isOnCorrectSubdomain = currentHost.includes(companySubdomain || '');

          if (isOnCorrectSubdomain) {
            // Already on correct subdomain - navigate to dashboard
            const firstRoute = getFirstAllowedRoute(
              sidebarItemLink,
              flattenPermissions(user?.role?.permissions || [])
            );
            setTimeout(() => {
              navigate(firstRoute);
            }, 500);
          } else {
            // Not on correct subdomain - redirect
            setTimeout(() => {
              const separator = redirectTo.includes('?') ? '&' : '?';
              const finalUrl = `${redirectTo}${separator}token=${encodeURIComponent(token)}&source=login`;
              window.location.href = finalUrl;
            }, 500);
          }
        } else {
          // Fallback - navigate to dashboard
          const firstRoute = getFirstAllowedRoute(
            sidebarItemLink,
            flattenPermissions(user?.role?.permissions || [])
          );
          setTimeout(() => {
            navigate(firstRoute);
          }, 500);
        }
      }
    } catch (error) {
      setIsLoading(false);
      const err = error as {
        data?: { message?: string };
      };

      toast.error(
        err?.data?.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="py-6">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <FieldGroup>
              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="off"
                      disabled={isLoading}
                      {...field}
                    />
                    {form.formState.errors.email?.message && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.email.message}
                      </p>
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
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <a
                        href="/forgot-password"
                        className="text-xs text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pr-10"
                        autoComplete="off"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password?.message && (
                      <p className="text-red-500 text-sm mt-1.5">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Field>
              <div className="text-center text-sm font-medium">
                Don&apos;t have an account?{" "}
                <a href="/register" className="text-blue-600 hover:underline">
                  Sign up
                </a>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
