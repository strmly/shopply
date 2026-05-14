import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import { useThemeMode } from '../../theme/ThemeModeProvider.jsx';
import { toast } from '../ui/Toast';

const Page = styled.div`
  min-height: 100vh;
  padding-bottom: 104px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 50%, #ffffff 100%);
  animation: ${fadeIn} 0.35s ease;
`;

const Shell = styled.main`
  width: min(900px, calc(100% - 32px));
  margin: 0 auto;
  padding: 18px 0 28px;

  @media (max-width: 560px) {
    width: min(100% - 22px, 900px);
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

const Grid = styled.section`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button`
  min-height: 230px;
  padding: 18px;
  border-radius: 24px;
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.32)' : props.theme.colors.border.default};
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : '#ffffff'};
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.07);
  display: grid;
  gap: 14px;
  text-align: left;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Preview = styled.div`
  height: 104px;
  border-radius: 18px;
  border: 1px solid rgba(61, 129, 239, 0.14);
  background: ${props => {
    if (props.$mode === 'dark') return 'linear-gradient(135deg, #0D1C33, #143056)';
    if (props.$mode === 'system') return 'linear-gradient(135deg, #ffffff 0%, #f1f7ff 48%, #143056 49%, #0d1c33 100%)';
    return 'linear-gradient(135deg, #ffffff, #f1f7ff)';
  }};
  padding: 14px;
`;

const Line = styled.div`
  height: 8px;
  width: ${props => props.$wide ? '78%' : '48%'};
  margin-bottom: 8px;
  border-radius: 999px;
  background: ${props => props.$accent ? props.theme.colors.primary : 'rgba(126, 193, 246, 0.7)'};
`;

const CardTitle = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 17px;
  font-weight: 900;
`;

const CardText = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.45;
  font-weight: 750;
`;

const Badge = styled.span`
  width: fit-content;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: #ffffff;
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.16);
  font-size: 11px;
  font-weight: 900;
`;

const options = [
  { value: 'system', title: 'System', text: 'Match the device appearance automatically.' },
  { value: 'light', title: 'Light', text: 'Bright Tsenga surfaces for daytime browsing.' },
  { value: 'dark', title: 'Dark', text: 'A calmer low-light preference saved to your profile.' },
];

export const ThemeSettingsPage = () => {
  const navigate = useNavigate();
  const { mode, setMode } = useThemeMode();

  const select = (value) => {
    setMode(value);
    toast.success('Theme saved');
  };

  return (
    <Page>
      <Shell>
        <Hero>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">&lt;</BackButton>
          <div>
            <Title>Theme</Title>
            <Subtext>Choose how Tsenga should feel across your shopping and seller tools.</Subtext>
          </div>
        </Hero>

        <Grid>
          {options.map((option) => (
            <Card key={option.value} $active={mode === option.value} onClick={() => select(option.value)}>
              <Preview $mode={option.value}>
                <Line $wide $accent />
                <Line />
                <Line $wide />
              </Preview>
              <div>
                <CardTitle>{option.title}</CardTitle>
                <CardText>{option.text}</CardText>
              </div>
              <Badge>{mode === option.value ? 'Selected' : option.value}</Badge>
            </Card>
          ))}
        </Grid>
      </Shell>
      <BottomNavigation currentPath="/profile" />
    </Page>
  );
};
