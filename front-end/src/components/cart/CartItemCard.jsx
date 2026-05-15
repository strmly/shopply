import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';
import API_BASE_URL from '@config/api';

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

const WhatsAppButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  background: #128c7e;
  border: 1px solid #128c7e;
  color: #ffffff;
  ${props => props.theme.typography.caption}
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 12px 22px rgba(18, 140, 126, 0.2);
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: #075e54;
    border-color: #075e54;
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 16px 28px rgba(18, 140, 126, 0.28);
  }

  &[aria-disabled='true'] {
    pointer-events: none;
    opacity: 0.6;
    filter: grayscale(1);
    box-shadow: none;
  }
`;

const normalizeWhatsAppNumber = (value = '') => {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `27${digits.slice(1)}`;
  if (digits.length === 9) digits = `27${digits}`;
  return digits;
};

const buildWhatsAppHref = (product, contact) => {
  const rawNumber = contact?.whatsappNumber
    || contact?.storePhone
    || product?.sellerContact?.whatsappNumber
    || product?.sellerContact?.storePhone
    || product?.whatsappNumber
    || product?.storePhone
    || product?.sellerPhone
    || '';
  const number = normalizeWhatsAppNumber(rawNumber);
  if (!number) return '';

  const message = [
    `Hi ${product?.storeName || 'there'},`,
    `I have ${product?.name || 'this product'} in my Shopply cart.`,
    'Is it still available?',
  ].join('\n');

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

export const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const [sellerContact, setSellerContact] = useState(item.sellerContact || item.product?.sellerContact || null);
  const product = item.product || item;
  const quantity = item.quantity || 1;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const productId = item.productId || product.id;

  useEffect(() => {
    if (sellerContact?.whatsappNumber || !productId) return;

    let active = true;
    fetch(`${API_BASE_URL}/products/${productId}`)
      .then(response => response.ok ? response.json() : null)
      .then(json => {
        if (!active || !json?.success) return;
        setSellerContact(json.data?.sellerContact || null);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [productId, sellerContact?.whatsappNumber]);

  const whatsappHref = useMemo(
    () => buildWhatsAppHref(product, sellerContact),
    [product, sellerContact]
  );

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
          <WhatsAppButton
            href={whatsappHref || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!whatsappHref}
            title={whatsappHref ? 'WhatsApp this seller' : 'Seller WhatsApp number unavailable'}
          >
            WhatsApp seller
          </WhatsAppButton>
          <ActionButton>Save for later</ActionButton>
          {product.stock === 'out' && <ActionButton>Find replacement</ActionButton>}
        </ActionButtons>
      </Content>
    </Card>
  );
};
