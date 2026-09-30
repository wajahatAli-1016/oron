import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, ShieldAlert } from 'lucide-react';
import { Button, Card, Input } from '../components/UI';
import { AuthPageHeader } from '../components/auth/AuthPageHeader';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage, INTERNAL_SERVER_ERROR_MESSAGE } from '../utils/apiMessage';

type RequestOtpResponse =
  | { status: 'no_user'; message: string }
  | { status: 'already_sent'; message: string; expiresAt: string }
  | { status: 'sent'; message: string; expiresAt: string };

function getApiBase(): string {
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (!apiBase) {
    throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
  }
  return apiBase.replace(/\/$/, '');
}

export const ForgotPassword = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(email.trim()) && !isLoading, [email, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${getApiBase()}/auth/password/forgot/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data: RequestOtpResponse | null = null;
      try {
        data = (await res.json()) as RequestOtpResponse;
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            res.status >= 500 ? INTERNAL_SERVER_ERROR_MESSAGE : 'Failed to request OTP',
          ),
        );
      }

      if (!data) {
        throw new Error('Unexpected response from server.');
      }

      if (data.status === 'no_user') {
        toast.info(data.message || 'Please login first.');
        setError(data.message || 'Please login first.');
        return;
      }

      toast.success(data.message || 'OTP sent to your email.');
      navigate('/forgot-password/verify', {
        state: {
          email: email.trim(),
          expiresAt: data.expiresAt,
        },
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to request OTP'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AuthPageHeader
          title="Forgot your password?"
          description="Enter your email. We’ll send you a one-time code to reset your password."
        />
        <Card className="py-8 px-4 sm:px-10 shadow-xl border-0 ring-1 ring-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                required
                icon={Mail}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && (
                <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  <ShieldAlert className="h-4 w-4 mt-0.5 text-amber-700" aria-hidden />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={!canSubmit}>
              Send code <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button type="button" variant="secondary" className="w-full" onClick={() => navigate('/login')}>
              Back to sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

