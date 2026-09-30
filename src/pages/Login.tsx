import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { AuthLoginBrandPanel } from '../components/auth/AuthLoginBrandPanel';
import { getApiErrorMessage } from '../utils/apiMessage';

export const Login = () => {
  const { login, user, isAuthenticated, isAuthReady } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthReady && isAuthenticated && user) {
    const path = user.role === 'facility_admin' ? '/facility-admin' : `/${user.role}`;
    return <Navigate to={path} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password);
      const path = user.role === 'facility_admin' ? '/facility-admin' : `/${user.role}`;
      toast.success('Login successful.');
      navigate(path);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside
        className="relative hidden min-h-screen shrink-0 flex-col items-center justify-center overflow-hidden bg-slate-900 px-8 py-20 lg:flex lg:w-[44%]"
        aria-label="Oron Care branding"
      >
        {/* Hero photo — senior-living-image.jpg in /public */}
        {/* <div
          className="pointer-events-none absolute inset-0 bg-slate-800 bg-[url('/ai_oron_system.webp')] bg-cover bg-center bg-no-repeat"
          aria-hidden
        /> */}
        <div
          className="pointer-events-none absolute inset-0 bg-slate-800 bg-[url('/orn.jpg')] bg-cover bg-center bg-no-repeat"
          aria-hidden
        />

        {/* Depth + readability over busy illustration */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/45 to-slate-950/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_20%,rgba(14,100,155,0.22),transparent_58%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,23,42,0.35)_100%)]"
          aria-hidden
        />
        <AuthLoginBrandPanel />
      </aside>

      <main className="relative flex flex-1 flex-col justify-center bg-slate-50 px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="absolute inset-0 overflow-hidden lg:hidden" aria-hidden>
          <div className="absolute -right-20 top-0 h-48 w-48 rounded-full bg-brand-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-white shadow-lg ring-1 ring-slate-200">
              <img
                src="/oron-logo.svg"
                alt="Oron Care"
                className="h-20 w-20 object-contain rounded-[0.7rem]"
                width={48}
                height={48}
              />
            </div>
          </div>

          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 sm:text-base">Welcome back enter your credentials below.</p>

          <Card className="mt-8 py-8 px-4 shadow-xl border-0 ring-1 ring-slate-200 sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  required
                  icon={Mail}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  icon={Lock}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
                  />

                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="font-medium text-brand-600 hover:text-brand-500"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Sign in <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};
