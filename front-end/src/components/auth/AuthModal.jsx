import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import API_BASE_URL from '../../config/api';
import { saveAuthUser } from '../../utils/authState';

/* ─── Animations ──────────────────────────────────────── */

const fadeIn  = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; }`;
const spin    = keyframes`to { transform: rotate(360deg); }`;
const slideIn = keyframes`from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); }`;
const popIn   = keyframes`0% { transform: scale(0.6); opacity: 0; } 65% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); }`;

/* ─── Layout ──────────────────────────────────────────── */

const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 3000;
  display: grid; place-items: center;
  padding: 18px;
  background: rgba(10,15,23,0.56);
  backdrop-filter: blur(16px);
`;

const Dialog = styled.div`
  position: relative;
  width: min(468px, calc(100vw - 28px));
  max-height: calc(100dvh - 28px);
  overflow-y: auto;
  border: 1px solid rgba(255,255,255,0.82);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.99), rgba(249,251,255,0.97)) padding-box,
    ${p => p.theme.colors.gradient.primary} border-box;
  box-shadow: 0 36px 96px rgba(16,24,40,0.32);
  color: ${p => p.theme.colors.text.primary};
  animation: ${fadeIn} 0.22s ease;
`;

/* ─── Header ──────────────────────────────────────────── */

const Header = styled.div`
  position: relative;
  padding: 20px 20px 16px;
  background: ${p => p.theme.colors.gradient.soft};
  border-radius: 28px 28px 0 0;
`;

const CloseButton = styled.button`
  position: absolute; top: 16px; right: 16px;
  width: 34px; height: 34px;
  display: grid; place-items: center;
  border: 1px solid rgba(228,231,236,0.9); border-radius: 999px;
  background: rgba(255,255,255,0.9);
  color: ${p => p.theme.colors.text.secondary};
  cursor: pointer; font-size: 18px; line-height: 1;
  transition: ${p => p.theme.transitions.swift};
  &:hover { color: ${p => p.theme.colors.primary}; border-color: rgba(61,129,239,0.3); }
`;

const LogoBadge = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 10px;
  border: 1px solid rgba(61,129,239,0.18); border-radius: 999px;
  background: rgba(255,255,255,0.8);
  color: ${p => p.theme.colors.primarySoftText};
  font-size: 11px; font-weight: 900;
`;

const LogoDot = styled.span`
  width: 7px; height: 7px; border-radius: 999px;
  background: ${p => p.theme.colors.warningBase};
  box-shadow: 0 0 0 4px rgba(245,158,11,0.15);
`;

const Title = styled.h2`
  margin: 14px 44px 5px 0;
  font-size: clamp(21px, 6.5vw, 28px);
  line-height: 1.08; font-weight: 950; letter-spacing: -0.3px;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${p => p.theme.colors.text.secondary};
  font-size: 13px; line-height: 1.5; font-weight: 650;
`;

/* ─── Step indicator ──────────────────────────────────── */

const StepRow = styled.div`
  display: flex; align-items: center; gap: 5px;
  margin-top: 12px;
`;

const StepDot = styled.span`
  height: 6px;
  width: ${p => p.$active ? '18px' : '6px'};
  border-radius: 999px;
  background: ${p => p.$active
    ? p.theme.colors.primary
    : p.$done ? 'rgba(61,129,239,0.35)' : 'rgba(61,129,239,0.15)'};
  transition: all 0.25s;
`;

/* ─── Benefits grid ───────────────────────────────────── */

const ValueGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 8px; padding: 0 20px; margin-top: -2px;
  @media (max-width: 360px) { grid-template-columns: 1fr; }
`;

const ValueCard = styled.div`
  padding: 11px 10px;
  border: 1px solid rgba(228,231,236,0.9); border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(16,24,40,0.05);
`;

const ValueMark = styled.div`
  width: 26px; height: 26px; display: grid; place-items: center;
  margin-bottom: 6px; border-radius: 999px;
  background: ${p => p.theme.colors.primarySoftBg};
  color: ${p => p.theme.colors.primary};
  font-size: 11px; font-weight: 950;
`;

const ValueText = styled.div`
  color: ${p => p.theme.colors.text.primary};
  font-size: 10.5px; line-height: 1.25; font-weight: 900;
`;

/* ─── Form shell ──────────────────────────────────────── */

const Body = styled.form`padding: 16px 20px 20px;`;

const StepContent = styled.div`animation: ${slideIn} 0.2s ease;`;

const Stack = styled.div`display: grid; gap: 10px;`;

const Segment = styled.div`
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 5px; padding: 4px; margin-bottom: 14px;
  border-radius: 999px;
  background: ${p => p.theme.colors.surfaceAlt};
`;

const SegBtn = styled.button`
  min-height: 36px; border: 0; border-radius: 999px;
  background: ${p => p.$active ? '#fff' : 'transparent'};
  color: ${p => p.$active ? p.theme.colors.text.primary : p.theme.colors.text.secondary};
  box-shadow: ${p => p.$active ? '0 6px 16px rgba(16,24,40,0.08)' : 'none'};
  cursor: pointer; font-size: 13px; font-weight: 900;
  transition: ${p => p.theme.transitions.swift};
`;

const Label = styled.label`
  display: grid; gap: 5px;
  font-size: 12px; font-weight: 900;
  color: ${p => p.theme.colors.text.primary};
`;

const InputWrap = styled.div`position: relative;`;

const Input = styled.input`
  width: 100%; min-height: 48px;
  padding: 0 ${p => p.$hasIcon ? '44px' : '14px'} 0 14px;
  border: 1.5px solid ${p =>
    p.$error ? 'rgba(198,40,80,0.5)' :
    p.$valid ? 'rgba(34,197,94,0.5)' :
    'rgba(228,231,236,0.95)'};
  border-radius: 14px; background: #fff;
  color: ${p => p.theme.colors.text.primary};
  font-size: 15px; font-weight: 700;
  outline: none; box-sizing: border-box;
  transition: ${p => p.theme.transitions.swift};
  &:focus {
    border-color: ${p =>
      p.$error ? 'rgba(198,40,80,0.6)' :
      p.$valid ? 'rgba(34,197,94,0.6)' :
      'rgba(61,129,239,0.5)'};
    box-shadow: 0 0 0 3px ${p =>
      p.$error ? 'rgba(198,40,80,0.1)' :
      p.$valid ? 'rgba(34,197,94,0.1)' :
      'rgba(61,129,239,0.1)'};
  }
  &::placeholder { color: ${p => p.theme.colors.text.tertiary}; font-weight: 500; }
`;

const FieldHint = styled.div`
  font-size: 11px; font-weight: 800; line-height: 1.4; margin-top: 1px;
  color: ${p => p.$error ? '#c62850' : p.$ok ? '#16a34a' : p.theme.colors.text.tertiary};
`;

const EyeBtn = styled.button`
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  width: 32px; height: 32px; display: grid; place-items: center;
  border: 0; background: transparent;
  color: ${p => p.theme.colors.text.secondary};
  cursor: pointer; border-radius: 8px; transition: color 0.15s;
  &:hover { color: ${p => p.theme.colors.primary}; }
`;

/* ─── OTP digit boxes ─────────────────────────────────── */

const OtpRow = styled.div`
  display: grid; grid-template-columns: repeat(6, 1fr);
  gap: 7px;
`;

const DigitBox = styled.input`
  width: 100%; aspect-ratio: 1;
  border: 2px solid ${p =>
    p.$hasError ? 'rgba(198,40,80,0.5)' :
    p.$filled   ? 'rgba(61,129,239,0.5)' :
    'rgba(228,231,236,0.9)'};
  border-radius: 14px;
  background: ${p =>
    p.$hasError ? 'rgba(198,40,80,0.04)' :
    p.$filled   ? 'rgba(61,129,239,0.04)' :
    '#fff'};
  color: ${p => p.theme.colors.text.primary};
  font-size: 22px; font-weight: 950; text-align: center;
  outline: none; box-sizing: border-box; caret-color: transparent;
  transition: border-color 0.15s, background 0.15s;
  &:focus {
    border-color: ${p => p.$hasError ? 'rgba(198,40,80,0.6)' : p.theme.colors.primary};
    box-shadow: 0 0 0 3px ${p => p.$hasError ? 'rgba(198,40,80,0.12)' : 'rgba(61,129,239,0.12)'};
  }
`;

const AttemptsHint = styled.div`
  text-align: center;
  font-size: 11.5px; font-weight: 800;
  color: ${p => p.$warn ? '#b45309' : '#c62850'};
`;

/* ─── Password strength + rules ───────────────────────── */

const StrengthWrap = styled.div`display: grid; gap: 7px; margin-top: 3px;`;

const StrengthBar = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;
`;

const StrengthSegment = styled.div`
  height: 4px; border-radius: 999px;
  background: ${p => p.$fill ? p.$color : 'rgba(228,231,236,0.8)'};
  transition: background 0.25s;
`;

const RulesGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px;
`;

const RuleItem = styled.div`
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 800;
  color: ${p => p.$met ? '#16a34a' : p.theme.colors.text.tertiary};
  transition: color 0.2s;
`;

/* ─── Match status ────────────────────────────────────── */

const MatchStatus = styled.div`
  font-size: 11px; font-weight: 800; margin-top: 2px;
  color: ${p => p.$match ? '#16a34a' : '#c62850'};
`;

/* ─── Identity chip (sign-in password step) ───────────── */

const IdentityChip = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(61,129,239,0.15); border-radius: 14px;
  background: rgba(61,129,239,0.04);
`;

const ChipAvatar = styled.div`
  width: 34px; height: 34px; border-radius: 999px; flex-shrink: 0;
  display: grid; place-items: center;
  background: ${p => p.theme.colors.gradient.primary};
  color: #fff; font-size: 14px; font-weight: 950;
`;

const ChipInfo = styled.div`flex: 1; min-width: 0;`;

const ChipLabel = styled.div`
  font-size: 10.5px; font-weight: 800;
  color: ${p => p.theme.colors.text.tertiary};
`;

const ChipValue = styled.div`
  font-size: 13px; font-weight: 900;
  color: ${p => p.theme.colors.text.primary};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const ChipChangeBtn = styled.button`
  border: 0; background: none;
  color: ${p => p.theme.colors.primary};
  font-size: 12px; font-weight: 900; cursor: pointer; white-space: nowrap;
`;

/* ─── Resend row ──────────────────────────────────────── */

const ResendRow = styled.div`
  display: flex; align-items: center; justify-content: center;
  gap: 6px; font-size: 12px; font-weight: 700;
  color: ${p => p.theme.colors.text.secondary};
`;

const ResendBtn = styled.button`
  border: 0; background: none;
  color: ${p => p.theme.colors.primary};
  font-size: 12px; font-weight: 900; cursor: pointer;
  &:disabled { opacity: 0.45; cursor: default; }
`;

const TimerBadge = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 30px; height: 20px; padding: 0 5px;
  border-radius: 6px;
  background: ${p => p.theme.colors.surfaceAlt};
  font-size: 11px; font-weight: 900; font-variant-numeric: tabular-nums;
  color: ${p => p.theme.colors.text.secondary};
`;

/* ─── Error & actions ─────────────────────────────────── */

const ErrorBox = styled.div`
  margin-top: 10px; padding: 10px 13px;
  border: 1px solid rgba(198,40,80,0.18); border-radius: 12px;
  background: ${p => p.theme.colors.danger[100]};
  color: ${p => p.theme.colors.danger[600]};
  font-size: 12px; font-weight: 800; line-height: 1.45;
`;

const TextBtn = styled.button`
  display: block; margin: 6px auto 0;
  border: 0; background: none;
  color: ${p => p.theme.colors.primary};
  font-size: 12px; font-weight: 900; cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const ForgotRow = styled.div`display: flex; justify-content: flex-end;`;

const ForgotBtn = styled.button`
  border: 0; background: none;
  color: ${p => p.theme.colors.primary};
  font-size: 12px; font-weight: 900; cursor: pointer;
  padding: 2px 0;
  &:disabled { opacity: 0.5; cursor: default; }
`;

/* ─── Submit button ───────────────────────────────────── */

const SubmitBtn = styled.button`
  width: 100%; min-height: 50px; margin-top: 14px;
  border: 0; border-radius: 999px;
  background: ${p => p.$soft ? p.theme.colors.primarySoftBg : p.theme.colors.gradient.primary};
  color: ${p => p.$soft ? p.theme.colors.primary : '#fff'};
  box-shadow: ${p => p.$soft ? 'none' : '0 14px 32px rgba(61,129,239,0.26)'};
  cursor: pointer; font-size: 15px; font-weight: 950;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: ${p => p.theme.transitions.swift};
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${p => p.$soft ? '0 4px 16px rgba(61,129,239,0.14)' : '0 18px 40px rgba(61,129,239,0.32)'};
  }
  &:disabled { opacity: 0.72; cursor: wait; transform: none; }
`;

const Spinner = styled.span`
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff; border-radius: 999px;
  animation: ${spin} 0.65s linear infinite; display: inline-block;
`;

/* ─── Success overlay ─────────────────────────────────── */

const SuccessOverlay = styled.div`
  position: absolute; inset: 0; z-index: 10;
  display: grid; place-items: center;
  border-radius: 28px;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(4px);
`;

const SuccessInner = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  animation: ${popIn} 0.4s ease;
`;

const SuccessCircle = styled.div`
  width: 72px; height: 72px; border-radius: 999px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  display: grid; place-items: center;
  box-shadow: 0 16px 40px rgba(34,197,94,0.35);
  color: #fff; font-size: 30px;
`;

const SuccessLabel = styled.div`
  font-size: 20px; font-weight: 950;
  color: ${p => p.theme.colors.text.primary};
`;

const SuccessSub = styled.div`
  font-size: 13px; font-weight: 700;
  color: ${p => p.theme.colors.text.secondary};
`;


/* ─── Fine print ──────────────────────────────────────── */

const Fine = styled.p`
  margin: 10px 0 0; text-align: center;
  color: ${p => p.theme.colors.text.tertiary};
  font-size: 10.5px; line-height: 1.5;
`;

/* ─── Pure helpers ────────────────────────────────────── */

const normalizeMobile = v => v.trim();
const normalizeEmail  = v => v.trim().toLowerCase();

const maskEmail = (e) => {
  if (!e) return '';
  const [user, domain] = e.split('@');
  if (!domain) return e;
  return user.slice(0, Math.min(3, user.length)) + '***@' + domain;
};

const maskPhone = (p) => {
  const d = p.replace(/\D/g, '');
  return d.slice(0, 3) + ' *** ' + d.slice(-3);
};

const getPasswordStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/\d/.test(pw))   s++;
  return s;
};

const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = p => p.replace(/\D/g, '').length >= 10;

const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

const PW_RULES = [
  { label: '8+ characters', test: pw => pw.length >= 8 },
  { label: 'Uppercase',     test: pw => /[A-Z]/.test(pw) },
  { label: 'Lowercase',     test: pw => /[a-z]/.test(pw) },
  { label: 'Number',        test: pw => /\d/.test(pw) },
];

const STEP_ORDER   = ['phone', 'otp', 'password', 'signinPassword', 'reset'];
const MAX_ATTEMPTS = 5;

/* ─── Eye icon SVG ────────────────────────────────────── */

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ─── Component ───────────────────────────────────────── */

export const AuthModal = ({ isOpen, onClose, onSuccess, initialMode = 'signin' }) => {
  const [mode, setMode]                     = useState(initialMode);
  const [step, setStep]                     = useState('phone');
  const [channel, setChannel]               = useState('email');
  const [name, setName]                     = useState('');
  const [mobile, setMobile]                 = useState('');
  const [email, setEmail]                   = useState('');
  const [code, setCode]                     = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [error, setError]                   = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [resendSeconds, setResendSeconds]   = useState(0);
  const [touched, setTouched]               = useState({});
  const [succeeded, setSucceeded]           = useState(false);
  const [otpError, setOtpError]             = useState(false);
  const [otpAttempts, setOtpAttempts]       = useState(0);

  const formRef   = useRef(null);
  const primaryRef = useRef(null);
  const digitRefs  = useRef([]);

  const isSignup    = mode === 'signup';
  const strength    = getPasswordStrength(password);
  const cleanEmail  = normalizeEmail(email);
  const cleanMobile = normalizeMobile(mobile);
  const maskedId    = channel === 'email' ? maskEmail(cleanEmail) : maskPhone(mobile);

  const valueCards = useMemo(() => [
    { mark: '%', text: 'Member deal prices' },
    { mark: '✓', text: 'Faster checkout' },
    { mark: '↑', text: 'Order tracking' },
  ], []);

  // Keyboard close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = e => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset on open / mode change
  useEffect(() => {
    if (!isOpen) return;
    setError(''); setStep('phone'); setCode('');
    setPassword(''); setConfirmPassword('');
    setShowPw(false); setShowConfirm(false);
    setTouched({}); setSucceeded(false);
    setOtpError(false); setOtpAttempts(0);
  }, [isOpen, mode]);

  // Auto-focus: digit boxes on OTP steps, primary input otherwise
  useEffect(() => {
    const t = setTimeout(() => {
      if (step === 'otp' || step === 'reset') {
        digitRefs.current[0]?.focus();
      } else {
        primaryRef.current?.focus();
      }
    }, 80);
    return () => clearTimeout(t);
  }, [step]);

  // OTP resend countdown
  useEffect(() => {
    if (step !== 'otp' && step !== 'reset') return;
    setResendSeconds(60);
    const id = setInterval(() => setResendSeconds(s => {
      if (s <= 1) { clearInterval(id); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [step]);

  // Auto-submit OTP at 6 complete digits — 120ms delay lets the user see the filled state
  useEffect(() => {
    if (step === 'otp' && code.replace(/\s/g, '').length === 6 && !submitting) {
      const t = setTimeout(() => formRef.current?.requestSubmit(), 120);
      return () => clearTimeout(t);
    }
  }, [code, step, submitting]);

  if (!isOpen) return null;

  /* ── API ────────────────────────────────────────── */

  const apiPost = async (path, body) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.errors?.join('. ') || data.message || 'Something went wrong.');
    }
    return data.data;
  };

  const completeAuth = (data) => {
    const u = data.user || {};
    const authUser = {
      ...u,
      id: u.id || 'default',
      name: u.name || name.trim() || 'Shopper',
      mobile: u.mobile || cleanMobile,
      email: u.email || cleanEmail,
      role: u.role || 'buyer',
      authMethod: `${channel}_password`,
      token: data.token,
    };
    const saved = saveAuthUser(authUser);
    setSucceeded(true);
    setTimeout(() => { onSuccess?.(saved); onClose?.(); }, 950);
  };

  const startAuth = async () => apiPost(`/auth/${channel}/start`, {
    mobile: channel === 'phone' ? cleanMobile : undefined,
    email:  channel === 'email' ? cleanEmail  : undefined,
    name:   isSignup ? name.trim() : undefined,
  });

  const handleResend = async () => {
    setError('');
    try {
      await startAuth();
      setCode('');
      setOtpError(false);
      setOtpAttempts(0);
      setResendSeconds(60);
      setTimeout(() => digitRefs.current[0]?.focus(), 0);
    } catch (e) {
      setError(e.message);
    }
  };

  const startForgot = async () => {
    setSubmitting(true); setError('');
    try {
      await apiPost('/auth/password/forgot', {
        mobile: channel === 'phone' ? cleanMobile : undefined,
        email:  channel === 'email' ? cleanEmail  : undefined,
      });
      setCode(''); setPassword(''); setConfirmPassword('');
      setStep('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── OTP digit handlers ─────────────────────────── */

  const handleDigitChange = (i, rawVal) => {
    setOtpError(false);
    const digit = rawVal.replace(/\D/g, '').slice(-1);
    const arr = (code.padEnd(6, ' ')).split('');
    arr[i] = digit || ' ';
    const newCode = arr.join('').replace(/\s+$/, '');
    setCode(newCode);
    if (digit && i < 5) digitRefs.current[i + 1]?.focus();
  };

  const handleDigitKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (code.charAt(i).trim()) {
        const arr = (code.padEnd(6, ' ')).split('');
        arr[i] = ' ';
        setCode(arr.join('').replace(/\s+$/, ''));
      } else if (i > 0) {
        const arr = (code.padEnd(6, ' ')).split('');
        arr[i - 1] = ' ';
        setCode(arr.join('').replace(/\s+$/, ''));
        digitRefs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft'  && i > 0) digitRefs.current[i - 1]?.focus();
    else if   (e.key === 'ArrowRight' && i < 5) digitRefs.current[i + 1]?.focus();
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(pasted);
    setTimeout(() => digitRefs.current[Math.min(pasted.length, 5)]?.focus(), 0);
  };

  /* ── Field validation ───────────────────────────── */

  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));
  const emailError = touched.email && email && !isValidEmail(cleanEmail) ? 'Enter a valid email address' : '';
  const emailOk    = touched.email && email && isValidEmail(cleanEmail);
  const phoneError = touched.mobile && mobile && !isValidPhone(mobile) ? 'Enter a valid 10-digit number' : '';
  const phoneOk    = touched.mobile && mobile && isValidPhone(mobile);
  const nameError  = touched.name && name && name.trim().length < 2 ? 'Name must be at least 2 characters' : '';

  /* ── Submit ─────────────────────────────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, mobile: true, name: true });
    setSubmitting(true); setError('');

    try {
      if (step === 'phone') {
        if (channel === 'phone' && !isValidPhone(mobile))
          throw new Error('Enter a valid mobile number.');
        if (channel === 'email' && !isValidEmail(cleanEmail))
          throw new Error('Enter a valid email address.');
        if (isSignup && name.trim().length < 2)
          throw new Error('Please enter your full name.');

        const data = await startAuth();
        if (data.requiresPassword) {
          setStep('signinPassword');
        } else {
          setStep('otp');
        }

      } else if (step === 'otp') {
        const cleanCode = code.replace(/\s/g, '');
        if (cleanCode.length < 6) throw new Error('Enter the complete 6-digit code.');
        await apiPost(`/auth/${channel}/verify`, {
          mobile: channel === 'phone' ? cleanMobile : undefined,
          email:  channel === 'email' ? cleanEmail  : undefined,
          code:   cleanCode,
          name:   name.trim(),
        });
        setStep('password');

      } else if (step === 'password') {
        if (strength < 4) throw new Error('Please satisfy all password requirements.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        const data = await apiPost('/auth/password/set', {
          mobile: channel === 'phone' ? cleanMobile : undefined,
          email:  channel === 'email' ? cleanEmail  : undefined,
          password,
        });
        completeAuth(data);

      } else if (step === 'signinPassword') {
        const data = await apiPost('/auth/password/sign-in', {
          mobile: channel === 'phone' ? cleanMobile : undefined,
          email:  channel === 'email' ? cleanEmail  : undefined,
          password,
        });
        completeAuth(data);

      } else if (step === 'reset') {
        const cleanCode = code.replace(/\s/g, '');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        if (strength < 4) throw new Error('Please satisfy all password requirements.');
        const data = await apiPost('/auth/password/reset', {
          mobile: channel === 'phone' ? cleanMobile : undefined,
          email:  channel === 'email' ? cleanEmail  : undefined,
          code:   cleanCode,
          password,
        });
        completeAuth(data);
      }
    } catch (err) {
      setError(err.message);
      if (step === 'otp' && err.message.toLowerCase().includes('incorrect')) {
        setOtpError(true);
        setOtpAttempts(n => Math.min(n + 1, MAX_ATTEMPTS));
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Derived display values ─────────────────────── */

  const STEP_COPY = {
    phone: {
      signin: { title: 'Welcome back',   sub: 'Sign in to unlock deals and track your orders.' },
      signup: { title: 'Join Tsenga',   sub: 'Create your account in a minute.' },
    },
    otp:            { title: 'Check your inbox',    sub: null },
    password:       { title: 'Set your password',   sub: "Choose something strong — you'll use it every time." },
    signinPassword: { title: 'Enter your password', sub: null },
    reset:          { title: 'Reset your password', sub: 'Enter the code we sent, then choose a new password.' },
  };

  const stepCopy = step === 'phone'
    ? STEP_COPY.phone[isSignup ? 'signup' : 'signin']
    : STEP_COPY[step] || {};

  const stepTitle = stepCopy.title || 'Sign in';
  const stepSub   = step === 'otp'
    ? `We sent a 6-digit code to ${maskedId}.`
    : (stepCopy.sub || '');

  const submitLabel = {
    phone:          isSignup ? 'Create account' : 'Continue',
    otp:            'Verify code',
    password:       'Create account',
    signinPassword: 'Sign in',
    reset:          'Set new password',
  }[step] || 'Continue';

  const showStepDots = step === 'otp' || step === 'password';

  /* ── Shared OTP boxes JSX ───────────────────────── */
  const otpBoxes = (
    <OtpRow>
      {Array.from({ length: 6 }, (_, i) => (
        <DigitBox
          key={i}
          ref={el => (digitRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code.charAt(i).trim()}
          $filled={!!code.charAt(i).trim()}
          $hasError={otpError}
          onChange={e => handleDigitChange(i, e.target.value)}
          onKeyDown={e => { setOtpError(false); handleDigitKeyDown(i, e); }}
          onPaste={handleDigitPaste}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </OtpRow>
  );

  /* ── Shared password strength JSX ───────────────── */
  const passwordStrength = (
    <StrengthWrap>
      <StrengthBar>
        {[1,2,3,4].map(n => (
          <StrengthSegment key={n} $fill={strength >= n} $color={STRENGTH_COLORS[strength]} />
        ))}
      </StrengthBar>
      {password.length > 0 && (
        <RulesGrid>
          {PW_RULES.map(r => (
            <RuleItem key={r.label} $met={r.test(password)}>
              {r.test(password) ? '✓' : '○'} {r.label}
            </RuleItem>
          ))}
        </RulesGrid>
      )}
    </StrengthWrap>
  );

  /* ── Shared confirm password JSX ────────────────── */
  const confirmPwField = (label = 'Confirm password') => (
    <Label>
      {label}
      <InputWrap>
        <Input
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Repeat password"
          autoComplete="new-password"
          $hasIcon
          $error={confirmPassword.length > 0 && confirmPassword !== password}
          $valid={confirmPassword.length > 0 && confirmPassword === password}
        />
        <EyeBtn type="button" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm visibility">
          <EyeIcon open={showConfirm} />
        </EyeBtn>
      </InputWrap>
      {confirmPassword.length > 0 && (
        <MatchStatus $match={confirmPassword === password}>
          {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords don\'t match'}
        </MatchStatus>
      )}
    </Label>
  );

  /* ─── Render ──────────────────────────────────────── */

  return (
    <Backdrop role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={e => e.stopPropagation()}>

        {succeeded && (
          <SuccessOverlay>
            <SuccessInner>
              <SuccessCircle>✓</SuccessCircle>
              <SuccessLabel>You're signed in!</SuccessLabel>
              <SuccessSub>Taking you back now…</SuccessSub>
            </SuccessInner>
          </SuccessOverlay>
        )}

        <Header>
          <CloseButton type="button" onClick={onClose} aria-label="Close">×</CloseButton>
          <LogoBadge><LogoDot aria-hidden="true" /> Tsenga</LogoBadge>
          <Title id="auth-title">{stepTitle}</Title>
          {stepSub && <Subtitle>{stepSub}</Subtitle>}
          {showStepDots && (
            <StepRow aria-label="Progress">
              {['otp', 'password'].map(s => (
                <StepDot key={s}
                  $active={step === s}
                  $done={STEP_ORDER.indexOf(step) > STEP_ORDER.indexOf(s)}
                />
              ))}
            </StepRow>
          )}
        </Header>

        {step === 'phone' && isSignup && (
          <ValueGrid aria-label="Account benefits">
            {valueCards.map(c => (
              <ValueCard key={c.text}>
                <ValueMark>{c.mark}</ValueMark>
                <ValueText>{c.text}</ValueText>
              </ValueCard>
            ))}
          </ValueGrid>
        )}

        <Body ref={formRef} onSubmit={handleSubmit}>
          <StepContent key={step}>

            {/* ── phone / email entry ── */}
            {step === 'phone' && (
              <Stack>
                <Segment aria-label="Account mode">
                  <SegBtn type="button" $active={!isSignup} onClick={() => setMode('signin')}>Sign in</SegBtn>
                  <SegBtn type="button" $active={isSignup}  onClick={() => setMode('signup')}>Create account</SegBtn>
                </Segment>

                <Segment aria-label="Verification method">
                  <SegBtn type="button" $active={channel === 'email'} onClick={() => setChannel('email')}>Email</SegBtn>
                  <SegBtn type="button" $active={channel === 'phone'} onClick={() => setChannel('phone')}>Phone</SegBtn>
                </Segment>

                {isSignup && (
                  <Label>
                    Your name
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onBlur={() => touch('name')}
                      placeholder="Full name"
                      autoComplete="name"
                      $error={!!nameError}
                    />
                    {nameError && <FieldHint $error>{nameError}</FieldHint>}
                  </Label>
                )}

                {channel === 'email' ? (
                  <Label>
                    Email address
                    <Input
                      ref={primaryRef}
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => touch('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                      $error={!!emailError}
                      $valid={!!emailOk}
                    />
                    {emailError && <FieldHint $error>{emailError}</FieldHint>}
                    {emailOk    && <FieldHint $ok>✓ Looks good</FieldHint>}
                  </Label>
                ) : (
                  <Label>
                    Mobile number
                    <Input
                      ref={primaryRef}
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      onBlur={() => touch('mobile')}
                      placeholder="+27 71 234 5678"
                      autoComplete="tel"
                      $error={!!phoneError}
                      $valid={!!phoneOk}
                    />
                    {phoneError && <FieldHint $error>{phoneError}</FieldHint>}
                    {phoneOk    && <FieldHint $ok>✓ Looks good</FieldHint>}
                  </Label>
                )}
              </Stack>
            )}

            {/* ── OTP verification ── */}
            {step === 'otp' && (
              <Stack>
                <Label>Enter the 6-digit code</Label>
                {otpBoxes}
                {otpAttempts > 0 && otpAttempts < MAX_ATTEMPTS && (
                  <AttemptsHint $warn={otpAttempts < 3}>
                    {MAX_ATTEMPTS - otpAttempts} of {MAX_ATTEMPTS} attempts remaining
                  </AttemptsHint>
                )}

                <ResendRow>
                  {resendSeconds > 0 ? (
                    <>Resend in <TimerBadge>{resendSeconds}</TimerBadge></>
                  ) : (
                    <>
                      Didn't get it?&nbsp;
                      <ResendBtn type="button" onClick={handleResend} disabled={submitting}>
                        Resend code
                      </ResendBtn>
                    </>
                  )}
                </ResendRow>

                <TextBtn type="button" onClick={() => { setStep('phone'); setCode(''); }}>
                  ← Change {channel === 'phone' ? 'phone number' : 'email address'}
                </TextBtn>
              </Stack>
            )}

            {/* ── Create password (new account) ── */}
            {step === 'password' && (
              <Stack>
                <Label>
                  Create password
                  <InputWrap>
                    <Input
                      ref={primaryRef}
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      $hasIcon
                    />
                    <EyeBtn type="button" onClick={() => setShowPw(v => !v)} aria-label="Toggle password visibility">
                      <EyeIcon open={showPw} />
                    </EyeBtn>
                  </InputWrap>
                  {passwordStrength}
                </Label>
                {confirmPwField()}
              </Stack>
            )}

            {/* ── Sign in with password ── */}
            {step === 'signinPassword' && (
              <Stack>
                <IdentityChip>
                  <ChipAvatar>
                    {(channel === 'email' ? email : mobile).charAt(0).toUpperCase()}
                  </ChipAvatar>
                  <ChipInfo>
                    <ChipLabel>Signing in as</ChipLabel>
                    <ChipValue>{channel === 'email' ? email : mobile}</ChipValue>
                  </ChipInfo>
                  <ChipChangeBtn type="button" onClick={() => setStep('phone')}>
                    Change
                  </ChipChangeBtn>
                </IdentityChip>

                <Label>
                  Password
                  <InputWrap>
                    <Input
                      ref={primaryRef}
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Your password"
                      autoComplete="current-password"
                      $hasIcon
                    />
                    <EyeBtn type="button" onClick={() => setShowPw(v => !v)} aria-label="Toggle visibility">
                      <EyeIcon open={showPw} />
                    </EyeBtn>
                  </InputWrap>
                </Label>

                <ForgotRow>
                  <ForgotBtn type="button" onClick={startForgot} disabled={submitting}>
                    Forgot password?
                  </ForgotBtn>
                </ForgotRow>
              </Stack>
            )}

            {/* ── Password reset ── */}
            {step === 'reset' && (
              <Stack>
                <Label>Enter the reset code</Label>
                {otpBoxes}

                <ResendRow>
                  {resendSeconds > 0 ? (
                    <>Resend in <TimerBadge>{resendSeconds}</TimerBadge></>
                  ) : (
                    <>
                      Didn't get it?&nbsp;
                      <ResendBtn type="button" onClick={startForgot} disabled={submitting}>
                        Resend code
                      </ResendBtn>
                    </>
                  )}
                </ResendRow>

                <Label>
                  New password
                  <InputWrap>
                    <Input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      $hasIcon
                    />
                    <EyeBtn type="button" onClick={() => setShowPw(v => !v)} aria-label="Toggle visibility">
                      <EyeIcon open={showPw} />
                    </EyeBtn>
                  </InputWrap>
                  {passwordStrength}
                </Label>
                {confirmPwField('Confirm new password')}
              </Stack>
            )}

          </StepContent>

          {error && <ErrorBox role="alert">{error}</ErrorBox>}

          <SubmitBtn type="submit" disabled={submitting} $soft={step === 'otp'}>
            {submitting && <Spinner />}
            {submitting ? 'Please wait…' : submitLabel}
          </SubmitBtn>

          {step === 'phone' && (
            <Fine>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Fine>
          )}

          {step === 'password' && (
            <TextBtn
              type="button"
              onClick={() => { setStep('phone'); setCode(''); setPassword(''); setConfirmPassword(''); setError(''); }}
            >
              ← Start over
            </TextBtn>
          )}
        </Body>
      </Dialog>
    </Backdrop>
  );
};
