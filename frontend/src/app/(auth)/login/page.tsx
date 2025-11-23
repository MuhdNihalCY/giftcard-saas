'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, isAuthenticated, checkAuth, setTokens } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if already authenticated on mount
  useEffect(() => {
    const check = async () => {
      // Check localStorage directly first for immediate check
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            // Import auth to check token expiration
            const { auth: authUtil } = await import('@/lib/auth');
            if (!authUtil.isAccessTokenExpired()) {
              // User is authenticated, redirect immediately
              const redirectUrl = user.role === 'ADMIN' || user.role === 'MERCHANT' 
                ? '/dashboard' 
                : '/';
              window.location.replace(redirectUrl);
              return;
            }
          } catch (e) {
            console.error('Error checking auth:', e);
          }
        }
      }
      
      // Fallback to Zustand check
      checkAuth();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.user) {
        const user = state.user;
        const redirectUrl = user.role === 'ADMIN' || user.role === 'MERCHANT' 
          ? '/dashboard' 
          : '/';
              window.location.replace(redirectUrl);
        return;
      }
      setIsChecking(false);
    };
    check();
  }, [router, checkAuth]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens first - direct localStorage write for immediate effect
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Also update Zustand store
      setTokens(accessToken, refreshToken);
      setUser(user);

      // Verify storage immediately
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (!storedToken || !storedUser) {
          console.error('Storage verification failed - retrying...');
          // Force retry
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          console.log('✅ Tokens stored successfully');
        }
      }

      // Immediate redirect - use window.location for full page reload
      // This ensures a fresh page load with all auth state
      const redirectUrl = user.role === 'ADMIN' || user.role === 'MERCHANT' 
        ? '/dashboard' 
        : '/';
      
      console.log('✅ Login successful! Redirecting to:', redirectUrl);
      console.log('Stored token:', localStorage.getItem('accessToken') ? 'YES' : 'NO');
      console.log('Stored user:', localStorage.getItem('user') ? 'YES' : 'NO');
      
      // Force immediate redirect - don't wait for anything
      window.location.replace(redirectUrl);
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error?.message 
        || err.message 
        || (err.code === 'ECONNREFUSED' ? 'Cannot connect to server. Please make sure the backend is running.' : 'Login failed. Please try again.');
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 page-transition">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-plum-300 mb-2">
            Welcome Back
          </h2>
          <p className="text-navy-200">
            Sign in to your account
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
              <div>
                <Button type="submit" variant="gold" className="w-full text-lg py-3" isLoading={isLoading}>
                  Sign In
                </Button>
              </div>
              <p className="text-center text-sm text-plum-200">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-gold-400 hover:text-gold-300 transition-colors">
                  Create one now
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
