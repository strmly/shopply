import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { Button } from '../../ui/Button';

const Container = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const Illustration = styled.div`
  width: 200px;
  height: 200px;
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120px;
  animation: ${fadeIn} 0.5s ease-in;
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 32px;
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.2;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 16px;
  margin-bottom: ${props => props.theme.spacing.xxl};
  line-height: 1.6;
  max-width: 400px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
  max-width: 320px;
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid ${props => props.theme.colors.border.default};
  
  &:hover {
    background: ${props => props.theme.colors.surface};
    border-color: ${props => props.theme.colors.border.default};
  }
`;

const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primarySoftBg};
  border-radius: ${props => props.theme.radii.lg};
  width: 100%;
  max-width: 400px;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  text-align: left;
`;

export const WelcomeScreen = ({ onNext, onSignIn }) => {
  return (
    <Container>
      <Illustration>🏪</Illustration>
      
      <Title>Sell to your neighborhood—fast.</Title>
      
      <Subtitle>
        Join hundreds of local sellers delivering to nearby customers. 
        Set up your store in minutes and start selling today.
      </Subtitle>

      <BenefitsList>
        <BenefitItem>
          <span>✓</span>
          <span>Reach customers in your area instantly</span>
        </BenefitItem>
        <BenefitItem>
          <span>✓</span>
          <span>Simple setup—no technical skills needed</span>
        </BenefitItem>
        <BenefitItem>
          <span>✓</span>
          <span>Get paid weekly with secure payouts</span>
        </BenefitItem>
      </BenefitsList>

      <ButtonGroup>
        <Button 
          variant="primary" 
          onClick={onNext}
          $fullWidth
        >
          Create Seller Account
        </Button>
        {onSignIn && (
          <SecondaryButton 
            onClick={onSignIn}
            $fullWidth
          >
            Already a seller? Sign in
          </SecondaryButton>
        )}
      </ButtonGroup>
    </Container>
  );
};
