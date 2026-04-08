import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useAppDispatch } from "@/store/store";
import { setCredentials } from "@/store/features/auth/authSlice";
import { toast } from "sonner";



const handleFinalRedirect = (data: { token: string; user?: Record<string, unknown>; company?: Record<string, unknown>; redirectTo?: string }) => {
    const { token, user, company, redirectTo } = data;
    
    if (redirectTo) {
        toast.info('Redirecting to your dashboard...');
        const redirectUrl = new URL(redirectTo);
        redirectUrl.pathname = '/auth/callback';
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('source', 'registration');
        if (user) redirectUrl.searchParams.set('user', JSON.stringify(user));
        if (company) redirectUrl.searchParams.set('company', JSON.stringify(company));
        
        setTimeout(() => { window.location.href = redirectUrl.toString(); }, 1500);
        return;
    }

    const { subdomain, domain } = company || {};
    if (subdomain && domain) {
        const protocol = window.location.protocol;
        const port = import.meta.env.VITE_FRONTEND_PORT || '5173';
        const baseUrl = `${protocol}//${subdomain}.${import.meta.env.VITE_BASE_DOMAIN || 'lvh.me'}${import.meta.env.DEV ? ':' + port : ''}`;
        const targetUrl = new URL(baseUrl + '/auth/callback');
        
        targetUrl.searchParams.set('token', token);
        targetUrl.searchParams.set('source', 'registration');
        if (user) targetUrl.searchParams.set('user', JSON.stringify(user));
        if (company) targetUrl.searchParams.set('company', JSON.stringify(company));
        
        toast.info(`Redirecting to ${domain}...`);
        setTimeout(() => { window.location.href = targetUrl.toString(); }, 1500);
    } else {
        localStorage.setItem('auth_token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
        if (company) localStorage.setItem('company', JSON.stringify(company));
    }
};

export default function RegistrationSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const token = searchParams.get('token');
    const isProcessed = useRef(false);

    useEffect(() => {
        // Prevent multiple executions due to React StrictMode or re-renders
        if (isProcessed.current) return;
        isProcessed.current = true;

        const completeRegistration = async () => {
            if (!token) {
                setStatus('error');
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/complete-registration`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const result = await response.json();

                if (result.success && result.data) {
                    dispatch(setCredentials({
                        user: result.data.user,
                        token: result.data.token,
                        company: result.data.company
                    }));

                    setStatus('success');
                    toast.success('Welcome aboard! Your account is ready.');
                    handleFinalRedirect(result.data);
                } else {
                    setStatus('error');
                    toast.error(result.message || 'Registration completion failed');
                }
            } catch (error) {
                console.error('Registration completion error:', error);
                setStatus('error');
                toast.error('Failed to complete registration');
            }
        };

        completeRegistration();
    }, [token, dispatch]);

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center space-y-6">
                {status === 'loading' && <LoadingState />}
                {status === 'success' && <SuccessState />}
                {status === 'error' && <ErrorState onRetry={() => navigate('/register')} />}
            </div>
        </div>
    );
}

// --- Sub-components ---

const LoadingState = () => (
    <>
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
        <h1 className="text-2xl font-black text-gray-900">Setting Up Your Workspace</h1>
        <p className="text-gray-600">Please wait while we finalize your account...</p>
    </>
);

const SuccessState = () => (
    <>
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Welcome Aboard! 🎉</h1>
        <p className="text-gray-600 leading-relaxed">
            Your workspace has been successfully created and your subscription is now active.
            <br />
            <strong className="text-blue-600">Redirecting to your company dashboard...</strong>
        </p>
    </>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <>
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Registration Incomplete</h1>
        <p className="text-gray-600">We couldn't verify your registration. Please try again or contact support.</p>
        <Button onClick={onRetry} variant="outline" className="w-full">Back to Registration</Button>
    </>
);
