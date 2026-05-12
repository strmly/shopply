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
    transform: translateX(-24px);
    opacity: 0;
  }
`;

const Card = styled.div`
  position: relative;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(196, 184, 252, 0.16), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 24px;
  padding: 14px;
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 16px;
  animation: ${props => props.$removing ? slideOut : fadeIn} 0.3s ease-out;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 16px 36px rgba(16, 24, 40, 0.07);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 46px rgba(16, 24, 40, 0.11);
  }

  @media (max-width: 560px) {
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 12px;
  }
`;

const ImageContainer = styled.button`
  width: 112px;
  aspect-ratio: 1;
  border: none;
  border-radius: 18px;
  overflow: hidden;
  background: ${props => props.theme.colors.gradient.soft};
  padding: 0;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7);

  @media (max-width: 560px) {
    width: 92px;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;

  ${ImageContainer}:hover & {
    transform: scale(1.05);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
`;

const Content = styled.div`
  min-width: 0;
  display: grid;
  gap: 10px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

const Title = styled.button`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  background: transparent;
  border: none;
  padding: 0;
  text-align: left;
  font-weight: 900;
  font-size: 15px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const RemoveButton = styled.button`
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  color: ${props => props.theme.colors.text.secondary};
  border-radius: 999px;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};
  flex-shrink: 0;

  &:hover {
    color: ${props => props.theme.colors.dangerBase};
    background: ${props => props.theme.colors.danger[100]};
    transform: scale(1.05);
  }
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const CurrentPrice = styled.span`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
`;

const OriginalPrice = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.tertiary};
  text-decoration: line-through;
  font-weight: 700;
`;

const SavingsBadge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.danger[100]};
  color: ${props => props.theme.colors.dangerBase};
  padding: 5px 8px;
  border-radius: 999px;
  font-weight: 900;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  padding: 5px;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  border-radius: 999px;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: scale(1.08);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.div`
  min-width: 28px;
  text-align: center;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
`;

const StockStatus = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => {
    if (props.$stock === 'low') return props.theme.colors.warningBase;
    if (props.$stock === 'out') return props.theme.colors.dangerBase;
    return props.theme.colors.successBase;
  }};
  background: ${props => {
    if (props.$stock === 'low') return props.theme.colors.warning[100];
    if (props.$stock === 'out') return props.theme.colors.danger[100];
    return props.theme.colors.success[100];
  }};
  border-radius: 999px;
  padding: 6px 9px;
  font-weight: 900;
  white-space: nowrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary};
  ${props => props.theme.typography.caption}
  font-weight: 900;
  cursor: pointer;
  padding: 0;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primaryHover};
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

  const stockText = () => {
    if (product.stock === 'low') return `Only ${product.stockQuantity || 0} left`;
    if (product.stock === 'out') return 'Out of stock';
    return 'In stock';
  };

  return (
    <Card $removing={removing}>
      <ImageContainer onClick={handleProductClick} aria-label={`View ${product.name}`}>
        {product.image ? (
          <ProductImage src={product.image} alt={product.name} />
        ) : (
          <ImagePlaceholder>F</ImagePlaceholder>
        )}
      </ImageContainer>

      <Content>
        <TitleRow>
          <Title onClick={handleProductClick}>{product.name}</Title>
          <RemoveButton onClick={handleRemove} aria-label="Remove item">x</RemoveButton>
        </TitleRow>

        <PriceRow>
          <CurrentPrice>R{((product.price || 0) * quantity).toFixed(2)}</CurrentPrice>
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
              -
            </QuantityButton>
            <QuantityDisplay>{quantity}</QuantityDisplay>
            <QuantityButton onClick={handleIncrease}>
              +
            </QuantityButton>
          </QuantityControls>

          {product.stock && (
            <StockStatus $stock={product.stock}>
              {stockText()}
            </StockStatus>
          )}
        </ControlsRow>

        <ActionButtons>
          <ActionButton>Save for later</ActionButton>
          {product.stock === 'out' && <ActionButton>Find replacement</ActionButton>}
        </ActionButtons>
      </Content>
    </Card>
  );
};
