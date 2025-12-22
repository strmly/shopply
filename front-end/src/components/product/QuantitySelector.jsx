import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 600;
  font-size: 16px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  max-width: 200px;
`;

const QuantityButton = styled.button`
  width: 44px;
  height: 44px;
  border: 2px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.disabled 
    ? props.theme.colors.surface 
    : props.theme.colors.background};
  color: ${props => props.disabled 
    ? props.theme.colors.text.tertiary 
    : props.theme.colors.text.primary};
  font-size: 20px;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const QuantityDisplay = styled.div`
  flex: 1;
  text-align: center;
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 20px;
  min-width: 60px;
`;

const WarningText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.warningBase};
  margin-top: ${props => props.theme.spacing.sm};
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InfoText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.xs};
  font-size: 11px;
`;

export const QuantitySelector = ({ quantity, onQuantityChange, maxQuantity, stock, stockQuantity }) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const isMaxReached = quantity >= maxQuantity;
  const isOutOfStock = stock === 'out';
  const isLowStock = stock === 'low' || (stockQuantity && stockQuantity <= 5);

  return (
    <Container>
      <SectionTitle>Quantity</SectionTitle>
      <QuantityControls>
        <QuantityButton
          onClick={handleDecrease}
          disabled={quantity <= 1 || isOutOfStock}
        >
          −
        </QuantityButton>
        <QuantityDisplay>{quantity}</QuantityDisplay>
        <QuantityButton
          onClick={handleIncrease}
          disabled={isMaxReached || isOutOfStock}
        >
          +
        </QuantityButton>
      </QuantityControls>
      {isMaxReached && (
        <WarningText>
          ⚠️ Maximum quantity reached ({maxQuantity} available)
        </WarningText>
      )}
      {isLowStock && !isMaxReached && (
        <WarningText>
          ⚠️ Only {stockQuantity || 2} left near you
        </WarningText>
      )}
      {maxQuantity && maxQuantity <= 4 && (
        <InfoText>
          ℹ️ Max {maxQuantity} per customer
        </InfoText>
      )}
      {isOutOfStock && (
        <WarningText>
          ⚠️ This item is currently out of stock
        </WarningText>
      )}
    </Container>
  );
};

