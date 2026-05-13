import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.025);
  }
`;

const Container = styled.section`
  padding: 22px 24px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 24px;
  box-shadow: 0 16px 34px rgba(16, 24, 40, 0.07);
  animation: ${fadeIn} 0.3s ease-in;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
`;

const CurrentPrice = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(32px, 5vw, 44px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
`;

const OriginalPrice = styled.span`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.tertiary};
  text-decoration: line-through;
  font-weight: 700;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const SavingsBadge = styled.span`
  ${props => props.theme.typography.body2}
  background: ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.text.inverse};
  padding: 7px 11px;
  border-radius: 999px;
  font-weight: 800;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const DiscountBadge = styled.span`
  ${props => props.theme.typography.body2}
  background: #ffffff;
  color: ${props => props.theme.colors.dangerBase};
  border: 1px solid ${props => props.theme.colors.danger[100]};
  padding: 7px 11px;
  border-radius: 999px;
  font-weight: 800;
`;

const FlashBadge = styled.span`
  ${props => props.theme.typography.body2}
  background: ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.text.inverse};
  padding: 7px 11px;
  border-radius: 999px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const SignalGrid = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 14px;
`;

const Signal = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.$tone === 'success'
    ? props.theme.colors.successBase
    : props.$tone === 'info'
      ? props.theme.colors.info[600]
      : props.theme.colors.text.secondary};
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 14px;
  padding: 9px 11px;
  font-weight: 800;
`;

export const PricingBlock = ({ product }) => {
  const isFlashDeal = product.flashDealPrice != null;
  const currentPrice = isFlashDeal ? product.flashDealPrice : product.price;
  const originalPrice = isFlashDeal
    ? product.price
    : (product.originalPrice && product.originalPrice > product.price ? product.originalPrice : null);

  const hasDiscount = originalPrice != null && originalPrice > currentPrice;
  const discountAmount = hasDiscount ? (originalPrice - currentPrice).toFixed(2) : null;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  const displayPrice = typeof currentPrice === 'number' ? currentPrice.toFixed(2) : currentPrice;

  return (
    <Container>
      <PriceRow>
        <CurrentPrice>R{displayPrice}</CurrentPrice>
        {hasDiscount && <OriginalPrice>R{parseFloat(originalPrice).toFixed(2)}</OriginalPrice>}
      </PriceRow>

      {(hasDiscount || isFlashDeal) && (
        <BadgeRow>
          {isFlashDeal && <FlashBadge>⚡ Flash Deal</FlashBadge>}
          {discountAmount && <SavingsBadge>Save R{discountAmount}</SavingsBadge>}
          {discountPercent && <DiscountBadge>{discountPercent}% off</DiscountBadge>}
        </BadgeRow>
      )}

      {hasDiscount && (
        <SignalGrid>
          <Signal $tone="success">Lowest price within 3 km</Signal>
          <Signal $tone="info">Price dropped recently</Signal>
          <Signal>Better price than most nearby stores</Signal>
        </SignalGrid>
      )}
    </Container>
  );
};
