import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  margin: ${props => props.theme.spacing.md} 0;
  animation: ${fadeIn} 0.3s ease-in;
`;

const StoreCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  border: 2px solid ${props => props.theme.colors.border.light};
  transition: ${props => props.theme.transitions.swift};
  cursor: pointer;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const StoreHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const StoreLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
`;

const StoreInfo = styled.div`
  flex: 1;
`;

const StoreName = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  font-weight: 700;
  font-size: 18px;
`;

const StoreRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const StoreDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const DetailLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
`;

const DetailValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const ViewStoreButton = styled.button`
  width: 100%;
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const VerifiedBadge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.successSoftBg};
  color: ${props => props.theme.colors.successBase};
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  font-size: 10px;
  margin-left: ${props => props.theme.spacing.xs};
`;

export const SellerModule = ({ product, location }) => {
  const distance = product.distance || product.storeLocation?.distance || 'N/A';
  const deliveryFee = distance < 2 ? 'Free' : 'R15';
  const rating = product.rating || 4.5;

  return (
    <Container>
      <StoreCard>
        <StoreHeader>
          <StoreLogo>🏪</StoreLogo>
          <StoreInfo>
            <StoreName>
              {product.storeName}
              <VerifiedBadge>✓ Verified</VerifiedBadge>
            </StoreName>
            <StoreRating>
              ⭐ {rating.toFixed(1)} ({product.reviewCount || 0} reviews)
            </StoreRating>
          </StoreInfo>
        </StoreHeader>
        
        <StoreDetails>
          <DetailRow>
            <DetailLabel>Distance</DetailLabel>
            <DetailValue>{distance}km away</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Delivery Fee</DetailLabel>
            <DetailValue>{deliveryFee}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Pickup Available</DetailLabel>
            <DetailValue>Yes • Same day</DetailValue>
          </DetailRow>
        </StoreDetails>
        
        <ViewStoreButton>
          View Store
        </ViewStoreButton>
      </StoreCard>
    </Container>
  );
};











