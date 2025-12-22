import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';

import API_BASE_URL from '@config/api';
const DEFAULT_USER_ID = 'default';

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
  gap: ${props => props.theme.spacing.lg};
`;

const Intro = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.md};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: ${props => props.theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.theme.colors.surface};
`;

const ListItem = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props =>
    props.$active ? props.theme.colors.primarySoftBg : props.theme.colors.background};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const LanguageLabel = styled.span`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const RadioOuter = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid
    ${props =>
      props.$active
        ? props.theme.colors.primary
        : props.theme.colors.border.default};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const RadioInner = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${props =>
    props.$active ? props.theme.colors.primary : 'transparent'};
`;

const Banner = styled.div`
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.info[100]};
  border: 1px solid ${props => props.theme.colors.info[400]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const BannerText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
`;

const BannerActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const BannerButton = styled.button`
  padding: 6px 12px;
  border-radius: ${props => props.theme.radii.pill};
  border: 1px solid
    ${props =>
      props.$primary
        ? props.theme.colors.primary
        : props.theme.colors.border.default};
  background: ${props =>
    props.$primary ? props.theme.colors.primary : props.theme.colors.background};
  color: ${props =>
    props.$primary
      ? props.theme.colors.text.inverse
      : props.theme.colors.text.primary};
  cursor: pointer;
  ${props => props.theme.typography.button}
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    opacity: 0.96;
    transform: translateY(-0.5px);
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.neutral[950]};
  color: ${props => props.theme.colors.text.inverse};
  padding: 8px 14px;
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.caption}
  font-size: 12px;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const languages = [
  { code: 'en', label: 'English' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'zu', label: 'isiZulu' },
  { code: 'xh', label: 'isiXhosa' },
  { code: 'st', label: 'Sesotho' },
];

const normalizeNavigatorLanguage = (navLang) => {
  if (!navLang) return 'en';
  const lower = navLang.toLowerCase();
  if (lower.startsWith('af')) return 'af';
  if (lower.startsWith('zu')) return 'zu';
  if (lower.startsWith('xh')) return 'xh';
  if (lower.startsWith('st')) return 'st';
  return 'en';
};

export const LanguageSettingsPage = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [pendingLanguage, setPendingLanguage] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadLanguage = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/profile/${DEFAULT_USER_ID}/preferences`
        );
        if (!response.ok) {
          return;
        }
        const json = await response.json();
        if (!json.success || !json.data) return;

        const fromApi = json.data.language;
        if (isMounted && typeof fromApi === 'string') {
          setCurrentLanguage(fromApi);
        } else if (isMounted) {
          const inferred = normalizeNavigatorLanguage(navigator.language);
          setCurrentLanguage(inferred);
        }
      } catch {
        if (isMounted) {
          const inferred = normalizeNavigatorLanguage(navigator.language);
          setCurrentLanguage(inferred);
        }
      }
    };

    loadLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentLanguageLabel = useMemo(() => {
    const found = languages.find(l => l.code === currentLanguage);
    return found ? found.label : 'English';
  }, [currentLanguage]);

  const handleSelect = (code) => {
    if (code === currentLanguage) return;
    setPendingLanguage(code);
  };

  const handleConfirm = async () => {
    if (!pendingLanguage) return;

    const previous = currentLanguage;
    setCurrentLanguage(pendingLanguage);
    setPendingLanguage(null);

    try {
      await fetch(`${API_BASE_URL}/profile/${DEFAULT_USER_ID}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: pendingLanguage }),
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      // In a real multilingual app, this would reload translated strings.
      // For now we keep it smooth and avoid a hard refresh.
    } catch {
      // Roll back on failure
      setCurrentLanguage(previous);
    }
  };

  const handleCancel = () => {
    setPendingLanguage(null);
  };

  const bannerLanguageLabel = useMemo(() => {
    if (!pendingLanguage) return '';
    const found = languages.find(l => l.code === pendingLanguage);
    return found ? found.label : '';
  }, [pendingLanguage]);

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">
            ←
          </BackButton>
          <Title>Language</Title>
        </HeaderLeft>
      </Header>

      <Content>
        <Intro>
          Pick the language you’d like Shopply to use. Changing this won’t affect
          your orders or saved data.
        </Intro>
        <List role="radiogroup" aria-label="App language">
          {languages.map(lang => {
            const isActive =
              (pendingLanguage || currentLanguage) === lang.code;
            return (
              <ListItem
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                $active={isActive}
                role="radio"
                aria-checked={currentLanguage === lang.code}
              >
                <LanguageLabel>
                  {lang.label}
                  {currentLanguage === lang.code ? ' (current)' : ''}
                </LanguageLabel>
                <RadioOuter $active={currentLanguage === lang.code}>
                  <RadioInner $active={currentLanguage === lang.code} />
                </RadioOuter>
              </ListItem>
            );
          })}
        </List>

        {pendingLanguage && (
          <Banner>
            <BannerText>
              Switch app language to {bannerLanguageLabel}?
            </BannerText>
            <BannerActions>
              <BannerButton $primary type="button" onClick={handleConfirm}>
                Confirm
              </BannerButton>
              <BannerButton type="button" onClick={handleCancel}>
                Cancel
              </BannerButton>
            </BannerActions>
          </Banner>
        )}

        {!pendingLanguage && (
          <Banner>
            <BannerText>
              Current language: {currentLanguageLabel}. You can safely change it
              at any time—nothing about your data or orders will change.
            </BannerText>
          </Banner>
        )}
      </Content>

      {showToast && <Toast>Language updated</Toast>}

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};


