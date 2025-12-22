import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  display: flex;
  gap: ${props => props.theme.spacing.md};
  animation: ${props => props.removing ? slideOut : fadeIn} 0.3s ease-out;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const ImageContainer = styled.div`
  width: 100px;
  height: 100px;
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
  background: ${props => props.theme.colors.surface};
  flex-shrink: 0;
  cursor: pointer;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: ${props => props.theme.colors.gradient.soft};
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  min-width: 0;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.sm};
`;

const Title = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};
  flex-shrink: 0;

  &:hover {
    color: ${props => props.theme.colors.dangerBase};
    transform: scale(1.1);
  }
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const CurrentPrice = styled.span`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 18px;
`;

const OriginalPrice = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.tertiary};
  text-decoration: line-through;
  font-size: 13px;
`;

const SavingsBadge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.text.inverse};
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  font-weight: 700;
  font-size: 10px;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xs};
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.xs};
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  border-radius: ${props => props.theme.radii.md};
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primarySoftBg};
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.div`
  min-width: 30px;
  text-align: center;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 16px;
`;

const StockStatus = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => {
    if (props.stock === 'low') return props.theme.colors.warningBase;
    if (props.stock === 'out') return props.theme.colors.dangerBase;
    return props.theme.colors.successBase;
  }};
  font-weight: 600;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  font-size: 11px;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

export const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const product = item.product || item;
  const quantity = item.quantity || 1;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => {
      onRemove(item.id);
    }, 300);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card removing={removing}>
      <ImageContainer onClick={handleProductClick}>
        {product.image ? (
          <ProductImage src={product.image} alt={product.name} />
        ) : (
          <ImagePlaceholder>🛍️</ImagePlaceholder>
        )}
      </ImageContainer>

      <Content>
        <TitleRow>
          <Title onClick={handleProductClick}>{product.name}</Title>
          <RemoveButton onClick={handleRemove}>×</RemoveButton>
        </TitleRow>

        <PriceRow>
          <CurrentPrice>R{(product.price * quantity).toFixed(2)}</CurrentPrice>
          {hasDiscount && (
            <>
              <OriginalPrice>R{(product.originalPrice * quantity).toFixed(2)}</OriginalPrice>
              <SavingsBadge>
                Save R{((product.originalPrice - product.price) * quantity).toFixed(2)}
              </SavingsBadge>
            </>
          )}
        </PriceRow>

        <ControlsRow>
          <QuantityControls>
            <QuantityButton onClick={handleDecrease} disabled={quantity <= 1}>
              −
            </QuantityButton>
            <QuantityDisplay>{quantity}</QuantityDisplay>
            <QuantityButton onClick={handleIncrease}>
              +
            </QuantityButton>
          </QuantityControls>

          {product.stock && (
            <StockStatus stock={product.stock}>
              {product.stock === 'low' && '⚠️ Only '}
              {product.stock === 'low' && (product.stockQuantity || 0) + ' left'}
              {product.stock === 'in' && '✅ In stock'}
              {product.stock === 'out' && '❌ Out of stock'}
            </StockStatus>
          )}
        </ControlsRow>

        <ActionButtons>
          <ActionButton>Save For Later</ActionButton>
          {product.stock === 'out' && (
            <ActionButton>Find Replacement</ActionButton>
          )}
        </ActionButtons>
      </Content>
    </Card>
  );
};











