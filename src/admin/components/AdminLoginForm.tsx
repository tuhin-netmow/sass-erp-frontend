import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminLoginMutation } from '@/store/features/admin/adminApiService';
import { useAppDispatch } from '@/store/store';
import { setAdmin } from '@/store/features/admin/adminSlice';

export function AdminLoginForm({ className, ...props }: React.ComponentProps<'div'>) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [adminLogin, { isLoading }] = useAdminLoginMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await adminLogin(formData).unwrap();

            toast.success(`Welcome back, ${result.data.name}!`);

            // Store admin token and user info
            localStorage.setItem('admin_token', result.token);
            localStorage.setItem('admin_user', JSON.stringify(result.data));

            // Set admin in Redux state
            dispatch(setAdmin(result.data));

            // Navigate to admin dashboard
            navigate('/admin/dashboard');
        } catch (error: any) {
            const errorMsg = error?.data?.message || error?.message || 'Login failed';
            toast.error(errorMsg);
        }
    };

    return (
        <div className={className} {...props}>
            <Card className="py-6 border-purple-200/50 shadow-2xl shadow-purple-900/20 bg-white/95 backdrop-blur">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-[#AD46FF] to-[#9333EA] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-merriweather font-bold text-gray-900">Admin Portal</CardTitle>
                    <CardDescription className="text-gray-600">
                        Sign in to manage your SaaS platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@kiraerp.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    autoComplete="email"
                                    className="border-purple-200 focus:border-[#AD46FF] focus:ring-[#AD46FF]"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <Link to="/admin/forgot-password" className="text-sm font-medium text-[#AD46FF] hover:text-[#9333EA] transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        autoComplete="current-password"
                                        className="pr-10 border-purple-200 focus:border-[#AD46FF] focus:ring-[#AD46FF]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#AD46FF] focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-gradient-to-r from-[#AD46FF] to-[#9333EA] hover:from-[#9333EA] hover:to-[#7E22CE] text-white font-semibold shadow-lg shadow-purple-500/30" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Sign In to Admin Portal'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
