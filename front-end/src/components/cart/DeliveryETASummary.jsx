import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background};
  margin: ${props => props.theme.spacing.md} 0;
  border-radius: ${props => props.theme.radii.lg};
  border: 2px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
`;

const InfoIcon = styled.span`
  font-size: 20px;
`;

const InfoValue = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
  text-align: right;
`;

const OptimizeButton = styled.button`
  width: 100%;
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primarySoftBg};
  border: 2px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: 14px;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.text.inverse};
  }
`;

export const DeliveryETASummary = ({ cart, deliveryMethod }) => {
  const isMultiStore = cart.storeGroups && cart.storeGroups.length > 1;
  const deliveryFee = cart.totals?.deliveryFee || 0;
  
  // Calculate ETA range for multi-store
  let etaText = 'Today, 4-6 PM';
  if (isMultiStore && cart.storeGroups) {
    const etas = cart.storeGroups.map(g => g.eta).filter(Boolean);
    if (etas.length > 0) {
      etaText = `Today, ${etas[0].split(' ')[1] || '4-6 PM'}`;
      if (etas.length > 1) {
        const lastEta = etas[etas.length - 1].split(' ')[1] || '7 PM';
        etaText = `Today, ${etas[0].split(' ')[1] || '4 PM'}-${lastEta}`;
      }
    }
  } else if (cart.storeGroups && cart.storeGroups[0]) {
    etaText = cart.storeGroups[0].eta || 'Today, 4-6 PM';
  }

  return (
    <Container>
      <InfoRow>
        <InfoLabel>
          <InfoIcon>🚚</InfoIcon>
          {isMultiStore ? 'Multi-store delivery ETA:' : 'Delivery ETA:'}
        </InfoLabel>
        <InfoValue>{etaText}</InfoValue>
      </InfoRow>
      
      <InfoRow>
        <InfoLabel>
          <InfoIcon>💸</InfoIcon>
          Delivery Fee:
        </InfoLabel>
        <InfoValue>
          R{deliveryFee.toFixed(2)}
          {isMultiStore && (
            <span style={{ fontSize: '12px', color: 'gray', marginLeft: '4px' }}>
              (consolidated)
            </span>
          )}
        </InfoValue>
      </InfoRow>

      {isMultiStore && (
        <OptimizeButton>
          Optimize Delivery
        </OptimizeButton>
      )}
    </Container>
  );
};











