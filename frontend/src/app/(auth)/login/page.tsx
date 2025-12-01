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
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import logger from '@/lib/logger';
import { Eye, EyeOff } from 'lucide-react';

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
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginData, setLoginData] = useState<LoginFormData | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if already authenticated on mount
  useEffect(() => {
    const check = async () => {
      try {
      // Fetch CSRF token first by making a GET request
      // This will trigger the backend to generate and set the CSRF token cookie
        // Add timeout to prevent hanging
      try {
        // Use the base health endpoint (not under /api/v1)
          // Get backend URL from environment or use default
          // Check both NEXT_PUBLIC_API_URL and NEXT_PUBLIC_BACKEND_URL
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
          let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          if (!backendUrl && apiUrl) {
            backendUrl = apiUrl.replace('/api/v1', '');
          }
          if (!backendUrl) {
            backendUrl = 'http://localhost:8000';
          }
          
          // Log in development for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log('Health check URL:', `${backendUrl}/health`);
          }
          
          await Promise.race([
            axios.get(`${backendUrl}/health`, { 
              withCredentials: true,
              timeout: 5000, // 5 second timeout
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 5000)
            ),
          ]);
      } catch (error) {
        // Ignore errors - we just need the CSRF token cookie
          // Log in development for debugging
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Health check failed, continuing anyway', { error });
          }
      }

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
            logger.error('Error checking auth', { error: e });
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
      } catch (error) {
        // Ensure we always clear the loading state even on error
        logger.error('Error during auth check', { error });
      } finally {
        // Always clear loading state
      setIsChecking(false);
      }
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
      
      // Check if 2FA is required
      if (response.data.data.requires2FA) {
        setRequires2FA(true);
        setLoginData(data);
        setIsLoading(false);
        return;
      }

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
          logger.warn('Storage verification failed - retrying');
          // Force retry
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          logger.debug('Tokens stored successfully');
        }
      }

      // Immediate redirect - use window.location for full page reload
      // This ensures a fresh page load with all auth state
      const redirectUrl = user.role === 'ADMIN' || user.role === 'MERCHANT' 
        ? '/dashboard' 
        : '/';
      
      logger.info('Login successful', { redirectUrl });
      logger.debug('Token storage verification', {
        hasToken: !!localStorage.getItem('accessToken'),
        hasUser: !!localStorage.getItem('user'),
      });
      
      // Force immediate redirect - don't wait for anything
      window.location.replace(redirectUrl);
    } catch (err: unknown) {
      logger.error('Login error', { error: err });
      const errorMessage = 
        (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data && err.response.data.error && typeof err.response.data.error === 'object' && 'message' in err.response.data.error && typeof err.response.data.error.message === 'string')
          ? err.response.data.error.message
          : (err instanceof Error && err.message)
            ? err.message
            : (err && typeof err === 'object' && 'code' in err && err.code === 'ECONNREFUSED')
              ? 'Cannot connect to server. Please make sure the backend is running.'
              : 'Login failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const onSubmit2FA = async () => {
    if (!loginData) return;

    try {
      setIsLoading(true);
      setError('');

      let response;
      if (useBackupCode) {
        response = await api.post('/auth/2fa/verify-backup', {
          email: loginData.email,
          password: loginData.password,
          backupCode: backupCode,
        });
      } else {
        response = await api.post('/auth/2fa/verify', {
          email: loginData.email,
          password: loginData.password,
          token: twoFactorToken,
        });
      }

      const { user, accessToken, refreshToken, remainingBackupCodes } = response.data.data;

      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setTokens(accessToken, refreshToken);
      setUser(user);

      // Show warning if backup codes are running low
      if (remainingBackupCodes !== undefined && remainingBackupCodes < 3) {
        logger.warn('Low backup codes remaining', { remainingBackupCodes });
      }

      const redirectUrl = user.role === 'ADMIN' || user.role === 'MERCHANT' 
        ? '/dashboard' 
        : '/';
      
      window.location.replace(redirectUrl);
    } catch (err: unknown) {
      logger.error('2FA verification error', { error: err });
      const errorMessage = 
        (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data && err.response.data.error && typeof err.response.data.error === 'object' && 'message' in err.response.data.error && typeof err.response.data.error.message === 'string')
          ? err.response.data.error.message
          : 'Invalid 2FA code. Please try again.';
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
            {!requires2FA ? (
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
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      error={errors.password?.message}
                      {...register('password')}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[3.25rem] text-plum-300 hover:text-gold-400 transition-colors focus:outline-none rounded p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
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
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-plum-300 mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-plum-200">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                {!useBackupCode ? (
                  <>
                    <div>
                      <Input
                        label="Authentication Code"
                        type="text"
                        value={twoFactorToken}
                        onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                        autoFocus
                      />
                    </div>
                    <div>
                      <Button
                        onClick={onSubmit2FA}
                        variant="gold"
                        className="w-full text-lg py-3"
                        isLoading={isLoading}
                        disabled={twoFactorToken.length !== 6}
                      >
                        Verify
                      </Button>
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setUseBackupCode(true)}
                        className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
                      >
                        Use backup code instead
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Input
                        label="Backup Code"
                        type="text"
                        value={backupCode}
                        onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                        placeholder="XXXXXXXX"
                        maxLength={8}
                        className="text-center text-lg tracking-widest font-mono uppercase"
                        autoFocus
                      />
                    </div>
                    <div>
                      <Button
                        onClick={onSubmit2FA}
                        variant="gold"
                        className="w-full text-lg py-3"
                        isLoading={isLoading}
                        disabled={backupCode.length < 8}
                      >
                        Verify Backup Code
                      </Button>
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setUseBackupCode(false);
                          setBackupCode('');
                        }}
                        className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
                      >
                        Use authenticator app instead
                      </button>
                    </div>
                  </>
                )}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRequires2FA(false);
                      setLoginData(null);
                      setTwoFactorToken('');
                      setBackupCode('');
                      setUseBackupCode(false);
                      setError('');
                    }}
                    className="text-sm text-plum-300 hover:text-plum-200 transition-colors"
                  >
                    ← Back to login
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
