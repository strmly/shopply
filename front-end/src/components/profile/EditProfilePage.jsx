import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { uploadImage } from '../../utils/uploadImage';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { InputWrapper, InputLabel, Input, ErrorMessage, HelperText } from '../ui/Input';
import { toast } from '../ui/Toast';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 50%, #ffffff 100%);
  animation: ${fadeIn} 0.45s ease;
  padding-bottom: 104px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98), rgba(241,247,255,0.95)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  border: 1px solid transparent;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 24px 62px rgba(16, 24, 40, 0.1);
`;

const HeaderInner = styled.div`
  width: min(920px, calc(100% - 32px));
  margin: 0 auto;
  padding: calc(18px + env(safe-area-inset-top)) 0 18px;
  display: flex;
  align-items: center;
  gap: 14px;
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(228, 231, 236, 0.95);
  border-radius: 16px;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 24px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.06);
`;

const TitleBlock = styled.div`
  min-width: 0;
  flex: 1;
`;

const Eyebrow = styled.div`
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 3px 0 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(30px, 7vw, 48px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const SaveButton = styled.button`
  min-height: 42px;
  padding: 10px 16px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.disabled ? props.theme.colors.neutral[200] : props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  box-shadow: ${props => props.disabled ? 'none' : '0 16px 30px rgba(61, 129, 239, 0.2)'};
`;

const Content = styled.main`
  width: min(920px, calc(100% - 32px));
  margin: 0 auto;
  padding: 22px 0 0;
  display: grid;
  gap: 16px;
`;

const Section = styled.section`
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.2), rgba(228,231,236,0.9), rgba(21,161,124,0.14)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  padding: clamp(16px, 3vw, 24px);
  box-shadow: 0 20px 46px rgba(16, 24, 40, 0.08);
`;

const PhotoLayout = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  align-items: center;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
    text-align: center;
    justify-items: center;
  }
`;

const AvatarOuterRing = styled.div`
  position: relative;
  width: 116px;
  height: 116px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  padding: 3px;
  background: ${props => props.$isUploading
    ? `conic-gradient(${props.theme.colors.primary} 0deg, ${props.theme.colors.primarySoftBg} 120deg, ${props.theme.colors.neutral[200]} 360deg)`
    : props.theme.colors.gradient.soft};
  box-shadow: 0 18px 34px rgba(61, 129, 239, 0.14);
`;

const AvatarCircle = styled.div`
  width: 106px;
  height: 106px;
  border-radius: 999px;
  overflow: hidden;
  background: ${props => props.theme.colors.gradient.primary};
  border: 2px solid #ffffff;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-size: 38px;
  font-weight: 900;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarEditButton = styled.button`
  position: absolute;
  right: 0;
  bottom: 4px;
  min-width: 48px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 14px 26px rgba(61, 129, 239, 0.22);
`;

const AvatarMenuWrapper = styled.div`
  position: relative;
`;

const AvatarMenu = styled.div`
  position: absolute;
  top: 42px;
  right: 0;
  z-index: 10;
  min-width: 210px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.95);
  border-radius: 18px;
  box-shadow: 0 20px 46px rgba(16, 24, 40, 0.12);
`;

const AvatarMenuItem = styled.button`
  width: 100%;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  color: ${props => props.theme.colors.text.primary};
  text-align: left;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primarySoftText};
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(22px, 5vw, 34px);
  line-height: 1;
  font-weight: 900;
`;

const SectionText = styled.p`
  margin: 8px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.45;
  font-weight: 700;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
    width: 100%;
  }
`;

const SummaryPill = styled.div`
  min-width: 0;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(228, 231, 236, 0.95);
`;

const SummaryLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
`;

const SummaryValue = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 900;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FieldsGrid = styled.div`
  display: grid;
  gap: 18px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const getInitials = (firstName, lastName) => {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'U';
};

const emailIsValid = (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const mobileIsValid = (value) => !value || (/^[\d\s+\-()]+$/.test(value) && value.replace(/\D/g, '').length >= 10);

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading, updateUser } = useUser();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [formReady, setFormReady] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', avatarUrl: '' });
  const [initialForm, setInitialForm] = useState(form);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!userLoading && user && !formReady) {
      const nextForm = {
        firstName: user.firstName || 'Guest',
        lastName: user.lastName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        avatarUrl: user.avatarUrl || '',
      };
      setForm(nextForm);
      setInitialForm(nextForm);
      setFormReady(true);
    }
  }, [user, userLoading, formReady]);

  const isDirty = useMemo(() => (
    form.firstName !== initialForm.firstName ||
    form.lastName !== initialForm.lastName ||
    form.email !== initialForm.email ||
    form.mobile !== initialForm.mobile ||
    form.avatarUrl !== initialForm.avatarUrl
  ), [form, initialForm]);

  const isValid = useMemo(() => (
    Boolean(form.firstName.trim()) &&
    Boolean(form.lastName.trim()) &&
    emailIsValid(form.email) &&
    mobileIsValid(form.mobile) &&
    !Object.values(errors).some(Boolean)
  ), [form, errors]);

  const currentInitials = getInitials(form.firstName, form.lastName);

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (field === 'firstName' || field === 'lastName') {
      setErrors(prev => ({ ...prev, [field]: value.trim() ? null : 'Required' }));
    }
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: emailIsValid(value) ? null : 'Enter a valid email address' }));
    }
    if (field === 'mobile') {
      setErrors(prev => ({ ...prev, mobile: mobileIsValid(value) ? null : 'Enter a valid mobile number' }));
    }
  };

  const handleSave = async () => {
    if (!isDirty || !isValid || saving) return;

    try {
      setSaving(true);
      await updateUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || '',
        mobile: form.mobile.trim() || '',
        avatarUrl: form.avatarUrl || '',
      });
      const saved = {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
      };
      setForm(saved);
      setInitialForm(saved);
      setLastSavedAt(new Date());
      toast.success('Profile updated');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const maybeAutoSave = async () => {
    if (isDirty && isValid && !saving) await handleSave();
  };

  const handleAvatarFile = async (file) => {
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const url = await uploadImage(file, 'avatar');
      const next = { ...form, avatarUrl: url };
      setForm(next);
      await updateUser({ avatarUrl: url });
      setInitialForm(next);
      setLastSavedAt(new Date());
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
      const next = { ...form, avatarUrl: '' };
      setForm(next);
      await updateUser({ avatarUrl: '' });
      setInitialForm(next);
      setLastSavedAt(new Date());
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
    input.onchange = event => handleAvatarFile(event.target.files?.[0]);
    input.click();
  };

  const renderHeader = () => (
    <Header>
      <HeaderInner>
        <BackButton onClick={() => navigate(-1)} aria-label="Back">&lt;</BackButton>
        <TitleBlock>
          <Eyebrow>Shopply account</Eyebrow>
          <Title>Edit Profile</Title>
        </TitleBlock>
        <SaveButton onClick={handleSave} disabled={!isDirty || !isValid || saving}>
          {saving ? 'Saving...' : 'Save'}
        </SaveButton>
      </HeaderInner>
    </Header>
  );

  if (userLoading && !formReady) {
    return (
      <Container>
        {renderHeader()}
        <Content>
          <Section>
            <SectionTitle>Loading profile...</SectionTitle>
            <SectionText>Your account details are being prepared.</SectionText>
          </Section>
        </Content>
        <BottomNavigation currentPath="/profile" />
      </Container>
    );
  }

  return (
    <Container>
      {renderHeader()}
      <Content>
        <Section aria-label="Profile photo">
          <PhotoLayout>
            <AvatarOuterRing $isUploading={uploadingAvatar}>
              <AvatarCircle aria-label="Profile photo">
                {form.avatarUrl ? <AvatarImage src={form.avatarUrl} alt="Profile" /> : currentInitials}
              </AvatarCircle>
              <AvatarMenuWrapper>
                <AvatarEditButton
                  type="button"
                  onClick={() => setShowAvatarMenu(prev => !prev)}
                  aria-label="Edit profile photo"
                >
                  Edit
                </AvatarEditButton>
                {showAvatarMenu && (
                  <AvatarMenu>
                    <AvatarMenuItem type="button" onClick={handleChooseFromGallery}>
                      Choose from gallery
                    </AvatarMenuItem>
                    {form.avatarUrl && (
                      <AvatarMenuItem type="button" onClick={handleRemoveAvatar}>
                        Remove photo
                      </AvatarMenuItem>
                    )}
                  </AvatarMenu>
                )}
              </AvatarMenuWrapper>
            </AvatarOuterRing>

            <div>
              <SectionTitle>{`${form.firstName || 'Your'} ${form.lastName || 'profile'}`.trim()}</SectionTitle>
              <SectionText>Keep your Shopply profile current so sellers, delivery updates, and account security all have the right details.</SectionText>
              <SummaryGrid>
                <SummaryPill>
                  <SummaryLabel>Email</SummaryLabel>
                  <SummaryValue>{form.email || 'Not added'}</SummaryValue>
                </SummaryPill>
                <SummaryPill>
                  <SummaryLabel>Mobile</SummaryLabel>
                  <SummaryValue>{form.mobile || 'Not added'}</SummaryValue>
                </SummaryPill>
                <SummaryPill>
                  <SummaryLabel>Status</SummaryLabel>
                  <SummaryValue>{isDirty ? 'Unsaved changes' : 'Up to date'}</SummaryValue>
                </SummaryPill>
              </SummaryGrid>
            </div>
          </PhotoLayout>
        </Section>

        <Section aria-label="Profile information">
          <FieldsGrid>
            <Row>
              <InputWrapper>
                <InputLabel htmlFor="first-name">First name</InputLabel>
                <Input
                  id="first-name"
                  value={form.firstName}
                  onChange={event => handleFieldChange('firstName', event.target.value)}
                  onBlur={maybeAutoSave}
                  placeholder="First name"
                  autoComplete="given-name"
                  $error={!!errors.firstName}
                />
                {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="last-name">Last name</InputLabel>
                <Input
                  id="last-name"
                  value={form.lastName}
                  onChange={event => handleFieldChange('lastName', event.target.value)}
                  onBlur={maybeAutoSave}
                  placeholder="Last name"
                  autoComplete="family-name"
                  $error={!!errors.lastName}
                />
                {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
              </InputWrapper>
            </Row>

            <InputWrapper>
              <InputLabel htmlFor="email">Email address</InputLabel>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={event => handleFieldChange('email', event.target.value)}
                onBlur={maybeAutoSave}
                placeholder="you@example.com"
                autoComplete="email"
                $error={!!errors.email}
              />
              {errors.email ? (
                <ErrorMessage>{errors.email}</ErrorMessage>
              ) : (
                <HelperText>We'll only use this for account security and important updates.</HelperText>
              )}
            </InputWrapper>

            <InputWrapper>
              <InputLabel htmlFor="mobile">Mobile number</InputLabel>
              <Input
                id="mobile"
                type="tel"
                value={form.mobile}
                onChange={event => handleFieldChange('mobile', event.target.value)}
                onBlur={maybeAutoSave}
                placeholder="+27 71 234 5678"
                autoComplete="tel"
                $error={!!errors.mobile}
              />
              {errors.mobile ? (
                <ErrorMessage>{errors.mobile}</ErrorMessage>
              ) : (
                <HelperText>Use a number where you can receive SMS one-time codes.</HelperText>
              )}
            </InputWrapper>

            {lastSavedAt && (
              <HelperText>All changes saved | {lastSavedAt.toLocaleTimeString()}</HelperText>
            )}
          </FieldsGrid>
        </Section>
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};
