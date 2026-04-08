import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {  Mail, Lock } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: z.infer<typeof ForgotPasswordSchema>) => {
    console.log("Reset link sent to:", data.email);
    // Perform your API call here...
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-purple-50/30 flex flex-col">
    
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-linear-to-br from-purple-100 to-purple-50 p-4 rounded-2xl border border-purple-200">
              <Lock className="w-8 h-8 text-[#AD46FF]" />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold italic font-merriweather text-gray-900 mb-3">
                Forgot Password?
              </h1>
              <p className="text-gray-600">
                Enter your email address, and we'll send you a link to reset your password.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* EMAIL FIELD */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            placeholder="you@yourcompany.com"
                            className="h-11 pl-10 rounded-xl border-gray-200 focus:border-[#AD46FF] focus:ring-[#AD46FF]"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-[#AD46FF] hover:bg-[#9333EA] rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-200"
                >
                  Send Reset Link
                </Button>
              </form>
            </Form>

            {/* FOOTER LINKS */}
            <div className="mt-6 text-center text-sm pt-6 border-t border-gray-100">
              <span className="text-gray-500">Remember your password?</span>{" "}
              <Link to="/login" className="font-semibold text-[#AD46FF] hover:text-[#9333EA] hover:underline">
                Sign In here
              </Link>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-full border border-gray-200">
              <Mail className="w-4 h-4 text-[#AD46FF]" />
              <span className="font-medium">Quick email recovery</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-gray-100 bg-white">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Trusted by 5,000+ businesses worldwide
        </p>
      </footer>
    </div>
  );
}
