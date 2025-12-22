import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { InputWrapper, InputLabel, Input, ErrorMessage, HelperText } from '../ui/Input';
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

const SaveButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  background: ${props =>
    props.disabled
      ? props.theme.colors.neutral[200]
      : props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.pill};
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  ${props => props.theme.typography.button}
  font-size: 14px;
  font-weight: 600;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: ${props => (props.disabled ? 'none' : 'translateY(-1px)')};
    box-shadow: ${props =>
      props.disabled ? 'none' : props.theme.shadows.md};
  }
`;

const Content = styled.main`
  padding: ${props => props.theme.spacing.xl};
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const AvatarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const AvatarOuterRing = styled.div`
  position: relative;
  width: 112px;
  height: 112px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props =>
    props.$isUploading
      ? `conic-gradient(${props.theme.colors.primary} 0deg, ${props.theme.colors.primarySoftBg} 120deg, ${props.theme.colors.neutral[200]} 360deg)`
      : 'transparent'};
  transition: background 0.2s ease;
  padding: ${props => (props.$isUploading ? '2px' : '0')};
`;

const AvatarCircle = styled.div`
  width: 104px;
  height: 104px;
  border-radius: 999px;
  overflow: hidden;
  background: ${props => props.theme.colors.neutral[100]};
  border: 2px solid ${props => props.theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: ${props => props.theme.colors.text.secondary};
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarInitials = styled.span`
  ${props => props.theme.typography.heading2}
`;

const AvatarEditButton = styled.button`
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
`;

const AvatarHint = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const AvatarMenu = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing.sm} 0;
  min-width: 200px;
  z-index: 10;
`;

const AvatarMenuItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: transparent;
  border: none;
  text-align: left;
  ${props => props.theme.typography.body2}
  font-size: 14px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};

  &:hover {
    background: ${props => props.theme.colors.neutral[50]};
  }
`;

const AvatarMenuWrapper = styled.div`
  position: relative;
`;

const FieldsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

import API_BASE_URL from '@config/api';

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

const buildName = (firstName, lastName) =>
  [firstName, lastName].filter(Boolean).join(' ').trim();

const getInitials = (firstName, lastName) => {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  const combined = `${first}${last}`.toUpperCase();
  return combined || 'U';
};

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const userId = 'default'; // TODO: get from auth context when available

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    avatarUrl: '',
  });

  const [initialForm, setInitialForm] = useState(form);
  const [errors, setErrors] = useState({});

  const isDirty = useMemo(() => {
    return (
      form.firstName !== initialForm.firstName ||
      form.lastName !== initialForm.lastName ||
      form.email !== initialForm.email ||
      form.mobile !== initialForm.mobile
    );
  }, [form, initialForm]);

  const isValid = useMemo(() => {
    if (!form.firstName.trim() || !form.lastName.trim()) return false;
    if (errors.email || errors.mobile) return false;
    return true;
  }, [form, errors]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load profile');
        }

        const { firstName, lastName } = splitName(data.data.name || '');
        const nextForm = {
          firstName: firstName || 'Guest',
          lastName: lastName || 'User',
          email: data.data.email || '',
          mobile: data.data.mobile || '',
          avatarUrl: data.data.avatarUrl || '',
        };

        setForm(nextForm);
        setInitialForm(nextForm);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Could not load profile. Using a safe default.');
        const fallback = {
          firstName: 'Guest',
          lastName: 'User',
          email: 'guest@example.com',
          mobile: '',
          avatarUrl: '',
        };
        setForm(fallback);
        setInitialForm(fallback);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (field === 'email') {
      if (!value) {
        setErrors(prev => ({ ...prev, email: null }));
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setErrors(prev => ({
          ...prev,
          email: emailRegex.test(value) ? null : 'Enter a valid email address',
        }));
      }
    }

    if (field === 'mobile') {
      if (!value) {
        setErrors(prev => ({ ...prev, mobile: null }));
      } else {
        const digits = value.replace(/\D/g, '');
        const isValidLength = digits.length >= 10;
        const mobileRegex = /^[\d\s+\-()]+$/;
        setErrors(prev => ({
          ...prev,
          mobile:
            isValidLength && mobileRegex.test(value)
              ? null
              : 'Enter a valid mobile number',
        }));
      }
    }

    if (field === 'firstName' || field === 'lastName') {
      if (value.trim().length === 0) {
        setErrors(prev => ({ ...prev, [field]: 'Required' }));
      } else {
        setErrors(prev => ({ ...prev, [field]: null }));
      }
    }
  };

  const handleSave = async () => {
    if (!isDirty || !isValid) return;

    try {
      setSaving(true);
      const payload = {
        name: buildName(form.firstName, form.lastName),
        email: form.email || undefined,
        mobile: form.mobile || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not save changes');
      }

      const nextInitial = {
        ...form,
        avatarUrl: form.avatarUrl,
      };
      setInitialForm(nextInitial);
      toast.success('Profile updated');
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Error saving profile:', error);
      const apiMessage = error?.message || 'Couldn’t save changes. Try again.';
      toast.error(apiMessage);
    } finally {
      setSaving(false);
    }
  };

  const maybeAutoSave = async () => {
    if (!isDirty || !isValid || saving) return;
    await handleSave();
  };

  const handleAvatarFile = async file => {
    if (!file) return;

    try {
      setUploadingAvatar(true);

      const toBase64 = fileToBase64(file);
      const base64 = await toBase64;

      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: base64 }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update photo');
      }

      setForm(prev => ({ ...prev, avatarUrl: base64 }));
      setInitialForm(prev => ({ ...prev, avatarUrl: base64 }));
      toast.success('Photo updated');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Could not update photo. Try again.');
    } finally {
      setUploadingAvatar(false);
      setShowAvatarMenu(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploadingAvatar(true);

      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: '' }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove photo');
      }

      setForm(prev => ({ ...prev, avatarUrl: '' }));
      setInitialForm(prev => ({ ...prev, avatarUrl: '' }));
      toast.success('Photo removed');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Could not remove photo. Try again.');
    } finally {
      setUploadingAvatar(false);
      setShowAvatarMenu(false);
    }
  };

  const handleChooseFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files?.[0];
      if (file) {
        handleAvatarFile(file);
      }
    };
    input.click();
  };

  const currentInitials = getInitials(form.firstName, form.lastName);

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => navigate(-1)} aria-label="Back">
              ←
            </BackButton>
            <Title>Edit Profile</Title>
          </HeaderLeft>
        </Header>
        <Content>
          <div>Loading profile…</div>
        </Content>
        <BottomNavigation currentPath="/profile" />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">
            ←
          </BackButton>
          <Title>Edit Profile</Title>
        </HeaderLeft>
        <SaveButton
          onClick={handleSave}
          disabled={!isDirty || !isValid || saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </SaveButton>
      </Header>

      <Content>
        <Section aria-label="Profile photo">
          <AvatarWrapper>
            <AvatarOuterRing $isUploading={uploadingAvatar}>
              <AvatarCircle aria-label="Profile photo">
                {form.avatarUrl ? (
                  <AvatarImage src={form.avatarUrl} alt="Profile" />
                ) : (
                  <AvatarInitials>{currentInitials}</AvatarInitials>
                )}
              </AvatarCircle>
              <AvatarMenuWrapper>
                <AvatarEditButton
                  type="button"
                  onClick={() => setShowAvatarMenu(prev => !prev)}
                  aria-label="Edit profile photo"
                >
                  📷
                </AvatarEditButton>
                {showAvatarMenu && (
                  <AvatarMenu>
                    <AvatarMenuItem
                      type="button"
                      onClick={() =>
                        toast.info(
                          'Camera capture is not available in this preview.'
                        )
                      }
                    >
                      Take photo
                    </AvatarMenuItem>
                    <AvatarMenuItem
                      type="button"
                      onClick={handleChooseFromGallery}
                    >
                      Choose from gallery
                    </AvatarMenuItem>
                    {form.avatarUrl && (
                      <AvatarMenuItem
                        type="button"
                        onClick={handleRemoveAvatar}
                      >
                        Remove photo
                      </AvatarMenuItem>
                    )}
                  </AvatarMenu>
                )}
              </AvatarMenuWrapper>
            </AvatarOuterRing>
            <AvatarHint>Make it easier for friends and sellers to recognize you.</AvatarHint>
          </AvatarWrapper>
        </Section>

        <Section aria-label="Profile information">
          <FieldsGrid>
            <Row>
              <InputWrapper>
                <InputLabel htmlFor="first-name">First Name</InputLabel>
                <Input
                  id="first-name"
                  value={form.firstName}
                  onChange={e => handleFieldChange('firstName', e.target.value)}
                  onBlur={maybeAutoSave}
                  placeholder="First name"
                  autoComplete="given-name"
                  $error={!!errors.firstName}
                />
                {errors.firstName && (
                  <ErrorMessage>{errors.firstName}</ErrorMessage>
                )}
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="last-name">Last Name</InputLabel>
                <Input
                  id="last-name"
                  value={form.lastName}
                  onChange={e => handleFieldChange('lastName', e.target.value)}
                  onBlur={maybeAutoSave}
                  placeholder="Last name"
                  autoComplete="family-name"
                  $error={!!errors.lastName}
                />
                {errors.lastName && (
                  <ErrorMessage>{errors.lastName}</ErrorMessage>
                )}
              </InputWrapper>
            </Row>

            <InputWrapper>
              <InputLabel htmlFor="email">Email address (optional)</InputLabel>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={e => handleFieldChange('email', e.target.value)}
                onBlur={maybeAutoSave}
                placeholder="you@example.com"
                autoComplete="email"
                $error={!!errors.email}
              />
              {errors.email ? (
                <ErrorMessage>{errors.email}</ErrorMessage>
              ) : (
                <HelperText>
                  We’ll only use this for account security and important
                  updates.
                </HelperText>
              )}
            </InputWrapper>

            <InputWrapper>
              <InputLabel htmlFor="mobile">Mobile number (optional)</InputLabel>
              <Input
                id="mobile"
                type="tel"
                value={form.mobile}
                onChange={e => handleFieldChange('mobile', e.target.value)}
                onBlur={maybeAutoSave}
                placeholder="+27 71 234 5678"
                autoComplete="tel"
                $error={!!errors.mobile}
              />
              {errors.mobile ? (
                <ErrorMessage>{errors.mobile}</ErrorMessage>
              ) : (
                <HelperText>
                  Use a number where you can receive SMS one-time codes.
                </HelperText>
              )}
            </InputWrapper>

            {lastSavedAt && (
              <HelperText>
                All changes saved • {lastSavedAt.toLocaleTimeString()}
              </HelperText>
            )}
          </FieldsGrid>
        </Section>
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};

const fileToBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });


