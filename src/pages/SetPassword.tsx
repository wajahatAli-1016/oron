import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Card, Input } from '../components/UI';
import { AuthPageHeader } from '../components/auth/AuthPageHeader';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage, INTERNAL_SERVER_ERROR_MESSAGE } from '../utils/apiMessage';
import { FORGOT_RESET_SESSION_KEY, PASSWORD_RESET_OTP_LENGTH } from '../constants/passwordReset';

type InviteCheckState = 'idle' | 'checking' | 'valid' | 'invalid';

type ForgotResetPayload = { email: string; otp: string };

function parseForgotPayload(raw: unknown): ForgotResetPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const email = typeof o.email === 'string' ? o.email.trim() : '';
  const otp = typeof o.otp === 'string' ? o.otp.trim() : '';
  if (!email || !new RegExp(`^\\d{${PASSWORD_RESET_OTP_LENGTH}}$`).test(otp)) return null;
  return { email, otp };
}

function readForgotFromSession(): ForgotResetPayload | null {
  try {
    const raw = sessionStorage.getItem(FORGOT_RESET_SESSION_KEY);
    if (!raw) return null;
    return parseForgotPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

function getApiBase(): string {
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (!apiBase) {
    throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
  }
  return apiBase.replace(/\/$/, '');
}

export const SetPassword = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const inviteCode = useMemo(
    () => searchParams.get('inviteCode') || searchParams.get('token') || '',
    [searchParams],
  );

  const forgotFromNavigation = useMemo(() => {
    const st = location.state as { forgot?: unknown } | null;
    return parseForgotPayload(st?.forgot);
  }, [location.state]);

  const forgotEffective = useMemo(() => {
    if (inviteCode) return null;
    return forgotFromNavigation ?? readForgotFromSession();
  }, [inviteCode, forgotFromNavigation]);

  useEffect(() => {
    if (inviteCode) {
      try {
        sessionStorage.removeItem(FORGOT_RESET_SESSION_KEY);
      } catch {
        // ignore
      }
      return;
    }
    if (forgotFromNavigation) {
      try {
        sessionStorage.setItem(FORGOT_RESET_SESSION_KEY, JSON.stringify(forgotFromNavigation));
      } catch {
        // ignore
      }
    }
  }, [inviteCode, forgotFromNavigation]);

  const isForgotFlow = Boolean(forgotEffective);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCheck, setInviteCheck] = useState<InviteCheckState>('idle');
  const [inviteIssueMessage, setInviteIssueMessage] = useState<string | null>(null);

  useEffect(() => {
    if (inviteCode) {
      let cancelled = false;
      setInviteCheck('checking');
      setInviteIssueMessage(null);

      (async () => {
        try {
          const res = await fetch(`${getApiBase()}/auth/password/verify-invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inviteCode }),
          });
          let data: { valid?: boolean; message?: string } = {};
          try {
            data = await res.json();
          } catch {
            data = {};
          }
          if (cancelled) return;

          if (res.ok && data.valid === true) {
            setInviteCheck('valid');
            return;
          }

          setInviteCheck('invalid');
          setInviteIssueMessage(
            typeof data.message === 'string' && data.message.trim()
              ? data.message
              : 'This invitation is no longer valid. Please contact your administrator for a new invitation.',
          );
        } catch {
          if (cancelled) return;
          setInviteCheck('invalid');
          setInviteIssueMessage(
            'We could not verify your invitation. Check your internet connection and try again, or contact your administrator.',
          );
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    if (!isForgotFlow) {
      setInviteCheck('invalid');
      setInviteIssueMessage(
        'This page needs a valid invitation link. Open the set-password link from your invitation email, or contact your administrator.',
      );
    } else {
      setInviteCheck('idle');
      setInviteIssueMessage(null);
    }
  }, [inviteCode, isForgotFlow]);

  const inviteReady = inviteCode && inviteCheck === 'valid';
  const showInviteChecking = Boolean(inviteCode) && (inviteCheck === 'checking' || inviteCheck === 'idle');
  const showInviteInvalid = Boolean(inviteCode) && inviteCheck === 'invalid';
  const showForgotForm = isForgotFlow;
  const showNoAccess = !inviteCode && !isForgotFlow;

  const canSubmitInvite = !isLoading && inviteReady;
  const canSubmitForgot = !isLoading && showForgotForm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (confirmPassword.length < 8) {
      toast.error('Confirm password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (showForgotForm && forgotEffective) {
      setIsLoading(true);
      try {
        const res = await fetch(`${getApiBase()}/auth/password/forgot/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: forgotEffective.email,
            otp: forgotEffective.otp,
            password,
            confirmPassword,
          }),
        });
        let body: { message?: string | string[] } | null = null;
        try {
          body = (await res.json()) as { message?: string | string[] };
        } catch {
          body = null;
        }
        if (!res.ok) {
          throw new Error(
            getApiErrorMessage(
              body,
              res.status >= 500 ? INTERNAL_SERVER_ERROR_MESSAGE : 'Failed to reset password',
            ),
          );
        }

        toast.success('Password reset successfully. Please sign in.');
        try {
          sessionStorage.removeItem(FORGOT_RESET_SESSION_KEY);
          localStorage.removeItem('oron.forgotPassword');
        } catch {
          // ignore
        }
        navigate('/login', { replace: true });
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to reset password'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!inviteCode || inviteCheck !== 'valid') {
      toast.error('Your invitation is not valid for setting a password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/auth/password/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, password, confirmPassword }),
      });

      if (!res.ok) {
        let body: { message?: string | string[] } | null = null;
        try {
          body = await res.json();
        } catch {
          body = null;
        }
        throw new Error(
          getApiErrorMessage(
            body,
            res.status >= 500 ? INTERNAL_SERVER_ERROR_MESSAGE : 'Failed to set password',
          ),
        );
      }

      toast.success('Password set successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to set password'));
    } finally {
      setIsLoading(false);
    }
  };

  const heading = showNoAccess
    ? 'Cannot set password'
    : showInviteInvalid
      ? 'Invitation unavailable'
      : showForgotForm
        ? 'Create new password'
        : 'Set your password';

  const subheading = showNoAccess
    ? 'Open this page from the forgot-password flow after verifying your email code, or use your invitation link.'
    : showInviteInvalid
      ? 'You cannot complete account setup with this link.'
      : showForgotForm
        ? 'Enter a new password for your account. Your code was already verified.'
        : 'Choose a new password to activate your account.';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AuthPageHeader title={heading} description={subheading} />
        <Card className="py-8 px-4 sm:px-10 shadow-xl border-0 ring-1 ring-slate-200">
          {showInviteChecking && (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-slate-600">
              <Loader2 className="h-10 w-10 animate-spin text-brand-600" aria-hidden />
              <p className="text-sm text-center">Verifying your invitation…</p>
            </div>
          )}

          {(showInviteInvalid || showNoAccess) && (inviteIssueMessage || showNoAccess) && (
            <div className="space-y-6">
              <div
                className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" aria-hidden />
                <p className="leading-relaxed">
                  {showNoAccess ? subheading : (inviteIssueMessage ?? '')}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button type="button" variant="secondary" className="w-full" onClick={() => navigate('/forgot-password')}>
                  Forgot password
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/login')}>
                  Back to sign in
                </Button>
              </div>
            </div>
          )}

          {(inviteReady || showForgotForm) && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {showForgotForm && forgotEffective && (
                <p className="text-sm text-slate-600">
                  Resetting password for <span className="font-medium text-slate-900">{forgotEffective.email}</span>
                </p>
              )}

              <div className="space-y-4">
                <Input
                  label="New password"
                  type="password"
                  required
                  icon={Lock}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                  label="Confirm password"
                  type="password"
                  required
                  icon={Lock}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={showForgotForm ? !canSubmitForgot : !canSubmitInvite}
              >
                {showForgotForm ? 'Reset password' : 'Set password'}{' '}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
