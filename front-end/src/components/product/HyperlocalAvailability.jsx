import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  margin: ${props => props.theme.spacing.md} 0;
  border-radius: ${props => props.theme.radii.lg};
  animation: ${fadeIn} 0.3s ease-in;
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 600;
  font-size: 16px;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const InfoIcon = styled.span`
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.primarySoftBg};
  border-radius: ${props => props.theme.radii.md};
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
`;

const InfoSubtext = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const StockIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => {
    if (props.stock === 'low') return props.theme.colors.warningSoftBg;
    if (props.stock === 'out') return props.theme.colors.dangerSoftBg;
    return props.theme.colors.successSoftBg;
  }};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  color: ${props => {
    if (props.stock === 'low') return props.theme.colors.warningBase;
    if (props.stock === 'out') return props.theme.colors.dangerBase;
    return props.theme.colors.successBase;
  }};
`;

const StockDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.stock === 'low') return props.theme.colors.warningBase;
    if (props.stock === 'out') return props.theme.colors.dangerBase;
    return props.theme.colors.successBase;
  }};
`;

export const HyperlocalAvailability = ({ product, location }) => {
  const distance = product.distance || product.storeLocation?.distance || 'N/A';
  const suburb = location?.suburb || 'your area';
  const stockText = product.stock === 'in' 
    ? `${product.stockQuantity || '12'} in stock`
    : product.stock === 'low'
      ? `Low stock: ${product.stockQuantity || 2} left`
      : 'Out of stock';

  return (
    <Container>
      <SectionTitle>📍 Availability & Delivery</SectionTitle>
      <InfoGrid>
        <InfoRow>
          <InfoIcon>📍</InfoIcon>
          <InfoContent>
            <InfoLabel>{product.storeName}</InfoLabel>
            <InfoSubtext>{distance}km away from {suburb}</InfoSubtext>
          </InfoContent>
        </InfoRow>
        
        <InfoRow>
          <InfoIcon>🚚</InfoIcon>
          <InfoContent>
            <InfoLabel>Deliver today</InfoLabel>
            <InfoSubtext>Order by 3pm for same-day delivery</InfoSubtext>
          </InfoContent>
        </InfoRow>
        
        <InfoRow>
          <InfoIcon>📦</InfoIcon>
          <InfoContent>
            <InfoLabel>Stock Status</InfoLabel>
            <StockIndicator stock={product.stock}>
              <StockDot stock={product.stock} />
              {stockText}
            </StockIndicator>
          </InfoContent>
        </InfoRow>
        
        {product.socialProof && (
          <InfoRow>
            <InfoIcon>🔥</InfoIcon>
            <InfoContent>
              <InfoLabel>{product.socialProof}</InfoLabel>
              <InfoSubtext>Trending in {suburb}</InfoSubtext>
            </InfoContent>
          </InfoRow>
        )}
        
        {product.restockedAt && (
          <InfoRow>
            <InfoIcon>🔄</InfoIcon>
            <InfoContent>
              <InfoLabel>Restocked 2 hours ago</InfoLabel>
              <InfoSubtext>Fresh stock available</InfoSubtext>
            </InfoContent>
          </InfoRow>
        )}
        
        {product.distance && product.distance < 1 && (
          <InfoRow>
            <InfoIcon>⚡</InfoIcon>
            <InfoContent>
              <InfoLabel>Fastest delivery option</InfoLabel>
              <InfoSubtext>Closest store to you</InfoSubtext>
            </InfoContent>
          </InfoRow>
        )}
        
        {product.pickupAvailable && (
          <InfoRow>
            <InfoIcon>🏪</InfoIcon>
            <InfoContent>
              <InfoLabel>Pickup available at no extra cost</InfoLabel>
              <InfoSubtext>Collect from store today</InfoSubtext>
            </InfoContent>
          </InfoRow>
        )}
      </InfoGrid>
    </Container>
  );
};

