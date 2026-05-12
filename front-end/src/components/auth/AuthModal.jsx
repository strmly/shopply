import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import API_BASE_URL from '../../config/api';
import { saveAuthUser } from '../../utils/authState';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(10, 15, 23, 0.48);
  backdrop-filter: blur(12px);
`;

const Dialog = styled.div`
  width: min(462px, calc(100vw - 28px));
  max-height: calc(100vh - 28px);
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 251, 255, 0.96)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  box-shadow: 0 28px 80px rgba(16, 24, 40, 0.28);
  color: ${props => props.theme.colors.text.primary};
`;

const Header = styled.div`
  position: relative;
  padding: 18px 18px 14px;
  background: ${props => props.theme.colors.gradient.soft};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(228, 231, 236, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primary};
    border-color: rgba(61, 129, 239, 0.28);
    background: #ffffff;
  }
`;

const DealPill = styled.div`
  width: fit-content;
  max-width: calc(100% - 48px);
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid rgba(61, 129, 239, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
`;

const Spark = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${props => props.theme.colors.warningBase};
  box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.13);
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 18px 44px 6px 0;
  font-size: clamp(24px, 8vw, 32px);
  line-height: 1.04;
  font-weight: 950;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  margin: 0;
  max-width: 34ch;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.45;
  font-weight: 650;
`;

const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 0 18px;
  margin-top: -2px;

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const ValueCard = styled.div`
  min-width: 0;
  padding: 12px 10px;
  border: 1px solid rgba(228, 231, 236, 0.92);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.06);
`;

const ValueMark = styled.div`
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  margin-bottom: 7px;
  border-radius: 999px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primary};
  font-size: 12px;
  font-weight: 950;
`;

const ValueText = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 11px;
  line-height: 1.2;
  font-weight: 900;
`;

const Body = styled.form`
  padding: 16px 18px 18px;
`;

const Segment = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 5px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: ${props => props.theme.colors.surfaceAlt};
`;

const SegmentButton = styled.button`
  min-height: 38px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.$active ? '#ffffff' : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
  box-shadow: ${props => props.$active ? '0 8px 20px rgba(16, 24, 40, 0.08)' : 'none'};
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
`;

const FieldStack = styled.div`
  display: grid;
  gap: 10px;
`;

const Label = styled.label`
  display: grid;
  gap: 6px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  font-weight: 900;
`;

const Input = styled.input`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(228, 231, 236, 0.95);
  border-radius: 16px;
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  font-weight: 700;
  outline: none;
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    border-color: rgba(61, 129, 239, 0.44);
    box-shadow: 0 0 0 4px rgba(61, 129, 239, 0.12);
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const ErrorText = styled.div`
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(198, 40, 80, 0.16);
  border-radius: 14px;
  background: ${props => props.theme.colors.danger[100]};
  color: ${props => props.theme.colors.danger[600]};
  font-size: 12px;
  font-weight: 800;
`;

const PrimaryButton = styled.button`
  width: 100%;
  min-height: 50px;
  margin-top: 14px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  box-shadow: 0 16px 34px rgba(61, 129, 239, 0.28);
  cursor: pointer;
  font-size: 15px;
  font-weight: 950;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 20px 42px rgba(61, 129, 239, 0.34);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
    transform: none;
  }
`;

const FinePrint = styled.p`
  margin: 12px 4px 0;
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 11px;
  line-height: 1.45;
  text-align: center;
`;

const HelperText = styled.div`
  margin-top: 10px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 750;
  line-height: 1.4;
  text-align: center;
`;

const TextButton = styled.button`
  margin: 10px auto 0;
  display: block;
  border: 0;
  background: transparent;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
`;

const normalizeMobile = (value) => value.trim();
const normalizeEmail = (value) => value.trim().toLowerCase();

export const AuthModal = ({ isOpen, onClose, onSuccess, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState('phone');
  const [channel, setChannel] = useState('phone');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [devCode, setDevCode] = useState('');

  const isSignup = mode === 'signup';

  const valueCards = useMemo(() => [
    { mark: '%', text: 'Local deal alerts' },
    { mark: '1', text: 'Faster checkout' },
    { mark: 'O', text: 'Order tracking' },
  ], []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setStep('phone');
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setDevCode('');
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const apiPost = async (path, body) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      const message = data.errors?.join('. ') || data.message || 'Something went wrong. Please try again.';
      throw new Error(message);
    }
    return data.data;
  };

  const completeAuth = (data) => {
    const user = data.user || {};
    const authUser = {
      ...user,
      id: user.id || 'default',
      name: user.name || name.trim() || 'Tsenga Shopper',
      mobile: user.mobile || normalizeMobile(mobile),
      email: user.email || normalizeEmail(email),
      authMethod: `${channel}_password`,
      token: data.token,
    };
    const savedUser = saveAuthUser(authUser);
    onSuccess?.(savedUser);
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanMobile = normalizeMobile(mobile);
    const cleanEmail = normalizeEmail(email);
    setSubmitting(true);
    setError('');

    try {
      if (step === 'phone') {
        if (channel === 'phone' && cleanMobile.replace(/\D/g, '').length < 10) {
          throw new Error('Enter a valid mobile number.');
        }
        if (channel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          throw new Error('Enter a valid email address.');
        }
        if (isSignup && name.trim().length < 2) {
          throw new Error('Add your name so your Tsenga profile feels personal.');
        }

        const data = await apiPost(`/auth/${channel}/start`, {
          mobile: channel === 'phone' ? cleanMobile : undefined,
          email: channel === 'email' ? cleanEmail : undefined,
          name: isSignup ? name.trim() : undefined,
        });

        if (data.requiresPassword) {
          setStep('signinPassword');
        } else {
          setDevCode(data.devCode || '');
          setStep('otp');
        }
      } else if (step === 'otp') {
        if (code.trim().length < 4) {
          throw new Error(`Enter the verification code sent to your ${channel}.`);
        }

        await apiPost(`/auth/${channel}/verify`, {
          mobile: channel === 'phone' ? cleanMobile : undefined,
          email: channel === 'email' ? cleanEmail : undefined,
          code: code.trim(),
          name: name.trim(),
        });
        setStep('password');
      } else if (step === 'password') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const data = await apiPost('/auth/password/set', {
          mobile: channel === 'phone' ? cleanMobile : undefined,
          email: channel === 'email' ? cleanEmail : undefined,
          password,
        });
        completeAuth(data);
      } else if (step === 'signinPassword') {
        const data = await apiPost('/auth/password/sign-in', {
          mobile: channel === 'phone' ? cleanMobile : undefined,
          email: channel === 'email' ? cleanEmail : undefined,
          password,
        });
        completeAuth(data);
      } else if (step === 'reset') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const data = await apiPost('/auth/password/reset', {
          mobile: channel === 'phone' ? cleanMobile : undefined,
          email: channel === 'email' ? cleanEmail : undefined,
          code: code.trim(),
          password,
        });
        completeAuth(data);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const primaryLabel = {
    phone: submitting ? 'Checking your phone...' : 'Continue',
    otp: submitting ? 'Verifying code...' : `Verify ${channel}`,
    password: submitting ? 'Saving password...' : 'Set password and continue',
    signinPassword: submitting ? 'Signing in...' : 'Sign in',
    reset: submitting ? 'Resetting password...' : 'Reset password and sign in',
  }[step];

  const startPasswordReset = async () => {
    const cleanMobile = normalizeMobile(mobile);
    const cleanEmail = normalizeEmail(email);
    setSubmitting(true);
    setError('');
    try {
      const data = await apiPost('/auth/password/forgot', {
        mobile: channel === 'phone' ? cleanMobile : undefined,
        email: channel === 'email' ? cleanEmail : undefined,
      });
      setDevCode(data.devCode || '');
      setCode('');
      setPassword('');
      setConfirmPassword('');
      setStep('reset');
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Backdrop
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Header>
          <CloseButton type="button" onClick={onClose} aria-label="Close sign in modal">
            x
          </CloseButton>
          <DealPill><Spark aria-hidden="true" /> Member prices unlock after sign in</DealPill>
          <Title id="auth-modal-title">Sign in for better deals</Title>
          <Subtitle>
            {step === 'signinPassword'
              ? 'Use your password to sign in. Verification is only needed once.'
              : step === 'reset'
                ? 'Enter your reset code and choose a new password.'
                : 'Verify your phone or email once, then set a password for next time.'}
          </Subtitle>
        </Header>

        <ValueGrid aria-label="Account benefits">
          {valueCards.map(card => (
            <ValueCard key={card.text}>
              <ValueMark>{card.mark}</ValueMark>
              <ValueText>{card.text}</ValueText>
            </ValueCard>
          ))}
        </ValueGrid>

        <Body onSubmit={handleSubmit}>
          <Segment aria-label="Choose account mode">
            <SegmentButton
              type="button"
              $active={!isSignup}
              onClick={() => setMode('signin')}
            >
              Sign in
            </SegmentButton>
            <SegmentButton
              type="button"
              $active={isSignup}
              onClick={() => setMode('signup')}
            >
              Create account
            </SegmentButton>
          </Segment>

          {step === 'phone' && (
            <FieldStack>
              <Segment aria-label="Choose verification method">
                <SegmentButton
                  type="button"
                  $active={channel === 'phone'}
                  onClick={() => setChannel('phone')}
                >
                  Phone
                </SegmentButton>
                <SegmentButton
                  type="button"
                  $active={channel === 'email'}
                  onClick={() => setChannel('email')}
                >
                  Email
                </SegmentButton>
              </Segment>
              {isSignup && (
                <Label>
                  Name
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </Label>
              )}
              {channel === 'phone' ? (
                <Label>
                  Mobile number
                  <Input
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="+27 71 234 5678"
                    autoComplete="tel"
                  />
                </Label>
              ) : (
                <Label>
                  Email address
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Label>
              )}
            </FieldStack>
          )}

          {step === 'otp' && (
            <FieldStack>
              <Label>
                Verification code
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </Label>
              <HelperText>
                We sent a code to {channel === 'phone' ? mobile : email}. {devCode ? `Dev code: ${devCode}` : `Enter it here to verify this ${channel} once.`}
              </HelperText>
              <TextButton
                type="button"
                onClick={() => {
                  setStep('phone');
                  setCode('');
                }}
              >
                Change {channel === 'phone' ? 'phone number' : 'email address'}
              </TextButton>
            </FieldStack>
          )}

          {step === 'password' && (
            <FieldStack>
              <Label>
                Create password
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </Label>
              <Label>
                Confirm password
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </Label>
              <HelperText>Next time, you will sign in with your {channel} and this password.</HelperText>
            </FieldStack>
          )}

          {step === 'signinPassword' && (
            <FieldStack>
              <Label>
                Password
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                />
              </Label>
              <HelperText>{channel === 'phone' ? 'Phone' : 'Email'} already verified. No code needed this time.</HelperText>
              <TextButton type="button" onClick={startPasswordReset} disabled={submitting}>
                Forgot password?
              </TextButton>
            </FieldStack>
          )}

          {step === 'reset' && (
            <FieldStack>
              <Label>
                Reset code
                <Input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </Label>
              <Label>
                New password
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </Label>
              <Label>
                Confirm new password
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </Label>
              <HelperText>
                We sent a reset code to {channel === 'phone' ? mobile : email}. {devCode ? `Dev code: ${devCode}` : ''}
              </HelperText>
            </FieldStack>
          )}

          {error && <ErrorText role="alert">{error}</ErrorText>}

          <PrimaryButton type="submit" disabled={submitting}>
            {primaryLabel}
          </PrimaryButton>

          <FinePrint>
            We verify your phone with Twilio SMS where configured. Email codes use the configured email provider when connected.
          </FinePrint>
        </Body>
      </Dialog>
    </Backdrop>
  );
};
