import { useAppSelector } from "@/store/store";
import { Navigate, Outlet, useSearchParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/store";
import { setCredentials } from "@/store/features/auth/authSlice";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessingUrlToken, setIsProcessingUrlToken] = useState(false);
  const [hasProcessedUrlToken, setHasProcessedUrlToken] = useState(false);

  // Get URL parameters
  const urlToken = searchParams.get('token');
  const source = searchParams.get('source');
  const currentPath = window.location.pathname;

  console.log('[ProtectedRoute] ===== Auth Check =====');
  console.log('[ProtectedRoute] Current path:', currentPath);
  console.log('[ProtectedRoute] Current host:', window.location.hostname);
  console.log('[ProtectedRoute] URL params:', { urlToken: !!urlToken, source });
  console.log('[ProtectedRoute] All cookies:', document.cookie);

  // Process URL token on first render
  useEffect(() => {
    if (hasProcessedUrlToken) return;

    console.log('[ProtectedRoute] Processing URL params...');
    console.log('[ProtectedRoute] URL Token:', urlToken ? 'Found' : 'Not found');
    console.log('[ProtectedRoute] Source:', source);

    // Check if this is a login redirect (from unified login)
    if ((source === 'login' || source === 'universal-login') && urlToken) {
      console.log('[ProtectedRoute] 🔐 Unified login redirect detected, source:', source);
      setHasProcessedUrlToken(true);

      // 🌐 IMPORTANT: localStorage is NOT shared across subdomains
      // We need to read from cookies (which ARE shared) or use the URL token
      // Cookies should have been set by setCredentials with .lvh.me domain

      // Small delay to ensure cookies are readable after page load
      setTimeout(() => {
        const cookieUser = Cookies.get('user');
        const cookieToken = Cookies.get('token');
        const cookieCompany = Cookies.get('company');

        console.log('[ProtectedRoute] Cookies - user:', !!cookieUser, 'token:', !!cookieToken, 'company:', !!cookieCompany);

        // Also try localStorage as fallback (might work in some browsers)
        const localStorageUser = localStorage.getItem('user');
        const localStorageCompany = localStorage.getItem('company');

        console.log('[ProtectedRoute] localStorage - user:', !!localStorageUser, 'company:', !!localStorageCompany);

        // Try to get user from cookies first, then localStorage
        const userStr = cookieUser || localStorageUser;
        const companyStr = cookieCompany || localStorageCompany;

        if (userStr) {
          try {
            setIsProcessingUrlToken(true);
            const parsedUser = JSON.parse(userStr);
            const parsedCompany = companyStr ? JSON.parse(companyStr) : null;

            console.log('[ProtectedRoute] ✅ Parsed user:', parsedUser.email);
            console.log('[ProtectedRoute] ✅ Parsed company:', parsedCompany?.name);

            // Set credentials in Redux with URL token
            dispatch(
              setCredentials({
                user: parsedUser,
                token: urlToken,
                company: parsedCompany,
              })
            );

            console.log('[ProtectedRoute] ✅ Dispatched setCredentials');

            // 🚨 IMPORTANT: Manually save Redux state to localStorage BEFORE page reload
            // This ensures the state persists across the reload since store.subscribe()
            // might not have fired yet
            const currentState = {
              auth: {
                user: parsedUser,
                token: urlToken,
                company: parsedCompany,
              },
            };
            localStorage.setItem('reduxState', JSON.stringify(currentState));
            console.log('[ProtectedRoute] ✅ Manually saved reduxState to localStorage');

            // Clean URL and reload
            const cleanUrl = currentPath;
            console.log('[ProtectedRoute] Cleaning URL and reloading to:', cleanUrl);

            // Remove search params by reloading clean URL
            window.location.replace(cleanUrl);
            return; // Stop here, the reload will re-run this component
          } catch (e) {
            console.error('[ProtectedRoute] ❌ Error parsing credentials:', e);
            setIsProcessingUrlToken(false);
            navigate('/login', { replace: true });
          }
        } else {
          console.log('[ProtectedRoute] ❌ No user in cookies or localStorage, redirecting to login');
          navigate('/login', { replace: true });
        }
      }, 100); // Small delay to ensure cookies are readable
      return; // Return early while setTimeout runs
    } else if (urlToken) {
      // Token in URL but not from universal login - treat as suspicious
      console.log('[ProtectedRoute] ⚠️  Token in URL but not from universal login, ignoring');
      setHasProcessedUrlToken(true);
    } else {
      setHasProcessedUrlToken(true);
    }
  }, [urlToken, source, currentPath, hasProcessedUrlToken, dispatch, navigate]);

  // Get current auth state
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  console.log('[ProtectedRoute] Current State - User:', !!user, 'Token:', !!token, 'Processing:', isProcessingUrlToken);

  // Show loading while processing URL token
  if (isProcessingUrlToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!user || !token) {
    console.log('[ProtectedRoute] ❌ No credentials, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Check role
  if (!user.role && !user.roleId) {
    console.log('[ProtectedRoute] ❌ No role found, redirecting to /unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('[ProtectedRoute] ✅ Access granted to', currentPath);
  return <>{children || <Outlet />}</>;
}
