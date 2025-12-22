import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const Container = styled.section`
  padding: 0 ${props => props.theme.spacing.xl} ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CurrentPrice = styled.span`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 32px;
  line-height: 1.2;
`;

const OriginalPrice = styled.span`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.tertiary};
  text-decoration: line-through;
  font-size: 20px;
`;

const SavingsBadge = styled.span`
  ${props => props.theme.typography.body2}
  background: ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.pill};
  font-weight: 700;
  font-size: 14px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const DiscountBadge = styled.span`
  ${props => props.theme.typography.body2}
  background: ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.pill};
  font-weight: 700;
  font-size: 14px;
`;

const PriceSignal = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase};
  margin-top: ${props => props.theme.spacing.xs};
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PriceDropSignal = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.info[600]};
  margin-top: ${props => props.theme.spacing.xs};
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.theme.colors.info[50]};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  width: fit-content;
`;

const ComparisonSignal = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.xs};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const PricingBlock = ({ product, location }) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountAmount = hasDiscount ? (product.originalPrice - product.price).toFixed(2) : null;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : null;

  // Mock price signals (in production, these would come from backend)
  const isBestPrice = hasDiscount;
  const priceDropped = hasDiscount; // Mock: assume if discounted, price dropped
  const betterThanNearby = hasDiscount; // Mock: assume if discounted, better than nearby

  return (
    <Container>
      <PriceRow>
        <CurrentPrice>R{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</CurrentPrice>
        {hasDiscount && (
          <>
            <OriginalPrice>R{product.originalPrice.toFixed(2)}</OriginalPrice>
            {discountAmount && (
              <SavingsBadge>Save R{discountAmount}</SavingsBadge>
            )}
            {discountPercent && (
              <DiscountBadge>-{discountPercent}%</DiscountBadge>
            )}
          </>
        )}
      </PriceRow>
      
      {isBestPrice && (
        <PriceSignal>
          ✓ Lowest price within 3 km
        </PriceSignal>
      )}
      
      {priceDropped && (
        <PriceDropSignal>
          📉 Price dropped 1 hour ago
        </PriceDropSignal>
      )}
      
      {betterThanNearby && (
        <ComparisonSignal>
          💰 Better price than 90% of nearby stores
        </ComparisonSignal>
      )}
    </Container>
  );
};

