import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';

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
  gap: ${props => props.theme.spacing.md};
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

const Hint = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

export const NotificationSettingsPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)} aria-label="Back">
            ←
          </BackButton>
          <Title>Notification Settings</Title>
        </HeaderLeft>
      </Header>

      <Content>
        <Card>
          <Heading>Stay in control</Heading>
          <Text>
            Detailed notification controls are coming soon. You’ll be able to
            fine-tune order updates, promotions, and community activity so they
            feel helpful, not noisy.
          </Text>
          <Hint>
            For now, Tsenga only sends essential, low-frequency notifications
            related to orders and account safety.
          </Hint>
        </Card>
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};


