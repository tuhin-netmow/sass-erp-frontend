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
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { useAppDispatch } from "@/store/store";
import { setCredentials } from "@/store/features/auth/authSlice";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export function UniversalLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [login] = useLoginMutation();

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsRedirecting(true);

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

        console.log('[Login] Dashboard Type:', dashboardType);
        console.log('[Login] RedirectTo:', redirectTo);

        if (!token || !user) {
          toast.error("Invalid response from server. Please try again.");
          setIsRedirecting(false);
          return;
        }

        // Store credentials
        dispatch(
          setCredentials({
            user: user,
            token: token,
            company: company,
          })
        );

        // Also store in localStorage as backup
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        if (company) {
          localStorage.setItem("company", JSON.stringify(company));
        }

        // Handle different dashboard types
        if (dashboardType === 'superadmin') {
          // Super Admin - Navigate to admin dashboard
          toast.info("Redirecting to Admin Dashboard...");
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 500);
        } else if (dashboardType === 'company' && redirectTo) {
          // Company User - Redirect to company subdomain
          const companyName = company?.name;
          toast.info(`Redirecting to ${companyName || "your company"} workspace...`);

          // Pass token in URL for cross-subdomain authentication
          setTimeout(() => {
            const separator = redirectTo.includes('?') ? '&' : '?';
            const finalUrl = `${redirectTo}${separator}token=${encodeURIComponent(token)}&source=login`;
            console.log('[Login] Redirecting to:', finalUrl);
            window.location.href = finalUrl;
          }, 500);
        } else {
          // Fallback - navigate to dashboard
          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
        }
      }
    } catch (error) {
      setIsRedirecting(false);
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
          <CardTitle className="text-xl">🔐 Universal Login</CardTitle>
          <CardDescription>
            Sign in with email and password. We'll detect your account type and redirect you.
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
                      placeholder="you@yourcompany.com"
                      autoComplete="off"
                      disabled={isRedirecting}
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
                      <Link
                        to="/forgot-password"
                        className="text-xs text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pr-10"
                        autoComplete="off"
                        disabled={isRedirecting}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        disabled={isRedirecting}
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
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
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
                <Link to="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Login Options */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-3">Or access via:</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link
            to="/admin/login"
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
