'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { useTenantStore } from '@/stores/tenantStore';

export default function LoginPage() {
  const router = useRouter();
  const { tenant } = useTenantStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant) {
      setError('Tenant configuration not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('[Login] Email login attempt for tenant:', tenant.id);
      await signInWithEmail(email, password, tenant.id);
      console.log('[Login] Email login successful');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[Login] Email login error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('[Login] Google login clicked');
    console.log('[Login] Tenant state:', tenant);

    if (!tenant) {
      const errorMsg = 'Tenant configuration not loaded. Please refresh the page.';
      console.error('[Login] Error:', errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('[Login] Calling signInWithGoogle for tenant:', tenant.id);
      const user = await signInWithGoogle(tenant.id);
      console.log('[Login] Google sign in successful:', user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[Login] Google sign in error:', err);
      console.error('[Login] Error message:', err.message);
      console.error('[Login] Error code:', err.code);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {tenant?.branding.logoUrl && (
            <img
              className="mx-auto h-12 w-auto"
              src={tenant.branding.logoUrl}
              alt={tenant.branding.companyName}
            />
          )}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
            Sign in to {tenant?.branding.companyName || 'your account'}
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleEmailLogin}>
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-100 text-neutral-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full btn btn-outline flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-neutral-600">
            Don't have an account?{' '}
            <a href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
