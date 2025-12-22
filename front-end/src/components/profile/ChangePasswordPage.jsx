import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { InputWrapper, InputLabel, Input, HelperText, ErrorMessage } from '../ui/Input';
import { toast } from '../ui/Toast';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 100px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primary};
    transform: translateX(-2px);
  }
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 22px;
  margin: 0;
`;

const Content = styled.main`
  padding: ${props => props.theme.spacing.xl};
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Heading = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 18px;
`;

const Text = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const Notice = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const PasswordRules = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${props => props.theme.spacing.sm} 0 0;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const RuleItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.caption}
  font-size: 12px;
  color: ${props =>
    props.$met ? props.theme.colors.successBase : props.theme.colors.text.secondary};
`;

const RuleIcon = styled.span`
  font-size: 14px;
`;

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordInput = styled(Input)`
  padding-right: 60px;
`;

const ToggleVisibilityButton = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  ${props => props.theme.typography.caption}
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  padding: ${props => props.theme.spacing.xs};
  z-index: 1;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.radii.md};
  border: none;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  ${props => props.theme.typography.button}
  font-weight: 600;
  font-size: 16px;
  background: ${props =>
    props.disabled ? props.theme.colors.neutral[200] : props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  transition: ${props => props.theme.transitions.swift};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const PasswordStrengthMeter = styled.div`
  margin-top: ${props => props.theme.spacing.xs};
  height: 4px;
  background: ${props => props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.radii.pill};
  overflow: hidden;
  position: relative;
`;

const StrengthBar = styled.div`
  height: 100%;
  width: ${props => props.$strength}%;
  background: ${props => {
    if (props.$strength < 33) return props.theme.colors.dangerBase;
    if (props.$strength < 66) return props.theme.colors.warning[500];
    return props.theme.colors.successBase;
  }};
  transition: all 0.3s ease;
  border-radius: ${props => props.theme.radii.pill};
`;

const StrengthLabel = styled.div`
  ${props => props.theme.typography.caption}
  font-size: 11px;
  color: ${props => {
    if (props.$strength < 33) return props.theme.colors.dangerBase;
    if (props.$strength < 66) return props.theme.colors.warning[500];
    return props.theme.colors.successBase;
  }};
  margin-top: ${props => props.theme.spacing.xs};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SuccessMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.successSoftBg};
  border: 1px solid ${props => props.theme.colors.successBase};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.successBase};
  ${props => props.theme.typography.body2}
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const WarningMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.warningSoftBg || props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.warning[500] || props.theme.colors.neutral[300]};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.warning[700] || props.theme.colors.text.primary};
  ${props => props.theme.typography.body2}
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

import API_BASE_URL from '@config/api';

// Calculate password strength (0-100)
const calculateStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length scoring
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  
  // Character variety
  if (/[a-z]/.test(password)) strength += 10;
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[0-9]/.test(password)) strength += 10;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
  
  // Patterns (penalize common patterns)
  if (/(.)\1{2,}/.test(password)) strength -= 10; // Repeated chars
  if (/123|abc|qwe/i.test(password)) strength -= 10; // Sequential
  
  return Math.max(0, Math.min(100, strength));
};

const getStrengthLabel = (strength) => {
  if (strength < 33) return 'Weak';
  if (strength < 66) return 'Fair';
  if (strength < 85) return 'Good';
  return 'Strong';
};

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const userId = 'default'; // TODO: get from auth context when available

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [currentError, setCurrentError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [success, setSuccess] = useState(false);

  const rules = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>_\-+=\\[\];'/`~]/.test(newPassword),
      letter: /[a-zA-Z]/.test(newPassword),
    };
  }, [newPassword]);

  const passwordStrength = useMemo(() => calculateStrength(newPassword), [newPassword]);
  const strengthLabel = useMemo(() => getStrengthLabel(passwordStrength), [passwordStrength]);

  const allRulesMet = rules.length && rules.number && rules.special && rules.letter;
  const passwordsMatch =
    newPassword.length > 0 && confirmNewPassword.length > 0 && newPassword === confirmNewPassword;

  const canSubmit =
    currentPassword.length > 0 && allRulesMet && passwordsMatch && !submitting && passwordStrength >= 33;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setCurrentError('');
    setGlobalError('');
    setRemainingAttempts(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/profile/${userId}/change-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmNewPassword,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        const message = data.message || 'Could not update password. Try again.';

        if (message === 'Current password is incorrect') {
          setCurrentError('Current password is incorrect');
          if (data.remainingAttempts !== undefined) {
            setRemainingAttempts(data.remainingAttempts);
            if (data.warning) {
              setGlobalError(data.warning);
            }
          }
        } else if (message === 'Weak password' && Array.isArray(data.errors)) {
          setGlobalError(data.errors[0] || 'Password does not meet requirements');
        } else {
          setGlobalError(message);
        }

        toast.error(message);
        return;
      }

      setSuccess(true);
      toast.success('Password updated successfully');
      toast.info('You may be asked to sign in again on other devices.');

      // Clear form after short delay
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      setGlobalError('Could not update password. Try again.');
      toast.error('Could not update password. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">
            ←
          </BackButton>
          <Title>Change Password</Title>
        </HeaderLeft>
      </Header>

      <Content>
        <Card as="form" onSubmit={handleSubmit} autoComplete="off">
          <Heading>Update your password</Heading>
          <Text>
            Keep your account secure without stress. We’ll never show your current password.
          </Text>

          <FieldRow>
            <InputLabel htmlFor="current-password">Current password</InputLabel>
            <PasswordInputWrapper>
              <PasswordInput
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                $error={!!currentError}
              />
              <ToggleVisibilityButton
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? 'Hide' : 'Show'}
              </ToggleVisibilityButton>
            </PasswordInputWrapper>
            {currentError && <ErrorMessage>{currentError}</ErrorMessage>}
          </FieldRow>

          <FieldRow>
            <InputLabel htmlFor="new-password">New password</InputLabel>
            <PasswordInputWrapper>
              <PasswordInput
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                $error={!!globalError}
              />
              <ToggleVisibilityButton
                type="button"
                onClick={() => setShowNew(v => !v)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? 'Hide' : 'Show'}
              </ToggleVisibilityButton>
            </PasswordInputWrapper>

            {newPassword.length > 0 && (
              <>
                <PasswordStrengthMeter>
                  <StrengthBar $strength={passwordStrength} />
                </PasswordStrengthMeter>
                <StrengthLabel $strength={passwordStrength}>
                  {strengthLabel}
                </StrengthLabel>
              </>
            )}

            <HelperText style={{ marginTop: '8px' }}>Your password must:</HelperText>
            <PasswordRules>
              <RuleItem $met={rules.length}>
                <RuleIcon>{rules.length ? '✓' : '•'}</RuleIcon>
                Be at least 8 characters
              </RuleItem>
              <RuleItem $met={rules.letter}>
                <RuleIcon>{rules.letter ? '✓' : '•'}</RuleIcon>
                Include at least 1 letter
              </RuleItem>
              <RuleItem $met={rules.number}>
                <RuleIcon>{rules.number ? '✓' : '•'}</RuleIcon>
                Include 1 number
              </RuleItem>
              <RuleItem $met={rules.special}>
                <RuleIcon>{rules.special ? '✓' : '•'}</RuleIcon>
                Include 1 special character
              </RuleItem>
            </PasswordRules>
          </FieldRow>

          <FieldRow>
            <InputLabel htmlFor="confirm-new-password">Confirm new password</InputLabel>
            <PasswordInputWrapper>
              <PasswordInput
                id="confirm-new-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                $error={!!confirmNewPassword && !passwordsMatch}
              />
              <ToggleVisibilityButton
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </ToggleVisibilityButton>
            </PasswordInputWrapper>
            {!!confirmNewPassword && !passwordsMatch && (
              <ErrorMessage>Passwords don't match</ErrorMessage>
            )}
          </FieldRow>

          {remainingAttempts !== null && remainingAttempts < 5 && (
            <WarningMessage>
              ⚠️ {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout.
            </WarningMessage>
          )}

          {success && (
            <SuccessMessage>
              ✓ Password updated successfully! You may be asked to sign in again on other devices.
            </SuccessMessage>
          )}

          {globalError && !success && <ErrorMessage>{globalError}</ErrorMessage>}

          <SubmitButton type="submit" disabled={!canSubmit}>
            {submitting ? 'Updating…' : 'Update Password'}
          </SubmitButton>

          <Notice>
            For your security, you may be asked to sign in again on other devices after
            changing your password.
          </Notice>
        </Card>
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};


