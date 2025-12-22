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
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Intro = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Card = styled.button`
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.lg};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
    transform: translateY(-1px);
  }
`;

const CardTitle = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const CardSubtitle = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const MetaText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

export const ContactSupportPage = () => {
  const navigate = useNavigate();

  const appVersion = 'v1.0.0';
  const deviceInfo = `${navigator.platform} • ${navigator.userAgent}`;

  const buildSupportContext = () =>
    encodeURIComponent(
      `\n\n---\nOrder ID: (optional)\nApp version: ${appVersion}\nDevice: ${deviceInfo}`
    );

  const handleChat = () => {
    // Placeholder: would open in-app chat; for now we navigate to email as fallback
    window.location.href = `mailto:support@shopply.app?subject=Chat%20with%20support&body=${buildSupportContext()}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:support@shopply.app?subject=Support%20request&body=${buildSupportContext()}`;
  };

  const handleCall = () => {
    window.location.href = 'tel:+27110000000';
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)} aria-label="Back">
          ←
        </BackButton>
        <Title>Contact Support</Title>
      </Header>

      <Content>
        <Intro>
          Need a human? Our support team is here to help with orders, payments, and
          technical issues. No bots pretending to be people.
        </Intro>

        <CardList>
          <Card type="button" onClick={handleChat}>
            <CardTitle>💬 Chat with Support</CardTitle>
            <CardSubtitle>
              Start a conversation and we’ll reply as soon as we’re online.
            </CardSubtitle>
          </Card>

          <Card type="button" onClick={handleEmail}>
            <CardTitle>📧 Email Support</CardTitle>
            <CardSubtitle>
              Open a pre-filled email with helpful context attached.
            </CardSubtitle>
          </Card>

          <Card type="button" onClick={handleCall}>
            <CardTitle>📞 Call Support</CardTitle>
            <CardSubtitle>Use your device dialer to call our support line.</CardSubtitle>
          </Card>
        </CardList>

        <MetaText>Usually replies within 2 hours during business days.</MetaText>
      </Content>

      <BottomNavigation currentPath="/profile" />
    </Container>
  );
};


