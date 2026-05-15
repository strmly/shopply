import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import API_BASE_URL from '@config/api';

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

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 6px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
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
    if (props.disabled && !props.$notified) return props.theme.colors.neutral[200];
    if (props.$added) return props.theme.colors.successBase;
    if (props.$notified) return props.theme.colors.successBase;
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

const NotifyButton = styled.button`
  flex: 1;
  max-width: 420px;
  padding: 16px 24px;
  background: ${props => props.$notified
    ? props.theme.colors.successBase
    : props.theme.colors.gradient.primary};
  color: #ffffff;
  border: none;
  border-radius: 999px;
  ${props => props.theme.typography.button}
  font-weight: 800;
  font-size: 16px;
  cursor: ${props => props.$notified ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  min-width: 150px;
  box-shadow: 0 18px 34px rgba(61, 129, 239, 0.28);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 22px 42px rgba(61, 129, 239, 0.32);
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

const ShareButton = styled.button`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid ${props => props.theme.colors.primary};
  background: transparent;
  color: ${props => props.theme.colors.primary};
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.96);
  }
`;

const CopiedToast = styled.div`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translate(-50%, 0);
  background: ${props => props.theme.colors.text.primary};
  color: #ffffff;
  font-size: 12px;
  font-weight: 850;
  padding: 7px 14px;
  border-radius: 999px;
  white-space: nowrap;
  pointer-events: none;
  animation: ${fadeInUp} 0.2s ease-out;
  z-index: 10;
`;

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

export const AddToCartBar = ({ product, selectedVariant, quantity, onAddToCart, stock, selectedStore }) => {
  const [added, setAdded] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [notified, setNotified] = useState(false);
  const [notifying, setNotifying] = useState(false);

  if (!product || !product.price) return null;

  const isOutOfStock = stock === 'out';
  const hasVariants = product.variants && product.variants.length > 0;
  const needsVariantSelection = hasVariants && !selectedVariant;
  const isFlashDeal = product.flashDealPrice != null;
  const unitPrice = isFlashDeal ? product.flashDealPrice : product.price;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const notifyKey = `shopply_notified_${product.id}_${product.storeId}`;

  // Restore notified state from localStorage on mount
  useEffect(() => {
    if (product.id && product.storeId) {
      setNotified(localStorage.getItem(notifyKey) === 'true');
    }
  }, [product.id, product.storeId]);

  const handleClick = () => {
    if (isOutOfStock || needsVariantSelection) return;

    setRippleKey(prev => prev + 1);
    onAddToCart();
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product?.name || 'Check out this product on Shopply';
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNotify = async () => {
    if (notified || notifying) return;
    const email = localStorage.getItem('shopply_user_email') || 'guest@shopply.app';
    try {
      setNotifying(true);
      await fetch(`${API_BASE_URL}/products/${product.id}/notify-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: product.storeId, email }),
      }).catch(() => {});
      localStorage.setItem(notifyKey, 'true');
      setNotified(true);
    } finally {
      setNotifying(false);
    }
  };

  return (
    <Bar style={{ position: 'relative' }}>
      {copied && <CopiedToast>Link copied!</CopiedToast>}
      <BarContent>
        <ShareButton type="button" aria-label="Share product" onClick={handleShare}>
          <ShareIcon />
        </ShareButton>

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

        {isOutOfStock ? (
          <NotifyButton
            type="button"
            $notified={notified}
            onClick={handleNotify}
            disabled={notified || notifying}
          >
            {notified ? 'You\'ll be notified ✓' : notifying ? 'Sending...' : 'Notify me when available'}
          </NotifyButton>
        ) : (
          <AddToCartButton
            disabled={needsVariantSelection}
            $added={added}
            onClick={handleClick}
          >
            {needsVariantSelection
              ? 'Select variant'
              : added
                ? 'Added'
                : 'Add to cart'}
            {!needsVariantSelection && <Ripple key={rippleKey} />}
          </AddToCartButton>
        )}
      </BarContent>
    </Bar>
  );
};
