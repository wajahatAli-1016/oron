import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { AuthPageHeader } from '../components/auth/AuthPageHeader';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage, INTERNAL_SERVER_ERROR_MESSAGE } from '../utils/apiMessage';
import { FORGOT_RESET_SESSION_KEY, PASSWORD_RESET_OTP_LENGTH } from '../constants/passwordReset';

type RequestOtpResponse =
  | { status: 'no_user'; message: string }
  | { status: 'already_sent'; message: string; expiresAt: string }
  | { status: 'sent'; message: string; expiresAt: string };

type VerifyOtpResponse = { valid: boolean; message: string; expiresAt?: string };

function getApiBase(): string {
  const apiBase = import.meta.env.VITE_API_URL || '';
  if (!apiBase) {
    throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
  }
  return apiBase.replace(/\/$/, '');
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

type LocationState = { email?: string; expiresAt?: string };

const LS_KEY = 'oron.forgotPassword';

type OtpBlocksProps = {
  length: number;
  value: string;
  onChange: (next: string) => void;
  disabled: boolean;
  hasError: boolean;
};

function OtpBlocks({ length, value, onChange, disabled, hasError }: OtpBlocksProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusAt = (i: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length === 0) {
      onChange(value.slice(0, index) + value.slice(index + 1));
      return;
    }
    if (raw.length >= 2) {
      const merged = (value.slice(0, index) + raw).slice(0, length);
      onChange(merged);
      focusAt(Math.min(index + raw.length - 1, length - 1));
      return;
    }
    const next = (value.slice(0, index) + raw + value.slice(index + 1)).slice(0, length);
    onChange(next);
    if (index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    focusAt(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={length}
            disabled={disabled}
            value={value[i] ?? ''}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${i + 1} of ${length}`}
            className={[
              'h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 text-center text-lg font-semibold tracking-tight text-slate-900 shadow-sm transition-colors',
              'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25',
              disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white',
              hasError ? 'border-red-400' : 'border-slate-200',
            ].join(' ')}
          />
        ))}
    </div>
  );
}

export const ForgotPasswordVerify = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state || {}) as LocationState;
  const [email, setEmail] = useState(state.email || '');
  const [expiresAt, setExpiresAt] = useState<string | null>(state.expiresAt || null);
  const [otp, setOtp] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ email, expiresAt }));
    } catch {
      // ignore
    }
  }, [email, expiresAt]);

  useEffect(() => {
    if (email) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { email?: string; expiresAt?: string | null };
      if (parsed?.email) setEmail(parsed.email);
      if (parsed?.expiresAt !== undefined) setExpiresAt(parsed.expiresAt ?? null);
    } catch {
      // ignore
    }
  }, [email]);

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const { secondsLeft, isExpired } = useMemo(() => {
    if (!expiresAt) {
      return { secondsLeft: 0, isExpired: true };
    }
    const ms = new Date(expiresAt).getTime() - nowMs;
    const sec = Math.max(0, Math.floor(ms / 1000));
    const expired = ms <= 0;
    return { secondsLeft: expired ? 0 : sec, isExpired: expired };
  }, [expiresAt, nowMs]);

  const timerText = useMemo(() => formatTime(secondsLeft), [secondsLeft]);

  const resendOtp = async () => {
    setError(null);
    setIsResending(true);
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
            res.status >= 500 ? INTERNAL_SERVER_ERROR_MESSAGE : 'Failed to resend OTP',
          ),
        );
      }
      if (!data) throw new Error('Unexpected response from server.');
      if (data.status === 'no_user') {
        toast.info(data.message || 'Please login first.');
        setError(data.message || 'Please login first.');
        return;
      }
      setExpiresAt(data.expiresAt);
      setOtp('');
      toast.success(data.message || 'OTP sent to your email.');
    } catch (err) {
      setError(null);
      toast.error(getApiErrorMessage(err, 'Failed to resend OTP'));
    } finally {
      setIsResending(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);
    try {
      const res = await fetch(`${getApiBase()}/auth/password/forgot/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      let data: VerifyOtpResponse | null = null;
      try {
        data = (await res.json()) as VerifyOtpResponse;
      } catch {
        data = null;
      }
      if (!res.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            res.status >= 500 ? INTERNAL_SERVER_ERROR_MESSAGE : 'Failed to verify OTP',
          ),
        );
      }
      if (!data) throw new Error('Unexpected response from server.');

      if (!data.valid) {
        setError(data.message || 'Invalid OTP.');
        toast.error(data.message || 'Invalid OTP.');
        return;
      }

      toast.success(data.message || 'OTP verified.');
      if (data.expiresAt) setExpiresAt(data.expiresAt);

      const payload = { email: email.trim(), otp: otp.trim() };
      try {
        sessionStorage.setItem(FORGOT_RESET_SESSION_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
      navigate('/set-password', { replace: true, state: { forgot: payload } });
    } catch (err) {
      setError(null);
      toast.error(getApiErrorMessage(err, 'Failed to verify OTP'));
    } finally {
      setIsVerifying(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <Card className="w-full max-w-md p-6 shadow-xl border-0 ring-1 ring-slate-200">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" aria-hidden />
            <p>Missing email. Please start again from the forgot password page.</p>
          </div>
          <div className="mt-4">
            <Button className="w-full" onClick={() => navigate('/forgot-password')}>
              Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const timerActive = Boolean(expiresAt) && !isExpired;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AuthPageHeader
          title="OTP verification"
          description={
            <>
              We sent a one-time code to <span className="font-medium text-slate-900">{email}</span>
            </>
          }
        />
        <Card className="py-8 px-4 sm:px-10 shadow-xl border-0 ring-1 ring-slate-200 space-y-6">
          
          {timerActive ? (
            <form className="space-y-6" onSubmit={verifyOtp}>
              <OtpBlocks
                length={PASSWORD_RESET_OTP_LENGTH}
                value={otp}
                onChange={(next) => setOtp(next.replace(/\D/g, '').slice(0, PASSWORD_RESET_OTP_LENGTH))}
                disabled={isVerifying}
                hasError={Boolean(error)}
              />

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isVerifying}
                  disabled={otp.length !== PASSWORD_RESET_OTP_LENGTH}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="flex justify-end items-baseline gap-2 pt-0.5">
                  <span className="text-sm text-slate-400">Code expires in</span>
                  <span className="text-sm font-bold font-mono tabular-nums text-slate-900">{timerText}</span>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <OtpBlocks
                length={PASSWORD_RESET_OTP_LENGTH}
                value={otp}
                onChange={(next) => setOtp(next.replace(/\D/g, '').slice(0, PASSWORD_RESET_OTP_LENGTH))}
                disabled
                hasError={Boolean(error)}
              />
              <Button type="button" className="w-full" size="lg" onClick={resendOtp} isLoading={isResending}>
                Send new OTP
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
