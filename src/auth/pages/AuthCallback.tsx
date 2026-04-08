import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppDispatch } from "@/store/store";
import { setCredentials } from "@/store/features/auth/authSlice";
import Cookies from "js-cookie";

/**
 * Auth Callback Component
 *
 * Handles authentication from URL parameters (used after universal login redirect)
 * When universal login redirects to company subdomain with token in URL,
 * this component extracts the token and sets credentials before proceeding
 */
const clearOldCredentials = () => {
  const hostname = window.location.hostname;
  const isLvhMeDomain = hostname === 'lvh.me' || hostname.endsWith('.lvh.me');
  const domain = isLvhMeDomain ? '.lvh.me' : undefined;

  // Clear cookies
  Cookies.remove('token', { domain, path: '/' });
  Cookies.remove('user', { domain, path: '/' });
  Cookies.remove('company', { domain, path: '/' });

  // Clear localStorage
  ['auth_token', 'token', 'user', 'company', 'reduxState'].forEach(key => localStorage.removeItem(key));
};

const parseJsonParam = (param: string | null, fallbackKey: string) => {
  if (param) {
    try {
      return JSON.parse(param);
    } catch (e) {
      console.error(`[Auth Callback] Error parsing ${fallbackKey} from URL:`, e);
    }
  }
  try {
    return JSON.parse(localStorage.getItem(fallbackKey) || '{}');
  } catch {
    return {};
  }
};

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const isProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions due to React StrictMode or re-renders
    if (isProcessed.current) return;
    isProcessed.current = true;

    const token = searchParams.get('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const user = parseJsonParam(searchParams.get('user'), 'user');
    const company = parseJsonParam(searchParams.get('company'), 'company');

    clearOldCredentials();

    dispatch(setCredentials({ user, token, company }));
    navigate('/dashboard', { replace: true });
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Authenticating...</p>
      </div>
    </div>
  );
}
