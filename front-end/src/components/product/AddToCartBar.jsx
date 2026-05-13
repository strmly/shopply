import { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const Bar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.86);
  border-top: 1px solid rgba(228, 231, 236, 0.9);
  padding: 14px min(5vw, 48px);
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  z-index: 1000;
  box-shadow: 0 -20px 48px rgba(16, 24, 40, 0.12);
  backdrop-filter: blur(18px);
  animation: ${slideUp} 0.3s ease-out;
`;

const BarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  max-width: 1180px;
  margin: 0 auto;
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const Price = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 24px;
  line-height: 1.1;
`;

const PriceSubtext = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
`;

const StoreName = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 42vw;
`;

const AddToCartButton = styled.button`
  flex: 1;
  max-width: 420px;
  padding: 16px 24px;
  background: ${props => {
    if (props.disabled) return props.theme.colors.neutral[200];
    if (props.$added) return props.theme.colors.successBase;
    return props.theme.colors.text.primary;
  }};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: 999px;
  ${props => props.theme.typography.button}
  font-weight: 800;
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  position: relative;
  overflow: hidden;
  min-width: 150px;
  box-shadow: 0 18px 34px rgba(16, 24, 40, 0.18);

  &:hover:not(:disabled) {
    background: ${props => props.$added ? props.theme.colors.successBase : props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 22px 42px rgba(16, 24, 40, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const FlashLabel = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.dangerBase};
  font-weight: 800;
  font-size: 11px;
`;

const OriginalPrice = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  text-decoration: line-through;
  font-size: 13px;
`;

const Ripple = styled.span`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ${ripple} 0.6s ease-out;
  pointer-events: none;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;

export const AddToCartBar = ({ product, selectedVariant, quantity, onAddToCart, stock, selectedStore }) => {
  const [added, setAdded] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  if (!product || !product.price) return null;

  const isOutOfStock = stock === 'out';
  const hasVariants = product.variants && product.variants.length > 0;
  const needsVariantSelection = hasVariants && !selectedVariant;
  const isFlashDeal = product.flashDealPrice != null;
  const unitPrice = isFlashDeal ? product.flashDealPrice : product.price;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const handleClick = () => {
    if (isOutOfStock || needsVariantSelection) return;

    setRippleKey(prev => prev + 1);
    onAddToCart();
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <Bar>
      <BarContent>
        <PriceSection>
          <Price>R{totalPrice}</Price>
          {isFlashDeal && (
            <>
              <FlashLabel>Flash Deal</FlashLabel>
              <OriginalPrice>R{(product.price * quantity).toFixed(2)}</OriginalPrice>
            </>
          )}
          {!isFlashDeal && <PriceSubtext>incl. VAT</PriceSubtext>}
          {selectedStore && <StoreName>From {selectedStore.name}</StoreName>}
        </PriceSection>

        <AddToCartButton
          disabled={isOutOfStock || needsVariantSelection}
          $added={added}
          onClick={handleClick}
        >
          {isOutOfStock
            ? 'Out of stock'
            : needsVariantSelection
              ? 'Select variant'
              : added
                ? 'Added'
                : 'Add to cart'}
          {!isOutOfStock && !needsVariantSelection && <Ripple key={rippleKey} />}
        </AddToCartButton>
      </BarContent>
    </Bar>
  );
};
