import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.sm};
`;

const ContactButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.primary};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ContactOptions = ({ courier, storeGroups, orderId }) => {
  const canContactCourier = courier && courier.phone;

  const handleCallCourier = () => {
    if (courier?.phone) {
      window.location.href = `tel:${courier.phone}`;
    }
  };

  const handleMessageCourier = () => {
    if (courier?.phone) {
      const message = encodeURIComponent(`Hi ${courier.name}, I have a question about my order #${orderId?.slice(-8)}.`);
      window.location.href = `sms:${courier.phone}?body=${message}`;
    }
  };

  const handleCallStore = () => {
    if (storeGroups && storeGroups.length > 0) {
      alert(`Calling ${storeGroups[0].storeName}...`);
    }
  };

  const handleChatSupport = () => {
    alert('Chat with Support feature coming soon');
  };

  return (
    <Card>
      <Title>📞 Contact Options</Title>
      
      <ButtonGrid>
        {canContactCourier && (
          <>
            <ContactButton onClick={handleMessageCourier}>
              💬 Message Courier
            </ContactButton>
            <ContactButton onClick={handleCallCourier}>
              📞 Call Courier
            </ContactButton>
          </>
        )}
        
        {storeGroups && storeGroups.length > 0 && (
          <ContactButton onClick={handleCallStore}>
            🏪 Call Store
          </ContactButton>
        )}
        
        <ContactButton onClick={handleChatSupport}>
          💬 Chat Support
        </ContactButton>
      </ButtonGrid>
    </Card>
  );
};











