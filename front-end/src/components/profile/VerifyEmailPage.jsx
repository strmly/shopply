import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';
import { useUser } from '../../context/UserContext';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { Input, InputLabel, ErrorMessage, HelperText } from '../ui/Input';
import { toast } from '../ui/Toast';

const USER_ID = 'default';

const Page = styled.div`
  min-height: 100vh;
  padding-bottom: 104px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 50%, #ffffff 100%);
  animation: ${fadeIn} 0.35s ease;
`;

const Shell = styled.main`
  width: min(760px, calc(100% - 32px));
  margin: 0 auto;
  padding: 18px 0 28px;

  @media (max-width: 560px) {
    width: min(100% - 22px, 760px);
  }
`;

const Hero = styled.section`
  display: grid;
  gap: 14px;
  padding: clamp(18px, 4vw, 30px);
  border-radius: 28px;
  border: 1px solid transparent;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98), rgba(241,247,255,0.94)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  box-shadow: 0 24px 62px rgba(16, 24, 40, 0.1);
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(61, 129, 239, 0.18);
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(32px, 7vw, 52px);
  line-height: 1;
  letter-spacing: 0;
  font-weight: 900;
`;

const Subtext = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.6;
  font-weight: 750;
`;

const Panel = styled.section`
  margin-top: 16px;
  display: grid;
  gap: 16px;
  padding: clamp(16px, 3vw, 24px);
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.07);
`;

const Field = styled.div`
  display: grid;
  gap: 7px;
`;

const CodeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
`;

const CodeInput = styled.input`
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid ${props => props.$filled ? 'rgba(61, 129, 239, 0.46)' : props.theme.colors.border.default};
  border-radius: 16px;
  background: ${props => props.$filled ? props.theme.colors.primarySoftBg : '#ffffff'};
  color: ${props => props.theme.colors.text.primary};
  font-size: 24px;
  font-weight: 900;
  text-align: center;
  outline: none;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(61, 129, 239, 0.12);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Button = styled.button`
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(61, 129, 239, 0.18)'};
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.theme.colors.primarySoftText};
  font-weight: 900;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.62 : 1};
  box-shadow: ${props => props.$primary && !props.disabled ? '0 16px 34px rgba(61, 129, 239, 0.24)' : 'none'};
`;

const Notice = styled.div`
  padding: 13px 14px;
  border-radius: 16px;
  background: ${props => props.$success ? props.theme.colors.success[100] : props.theme.colors.primarySoftBg};
  color: ${props => props.$success ? props.theme.colors.success[600] : props.theme.colors.primarySoftText};
  border: 1px solid ${props => props.$success ? props.theme.colors.success[200] : 'rgba(61, 129, 239, 0.16)'};
  font-size: 13px;
  font-weight: 850;
`;

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');

  useEffect(() => {
    setEmail(user?.email && user.email !== 'guest@example.com' ? user.email : '');
  }, [user]);

  const digits = useMemo(() => code.padEnd(6, '').slice(0, 6).split(''), [code]);
  const canSend = isEmail(email) && !sending;
  const canVerify = sent && code.length === 6 && !verifying;

  const sendCode = async () => {
    if (!canSend) return;
    setSending(true);
    setError('');
    setSuccess(false);
    setDevCode('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/profile/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || 'Could not send verification email');

      if (data.data?.alreadyVerified) {
        setSuccess(true);
        toast.success('Email already verified');
      } else {
        setSent(true);
        setDevCode(data.data?.devCode || '');
        toast.success('Verification code sent');
      }
    } catch (err) {
      setError(err.message || 'Could not send verification email');
      toast.error(err.message || 'Could not send verification email');
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!canVerify) return;
    setVerifying(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/email/profile/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, email, code }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || 'Could not verify email');

      setSuccess(true);
      setSent(false);
      setCode('');
      await refreshUser?.();
      toast.success('Email verified');
    } catch (err) {
      setError(err.message || 'Could not verify email');
      toast.error(err.message || 'Could not verify email');
    } finally {
      setVerifying(false);
    }
  };

  const updateDigit = (index, value) => {
    const next = value.replace(/\D/g, '').slice(-1);
    const chars = code.padEnd(6, ' ').slice(0, 6).split('');
    chars[index] = next || ' ';
    setCode(chars.join('').replace(/\s/g, '').slice(0, 6));
  };

  return (
    <Page>
      <Shell>
        <Hero>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">&lt;</BackButton>
          <div>
            <Title>Verify email</Title>
            <Subtext>Confirm your email so Tsenga can protect your account, password resets, receipts, and order updates.</Subtext>
          </div>
        </Hero>

        <Panel>
          <Field>
            <InputLabel htmlFor="verify-email">Email address</InputLabel>
            <Input
              id="verify-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSent(false);
                setSuccess(false);
                setCode('');
              }}
              placeholder="you@example.com"
              autoComplete="email"
              $error={Boolean(email) && !isEmail(email)}
            />
            {email && !isEmail(email) ? (
              <ErrorMessage>Enter a valid email address</ErrorMessage>
            ) : (
              <HelperText>We will send a 6 digit verification code.</HelperText>
            )}
          </Field>

          {sent && (
            <Field>
              <InputLabel>Verification code</InputLabel>
              <CodeGrid>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <CodeInput
                    key={index}
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[index]?.trim() || ''}
                    $filled={Boolean(digits[index]?.trim())}
                    onChange={(event) => updateDigit(index, event.target.value)}
                  />
                ))}
              </CodeGrid>
              <HelperText>Code expires in 5 minutes.</HelperText>
            </Field>
          )}

          {devCode && <Notice>Local development code: {devCode}</Notice>}
          {success && <Notice $success>Email verified. Your Tsenga account is safer now.</Notice>}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonRow>
            <Button $primary disabled={!canSend} onClick={sendCode}>
              {sending ? 'Sending...' : sent ? 'Resend code' : 'Send verification email'}
            </Button>
            <Button disabled={!canVerify} onClick={verifyCode}>
              {verifying ? 'Verifying...' : 'Verify code'}
            </Button>
          </ButtonRow>
        </Panel>
      </Shell>
      <BottomNavigation currentPath="/profile" />
    </Page>
  );
};
