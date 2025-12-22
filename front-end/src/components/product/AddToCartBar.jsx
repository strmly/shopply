import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

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
  background: ${props => props.theme.colors.background};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  padding-bottom: calc(${props => props.theme.spacing.md} + env(safe-area-inset-bottom));
  z-index: 1000;
  box-shadow: ${props => props.theme.shadows.lg};
  backdrop-filter: blur(10px);
  animation: ${slideUp} 0.3s ease-out;
`;

const BarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  max-width: 600px;
  margin: 0 auto;
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Price = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 22px;
  line-height: 1.2;
`;

const PriceSubtext = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
`;

const StoreName = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  margin-top: 2px;
`;

const AddToCartButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => {
    if (props.disabled) return props.theme.colors.surface;
    if (props.$added) return props.theme.colors.successBase;
    return props.theme.colors.primary;
  }};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  position: relative;
  overflow: hidden;
  min-width: 140px;

  &:hover:not(:disabled) {
    background: ${props => props.$added 
      ? props.theme.colors.successBase 
      : props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Ripple = styled.span`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ${ripple} 0.6s ease-out;
  pointer-events: none;
`;

export const AddToCartBar = ({ product, selectedVariant, quantity, onAddToCart, stock, selectedStore }) => {
  const [added, setAdded] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  if (!product || !product.price) return null;

  const isOutOfStock = stock === 'out';
  const totalPrice = (product.price * quantity).toFixed(2);

  const handleClick = () => {
    if (isOutOfStock) return;

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
          <PriceSubtext>incl. VAT</PriceSubtext>
          {selectedStore && (
            <StoreName>From {selectedStore.name}</StoreName>
          )}
        </PriceSection>
        
        <AddToCartButton
          disabled={isOutOfStock || !selectedVariant}
          $added={added}
          onClick={handleClick}
        >
          {isOutOfStock 
            ? 'Out of Stock' 
            : !selectedVariant && product.variants && product.variants.length > 0
              ? 'Select Variant'
              : added 
                ? 'Added ✓' 
                : 'Add to Cart'}
          {!isOutOfStock && selectedVariant && <Ripple key={rippleKey} />}
        </AddToCartButton>
      </BarContent>
    </Bar>
  );
};

