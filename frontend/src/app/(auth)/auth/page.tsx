'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import api from '@/lib/api';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import logger from '@/lib/logger';
import { Eye, EyeOff, Sparkles, Shield, Zap, ArrowRight, Gift, Lock, CheckCircle2 } from 'lucide-react';
import { PasswordStrength } from '@/components/PasswordStrength';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  businessName: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, isAuthenticated, checkAuth, setTokens } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginError, setLoginError] = useState<string>('');
  const [registerError, setRegisterError] = useState<string>('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginData, setLoginData] = useState<LoginFormData | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Check URL params for mode
  useEffect(() => {
    const urlMode = searchParams?.get('mode');
    if (urlMode === 'register' || urlMode === 'login') {
      setMode(urlMode);
    }
  }, [searchParams]);

  // Check if already authenticated on mount
  useEffect(() => {
    const check = async () => {
      try {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
          let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          if (!backendUrl && apiUrl) {
            backendUrl = apiUrl.replace('/api/v1', '');
          }
          if (!backendUrl) {
            backendUrl = 'http://localhost:8000';
          }
          
          await Promise.race([
            axios.get(`${backendUrl}/health`, { 
              withCredentials: true,
              timeout: 5000,
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 5000)
            ),
          ]);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Health check failed, continuing anyway', { error });
          }
        }

        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          const userStr = localStorage.getItem('user');
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              const { auth: authUtil } = await import('@/lib/auth');
              if (!authUtil.isAccessTokenExpired()) {
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
        logger.error('Error during auth check', { error });
      } finally {
        setIsChecking(false);
      }
    };
    check();
  }, [router, checkAuth]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const registerPassword = registerForm.watch('password');

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setIsLoginLoading(true);
      setLoginError('');

      const response = await api.post('/auth/login', data);
      
      if (response.data.data.requires2FA) {
        setRequires2FA(true);
        setLoginData(data);
        setIsLoginLoading(false);
        return;
      }

      const { user, accessToken, refreshToken } = response.data.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setTokens(accessToken, refreshToken);
      setUser(user);

      const redirectUrl = user.role === 'ADMIN' || user.role === 'MERCHANT' 
        ? '/dashboard' 
        : '/';
      
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
      setLoginError(errorMessage);
      setIsLoginLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setIsRegisterLoading(true);
      setRegisterError('');

      const response = await api.post('/auth/register', data);
      const { user, accessToken, refreshToken } = response.data.data;

      const { setTokens } = useAuthStore.getState();
      setTokens(accessToken, refreshToken);
      setUser(user);

      if (user.role === 'ADMIN' || user.role === 'MERCHANT') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setRegisterError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const onSubmit2FA = async () => {
    if (!loginData) return;

    try {
      setIsLoginLoading(true);
      setLoginError('');

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

      const { user, accessToken, refreshToken } = response.data.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setTokens(accessToken, refreshToken);
      setUser(user);

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
      setLoginError(errorMessage);
      setIsLoginLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50/30 to-rose-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/20 border-t-cyan-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/20 to-rose-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-float"></div>
        <div className={`absolute bottom-0 right-1/4 w-[32rem] h-[32rem] rounded-full blur-3xl animate-float ${mode === 'register' ? 'bg-indigo-400/10' : 'bg-rose-400/10'}`} style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>

      <div className="max-w-7xl w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-0 items-stretch min-h-[90vh] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50">
          
          {/* Left Side - Visual Panel */}
          <div className={`hidden lg:flex flex-col justify-between p-12 relative overflow-hidden transition-all duration-1000 ${
            mode === 'login' 
              ? 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700' 
              : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500'
          }`}>
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Logo/Branding */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Gift Card SaaS</h1>
                <p className={`text-lg ${mode === 'login' ? 'text-cyan-100' : 'text-indigo-100'}`}>Premium digital gift card platform</p>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center">
                {mode === 'login' ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Secure Access</h3>
                          <p className="text-cyan-100">Bank-level encryption keeps your data safe</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Lightning Fast</h3>
                          <p className="text-cyan-100">Get started in seconds, not minutes</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Trusted Platform</h3>
                          <p className="text-cyan-100">Used by thousands of businesses worldwide</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Start Your Journey</h3>
                          <p className="text-indigo-100">Create beautiful gift cards in minutes</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Premium Features</h3>
                          <p className="text-indigo-100">Access all tools from day one</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Secure by Default</h3>
                          <p className="text-indigo-100">Your data is protected with enterprise security</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Stats */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-white">10K+</div>
                    <div className={`text-sm ${mode === 'login' ? 'text-cyan-100' : 'text-indigo-100'}`}>Active Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">99.9%</div>
                    <div className={`text-sm ${mode === 'login' ? 'text-cyan-100' : 'text-indigo-100'}`}>Uptime</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className={`text-sm ${mode === 'login' ? 'text-cyan-100' : 'text-indigo-100'}`}>Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form Panel */}
          <div className="flex flex-col justify-center p-8 lg:p-12 bg-white dark:bg-slate-800">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-rose-500 mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Gift Card SaaS</h1>
              <p className="text-slate-600 dark:text-slate-400">Premium digital gift card platform</p>
            </div>

            {/* Mode Toggle - Desktop */}
            <div className="hidden lg:flex items-center justify-center mb-8">
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-700 rounded-full p-1.5">
                <button
                  onClick={() => setMode('login')}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-600 text-cyan-600 dark:text-cyan-400 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    mode === 'register'
                      ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Forms Container */}
            <div className="flex-1 flex items-center">
              <div className="w-full max-w-md mx-auto">
                {/* Login Form */}
                <div className={`transition-all duration-500 ease-in-out ${
                  mode === 'login' 
                    ? 'opacity-100 translate-x-0 block' 
                    : 'opacity-0 translate-x-8 absolute pointer-events-none hidden lg:block'
                }`}>
                  {!requires2FA ? (
                    <div className="space-y-6">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                          Welcome Back
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                          Sign in to continue to your account
                        </p>
                      </div>
                      <form className="space-y-5" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                        {loginError && (
                          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-200 px-4 py-3 rounded-r-lg">
                            <p className="text-sm font-medium">{loginError}</p>
                          </div>
                        )}
                        <div className="space-y-4">
                          <Input
                            label="Email address"
                            type="email"
                            autoComplete="email"
                            error={loginForm.formState.errors.email?.message}
                            {...loginForm.register('email')}
                          />
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Password
                            </label>
                            <div className="relative">
                              <input
                                type={showLoginPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                {...loginForm.register('password')}
                                className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors focus:outline-none rounded p-1 flex items-center justify-center"
                                aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                              >
                                {showLoginPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                            {loginForm.formState.errors.password && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {loginForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          variant="primary" 
                          className="w-full text-base py-3 font-semibold group" 
                          isLoading={isLoginLoading}
                        >
                          Sign In
                          <ArrowRight className="ml-2 w-4 h-4 inline-block group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setMode('register')}
                            className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-medium"
                          >
                            Don't have an account? <span className="text-cyan-600 dark:text-cyan-400">Sign up</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-900/30 mb-4">
                          <Lock className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Two-Factor Authentication</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </div>
                      {loginError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-200 px-4 py-3 rounded-r-lg">
                          <p className="text-sm font-medium">{loginError}</p>
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
                          <Button
                            onClick={onSubmit2FA}
                            variant="primary"
                            className="w-full text-base py-3 font-semibold"
                            isLoading={isLoginLoading}
                            disabled={twoFactorToken.length !== 6}
                          >
                            Verify Code
                          </Button>
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => setUseBackupCode(true)}
                              className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
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
                          <Button
                            onClick={onSubmit2FA}
                            variant="primary"
                            className="w-full text-base py-3 font-semibold"
                            isLoading={isLoginLoading}
                            disabled={backupCode.length < 8}
                          >
                            Verify Backup Code
                          </Button>
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setUseBackupCode(false);
                                setBackupCode('');
                              }}
                              className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
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
                            setLoginError('');
                          }}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        >
                          ← Back to login
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Register Form */}
                <div className={`transition-all duration-500 ease-in-out ${
                  mode === 'register' 
                    ? 'opacity-100 translate-x-0 block' 
                    : 'opacity-0 translate-x-8 absolute pointer-events-none hidden lg:block'
                }`}>
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        Create Account
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        Join thousands of businesses already using our platform
                      </p>
                    </div>
                    <form className="space-y-5" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                      {registerError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-200 px-4 py-3 rounded-r-lg">
                          <p className="text-sm font-medium">{registerError}</p>
                        </div>
                      )}
                      <div className="space-y-4">
                        <Input
                          label="Email address"
                          type="email"
                          autoComplete="email"
                          error={registerForm.formState.errors.email?.message}
                          {...registerForm.register('email')}
                        />
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showRegisterPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              {...registerForm.register('password')}
                              className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none rounded p-1 flex items-center justify-center"
                              aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                            >
                              {showRegisterPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {registerForm.formState.errors.password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                          <PasswordStrength password={registerPassword} hasError={!!registerForm.formState.errors.password} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="First name"
                            type="text"
                            autoComplete="given-name"
                            error={registerForm.formState.errors.firstName?.message}
                            {...registerForm.register('firstName')}
                          />
                          <Input
                            label="Last name"
                            type="text"
                            autoComplete="family-name"
                            error={registerForm.formState.errors.lastName?.message}
                            {...registerForm.register('lastName')}
                          />
                        </div>
                        <Input
                          label="Business name (optional)"
                          type="text"
                          error={registerForm.formState.errors.businessName?.message}
                          {...registerForm.register('businessName')}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full text-base py-3 font-semibold group" 
                        isLoading={isRegisterLoading}
                      >
                        Create Account
                        <ArrowRight className="ml-2 w-4 h-4 inline-block group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                        >
                          Already have an account? <span className="text-indigo-600 dark:text-indigo-400">Sign in</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
