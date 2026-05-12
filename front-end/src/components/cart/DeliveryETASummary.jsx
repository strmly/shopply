import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: 18px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 24px;
  animation: ${fadeIn} 0.3s ease-in;
  box-shadow: 0 14px 32px rgba(16, 24, 40, 0.06);
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const InfoTile = styled.div`
  display: grid;
  gap: 5px;
  padding: 14px;
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 18px;
`;

const InfoLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
  text-transform: uppercase;
`;

const InfoValue = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
`;

const OptimizeButton = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid rgba(61, 129, 239, 0.28);
  color: ${props => props.theme.colors.primarySoftText};
  border-radius: 999px;
  ${props => props.theme.typography.body2}
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.gradient.primary};
    color: ${props => props.theme.colors.text.inverse};
  }
`;

export const DeliveryETASummary = ({ cart }) => {
  const isMultiStore = cart.storeGroups && cart.storeGroups.length > 1;
  const deliveryFee = cart.totals?.deliveryFee || 0;

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
      <InfoGrid>
        <InfoTile>
          <InfoLabel>{isMultiStore ? 'Multi-store ETA' : 'Delivery ETA'}</InfoLabel>
          <InfoValue>{etaText}</InfoValue>
        </InfoTile>
        <InfoTile>
          <InfoLabel>Delivery fee</InfoLabel>
          <InfoValue>R{deliveryFee.toFixed(2)}{isMultiStore ? ' consolidated' : ''}</InfoValue>
        </InfoTile>
      </InfoGrid>

      {isMultiStore && <OptimizeButton>Optimize delivery</OptimizeButton>}
    </Container>
  );
};
