'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/auth?mode=register');
  }, [router]);
  
  return null;
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 page-transition">
        <div className="text-center">
          <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">
            Create Account
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
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
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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

