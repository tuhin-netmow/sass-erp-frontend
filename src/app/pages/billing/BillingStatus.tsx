import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

export default function BillingStatus() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status");
    const navigate = useNavigate();

    useEffect(() => {
        if (status === "success") {
            toast.success("Subscription activated successfully!");
        } else if (status === "cancel") {
            toast.error("Subscription canceled. You can try again from the billing settings.");
        }
    }, [status]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            {status === "success" ? (
                <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-full inline-block">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Payment Successful!</h1>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Your business workspace has been activated. You now have full access to all features of your selected plan.
                    </p>
                    <Button onClick={() => navigate("/dashboard")} size="lg" className="px-12 rounded-full font-bold">
                        Go to Dashboard
                    </Button>
                </div>
            ) : status === "cancel" ? (
                <div className="space-y-6">
                    <div className="bg-red-50 p-4 rounded-full inline-block">
                        <XCircle className="w-16 h-16 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Payment Canceled</h1>
                    <p className="text-gray-600 max-w-md mx-auto">
                        The payment process was not completed. Don't worry, your account is still active on the free trial.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => navigate("/dashboard")} variant="outline" className="rounded-full font-bold">
                            Maybe Later
                        </Button>
                        <Button onClick={() => navigate("/")} className="rounded-full font-bold">
                            Browse Plans
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="text-gray-500 font-medium">Processing your subscription...</p>
                </div>
            )}
        </div>
    );
}
