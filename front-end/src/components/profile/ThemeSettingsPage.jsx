import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { useThemeMode } from '../../theme/ThemeModeProvider.jsx';

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

const Intro = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.md};
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button`
  border-radius: ${props => props.theme.radii.lg};
  border: 1px solid
    ${props =>
      props.$active
        ? props.theme.colors.primary
        : props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md};
  background: ${props =>
    props.$active
      ? props.theme.colors.primarySoftBg
      : props.theme.colors.surface};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

const Preview = styled.div`
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.$variant === 'dark'
    ? 'radial-gradient(circle at top, #1f2937 0, #020617 55%, #020617 100%)'
    : 'linear-gradient(135deg, #f9fafb 0, #f3f4f6 40%, #e5e7eb 100%)'};
  padding: ${props => props.theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const PreviewBar = styled.div`
  height: 6px;
  border-radius: ${props => props.theme.radii.pill};
  background: ${props =>
    props.$accent
      ? props.theme.colors.primary
      : 'rgba(148, 163, 184, 0.5)'};
  width: ${props => props.$wide ? '80%' : '50%'};
`;

const OptionLabel = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 15px;
`;

const OptionHint = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const RadioRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
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

export const ThemeSettingsPage = () => {
  const navigate = useNavigate();
  const { mode, setMode } = useThemeMode();

  const handleSelect = (value) => {
    setMode(value);
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">
            ←
          </BackButton>
          <Title>Theme</Title>
        </HeaderLeft>
      </Header>

      <Content>
        <Intro>
          Choose how Shopply looks. You can match your device, stay light, or switch
          to a softer dark mode for low-light use.
        </Intro>
        <CardGrid>
          <Card
            type="button"
            $active={mode === 'system'}
            onClick={() => handleSelect('system')}
            aria-pressed={mode === 'system'}
          >
            <Preview $variant="light">
              <PreviewBar $wide $accent />
              <PreviewBar />
              <PreviewBar />
            </Preview>
            <RadioRow>
              <RadioOuter $active={mode === 'system'}>
                <RadioInner $active={mode === 'system'} />
              </RadioOuter>
              <OptionLabel>System Default</OptionLabel>
            </RadioRow>
            <OptionHint>Match your device appearance automatically.</OptionHint>
          </Card>

          <Card
            type="button"
            $active={mode === 'light'}
            onClick={() => handleSelect('light')}
            aria-pressed={mode === 'light'}
          >
            <Preview $variant="light">
              <PreviewBar $wide $accent />
              <PreviewBar />
              <PreviewBar />
            </Preview>
            <RadioRow>
              <RadioOuter $active={mode === 'light'}>
                <RadioInner $active={mode === 'light'} />
              </RadioOuter>
              <OptionLabel>Light</OptionLabel>
            </RadioRow>
            <OptionHint>Bright background for daytime readability.</OptionHint>
          </Card>

          <Card
            type="button"
            $active={mode === 'dark'}
            onClick={() => handleSelect('dark')}
            aria-pressed={mode === 'dark'}
          >
            <Preview $variant="dark">
              <PreviewBar $wide $accent />
              <PreviewBar />
              <PreviewBar />
            </Preview>
            <RadioRow>
              <RadioOuter $active={mode === 'dark'}>
                <RadioInner $active={mode === 'dark'} />
              </RadioOuter>
              <OptionLabel>Dark</OptionLabel>
            </RadioRow>
            <OptionHint>Softer contrast for low-light environments.</OptionHint>
          </Card>
        </CardGrid>
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};


