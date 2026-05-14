import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API_BASE_URL from '@config/api';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { InputLabel, Input, ErrorMessage, HelperText } from '../ui/Input';
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

const Header = styled.section`
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

const Card = styled.form`
  margin-top: 16px;
  display: grid;
  gap: 18px;
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

const PasswordWrap = styled.div`
  position: relative;
`;

const PasswordInput = styled(Input)`
  padding-right: 72px;
`;

const Toggle = styled.button`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  cursor: pointer;
`;

const Meter = styled.div`
  height: 7px;
  border-radius: 999px;
  background: ${props => props.theme.colors.neutral[100]};
  overflow: hidden;
`;

const Bar = styled.div`
  width: ${props => props.$strength}%;
  height: 100%;
  border-radius: 999px;
  background: ${props => {
    if (props.$strength < 40) return props.theme.colors.dangerBase;
    if (props.$strength < 75) return props.theme.colors.warningBase;
    return props.theme.colors.successBase;
  }};
`;

const RuleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Rule = styled.div`
  padding: 10px 12px;
  border-radius: 14px;
  background: ${props => props.$met ? props.theme.colors.success[100] : props.theme.colors.neutral[50]};
  color: ${props => props.$met ? props.theme.colors.success[600] : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.$met ? props.theme.colors.success[200] : props.theme.colors.border.light};
  font-size: 12px;
  font-weight: 900;
`;

const Notice = styled.div`
  padding: 13px 14px;
  border-radius: 16px;
  background: ${props => props.$success ? props.theme.colors.success[100] : props.theme.colors.primarySoftBg};
  border: 1px solid ${props => props.$success ? props.theme.colors.success[200] : 'rgba(61, 129, 239, 0.18)'};
  color: ${props => props.$success ? props.theme.colors.success[600] : props.theme.colors.primarySoftText};
  font-size: 13px;
  font-weight: 850;
`;

const SubmitButton = styled.button`
  min-height: 48px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.disabled ? props.theme.colors.neutral[200] : props.theme.colors.gradient.primary};
  color: #ffffff;
  font-weight: 900;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  box-shadow: ${props => props.disabled ? 'none' : '0 16px 34px rgba(61, 129, 239, 0.24)'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
`;

const strengthOf = (password) => {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;
  if (/[a-zA-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  return Math.min(score, 100);
};

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [hasPassword, setHasPassword] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [visible, setVisible] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile/${USER_ID}`);
        const data = await response.json();
        if (data.success && data.data) setHasPassword(Boolean(data.data.hasPassword));
      } catch {
        setHasPassword(true);
      }
    };

    loadStatus();
  }, []);

  const rules = useMemo(() => ({
    length: newPassword.length >= 8,
    letter: /[a-zA-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^a-zA-Z0-9]/.test(newPassword),
  }), [newPassword]);
  const strength = useMemo(() => strengthOf(newPassword), [newPassword]);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmNewPassword;
  const canSubmit = (!hasPassword || currentPassword.length > 0)
    && Object.values(rules).every(Boolean)
    && passwordsMatch
    && !submitting;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/profile/${USER_ID}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : '',
          newPassword,
          confirmNewPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.errors?.[0] || data.message || 'Could not update password');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setHasPassword(true);
      setSuccess(true);
      toast.success('Password updated successfully');
    } catch (err) {
      setError(err.message || 'Could not update password');
      toast.error(err.message || 'Could not update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <Shell>
        <Header>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">&lt;</BackButton>
          <div>
            <Title>{hasPassword ? 'Update password' : 'Set password'}</Title>
            <Subtext>Use a strong password for your Tsenga sign-in after phone verification.</Subtext>
          </div>
        </Header>

        <Card onSubmit={submit} autoComplete="off">
          {!hasPassword && (
            <Notice>Phone verification is already handled once. Set a password for faster sign-in next time.</Notice>
          )}

          {hasPassword && (
            <Field>
              <InputLabel htmlFor="current-password">Current password</InputLabel>
              <PasswordWrap>
                <PasswordInput
                  id="current-password"
                  type={visible.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Current password"
                  autoComplete="current-password"
                />
                <Toggle type="button" onClick={() => setVisible(prev => ({ ...prev, current: !prev.current }))}>
                  {visible.current ? 'Hide' : 'Show'}
                </Toggle>
              </PasswordWrap>
            </Field>
          )}

          <Field>
            <InputLabel htmlFor="new-password">New password</InputLabel>
            <PasswordWrap>
              <PasswordInput
                id="new-password"
                type={visible.next ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <Toggle type="button" onClick={() => setVisible(prev => ({ ...prev, next: !prev.next }))}>
                {visible.next ? 'Hide' : 'Show'}
              </Toggle>
            </PasswordWrap>
            <Meter><Bar $strength={strength} /></Meter>
            <RuleGrid>
              <Rule $met={rules.length}>8 or more characters</Rule>
              <Rule $met={rules.letter}>Includes a letter</Rule>
              <Rule $met={rules.number}>Includes a number</Rule>
              <Rule $met={rules.special}>Includes a special character</Rule>
            </RuleGrid>
          </Field>

          <Field>
            <InputLabel htmlFor="confirm-password">Confirm password</InputLabel>
            <PasswordWrap>
              <PasswordInput
                id="confirm-password"
                type={visible.confirm ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                $error={confirmNewPassword.length > 0 && !passwordsMatch}
              />
              <Toggle type="button" onClick={() => setVisible(prev => ({ ...prev, confirm: !prev.confirm }))}>
                {visible.confirm ? 'Hide' : 'Show'}
              </Toggle>
            </PasswordWrap>
            {confirmNewPassword.length > 0 && !passwordsMatch && <ErrorMessage>Passwords do not match</ErrorMessage>}
          </Field>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <Notice $success>Password updated. Your account is ready for secure sign-in.</Notice>}
          <SubmitButton type="submit" disabled={!canSubmit}>
            {submitting ? 'Saving...' : hasPassword ? 'Update password' : 'Set password'}
          </SubmitButton>
          <HelperText>For security, other devices may need to sign in again after this change.</HelperText>
        </Card>
      </Shell>
      <BottomNavigation currentPath="/profile" />
    </Page>
  );
};
