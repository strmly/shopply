import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { Button } from '../ui';

const Container = styled.div`
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.gradient.soft};
  animation: ${fadeIn} 0.5s ease-in;
  overflow: hidden;
  box-sizing: border-box;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.md};
  text-align: center;
  width: 100%;
  flex-shrink: 0;
`;

const Logo = styled.div`
  font-size: 42px;
  font-weight: 700;
  background: ${props => props.theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${fadeIn} 0.8s ease-in;
  line-height: 1.1;
  word-wrap: break-word;
  margin: 0;
`;

const Tagline = styled.p`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  max-width: 400px;
  line-height: 1.2;
  margin: 0;
  word-wrap: break-word;
  font-size: 18px;
`;

const MiddleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex: 1;
  justify-content: center;
  max-width: 500px;
  width: 100%;
  padding: 0;
  min-height: 0;
  overflow: hidden;
`;

const Illustration = styled.div`
  width: 100%;
  max-width: 200px;
  aspect-ratio: 1;
  background: ${props => props.theme.colors.gradient.primary};
  border-radius: ${props => props.theme.radii.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.lg};
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  &::before {
    content: '🏪';
    font-size: 80px;
    opacity: 0.3;
  }
  
  @media (max-width: 400px) {
    max-width: 180px;
    
    &::before {
      font-size: 70px;
    }
  }
`;

const Benefits = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  width: 100%;
  flex-shrink: 0;
  align-items: center;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.md};
  box-shadow: ${props => props.theme.shadows.xs};
  flex-shrink: 0;
  width: 100%;
  max-width: 350px;
`;

const BenefitIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const BenefitText = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 14px;
  line-height: 1.3;
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  width: 100%;
  max-width: 400px;
  margin-bottom: ${props => props.theme.spacing.md};
  flex-shrink: 0;
`;

const GuestLink = styled.button`
  ${props => props.theme.typography.body2}
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.md};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const Headline = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  line-height: 1.2;
  font-size: 32px;
`;

const Subtext = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
`;

const SubtextLine = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
`;

const SignInLink = styled.button`
  ${props => props.theme.typography.caption}
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.tertiary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.xs};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

export const WelcomeScreen = ({ onContinue, onBrowseAsGuest, onSignIn }) => {
  return (
    <Container>
      <TopSection>
        <Logo>Shopply</Logo>
        <Headline>Shop your neighborhood.</Headline>
        <Subtext>
          <SubtextLine>Find thousands of products from stores nearby.</SubtextLine>
          <SubtextLine>Fast delivery. Live availability. Local prices.</SubtextLine>
        </Subtext>
      </TopSection>

      <MiddleSection>
        <Illustration />
        <Benefits>
          <BenefitItem>
            <BenefitIcon>🏪</BenefitIcon>
            <BenefitText>Find shops closest to you</BenefitText>
          </BenefitItem>
          <BenefitItem>
            <BenefitIcon>🚚</BenefitIcon>
            <BenefitText>Get accurate delivery times</BenefitText>
          </BenefitItem>
          <BenefitItem>
            <BenefitIcon>📦</BenefitIcon>
            <BenefitText>See items in stock nearby</BenefitText>
          </BenefitItem>
        </Benefits>
      </MiddleSection>

      <BottomSection>
        <Button variant="primary" $fullWidth onClick={onContinue}>
          Get Started
        </Button>
        <GuestLink onClick={onBrowseAsGuest}>
          Browse as Guest
        </GuestLink>
        {onSignIn && (
          <SignInLink onClick={onSignIn}>
            Already have an account? Sign in
          </SignInLink>
        )}
      </BottomSection>
    </Container>
  );
};

