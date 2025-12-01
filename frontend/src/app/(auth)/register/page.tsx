'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { PasswordStrength } from '@/components/PasswordStrength';

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

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // Validate on change for better UX
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.post('/auth/register', data);
      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens and user
      const { setTokens } = useAuthStore.getState();
      setTokens(accessToken, refreshToken);
      setUser(user);

      // Force redirect using window.location for reliability
      if (user.role === 'ADMIN' || user.role === 'MERCHANT') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 page-transition">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-plum-300 mb-2">
            Create Account
          </h2>
          <p className="text-navy-200">
            Create your account and get started
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

                <div>
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <PasswordStrength password={password} hasError={!!errors.password} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First name"
                    type="text"
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                  <Input
                    label="Last name"
                    type="text"
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>
                <Input
                  label="Business name (optional)"
                  type="text"
                  error={errors.businessName?.message}
                  {...register('businessName')}
                />
              </div>
              <div>
                <Button type="submit" variant="gold" className="w-full text-lg py-3" isLoading={isLoading}>
                  Create Account
                </Button>
              </div>
              <p className="text-center text-sm text-plum-200">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-gold-400 hover:text-gold-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

