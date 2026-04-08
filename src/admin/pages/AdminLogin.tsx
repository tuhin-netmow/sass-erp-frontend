import { AdminLoginForm } from '@/admin/components/AdminLoginForm';
import { Link, useNavigate } from 'react-router';

export default function AdminLogin() {
    const navigate = useNavigate();

    // Check if already logged in
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');

    if (adminToken && adminUser) {
        navigate('/admin/dashboard');
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundImage: "url('/assets/img/hero-bg.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-purple-950/90"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 text-xl font-bold text-white hover:text-purple-200 transition-colors">
                        <div className="bg-[#AD46FF] p-3 rounded-xl shadow-lg shadow-purple-500/30">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2-2m0 0V9a2 2 0 012-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-4a2 2 0 01-2-2v-5a2 2 0 012-2H8a2 2 0 012-2V9a2 2 0 012-2m0 0V6a2 2 0 012-2V4a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2" />
                            </svg>
                        </div>
                        <span className="text-3xl font-black tracking-tight font-merriweather">KIRA<span className="text-[#AD46FF]">ERP</span></span>
                    </Link>
                </div>

                {/* Login Form */}
                <AdminLoginForm />
            </div>
        </div>
    );
}
