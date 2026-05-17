import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';

/* ─── Animations ──────────────────────────────────────── */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0%   { transform: scale(0.72); opacity: 0; }
  70%  { transform: scale(1.08); }
  100% { transform: scale(1);    opacity: 1; }
`;

/* ─── Card ────────────────────────────────────────────── */

const Card = styled.div`
  position: relative;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94)) padding-box,
    linear-gradient(145deg, rgba(61, 129, 239, 0.18), rgba(228, 231, 236, 0.84), rgba(245, 158, 11, 0.14)) border-box;
  border: 1px solid transparent;
  border-radius: 24px;
  overflow: hidden;
  cursor: ${p => p.$outOfStock ? 'default' : 'pointer'};
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow:
    0 18px 42px rgba(16, 24, 40, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: ${props => props.theme.transitions.swift};
  opacity: ${p => p.$outOfStock ? 0.7 : 1};

  &:hover {
    box-shadow:
      0 26px 62px rgba(16, 24, 40, 0.14),
      0 0 0 4px ${props => props.theme.colors.primarySoftBg},
      inset 0 1px 0 rgba(255, 255, 255, 0.98);
    transform: ${p => p.$outOfStock ? 'none' : 'translateY(-5px)'};
  }

  &:active {
    transform: ${p => p.$outOfStock ? 'none' : 'translateY(-1px)'};
    box-shadow: 0 6px 18px rgba(16, 24, 40, 0.09);
  }
`;

/* ─── Image zone ──────────────────────────────────────── */

const ImageZone = styled.div`
  position: relative;
  width: calc(100% - 16px);
  aspect-ratio: 1 / 1.03;
  margin: 8px 8px 0;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(248,250,252,0.95), rgba(255,255,255,0.86)),
    ${props => props.theme.colors.gradient.soft};
  overflow: hidden;
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.9),
    0 12px 24px rgba(16, 24, 40, 0.06);
`;

const Img = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  ${Card}:hover & {
    transform: scale(1.06);
  }
`;

const ImgPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 34px;
  font-weight: 900;
`;

const ImgScrim = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, transparent 42%, rgba(10, 15, 23, 0.22) 100%),
    linear-gradient(135deg, rgba(61, 129, 239, 0.08), transparent 45%, rgba(245, 158, 11, 0.08));
  pointer-events: none;
  opacity: 0.18;
  transition: opacity 0.22s ease;

  ${Card}:hover & {
    opacity: 0.72;
  }
`;

/* ─── Image badges ────────────────────────────────────── */

const TopLeft = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const DiscountChip = styled.span`
  display: inline-block;
  background:
    linear-gradient(135deg, #fff7ed, #ffffff) padding-box,
    linear-gradient(135deg, rgba(245, 158, 11, 0.55), rgba(230, 48, 0, 0.32)) border-box;
  border: 1px solid transparent;
  color: #c62850;
  font-size: 11px;
  font-weight: 900;
  padding: 6px 9px;
  border-radius: 999px;
  line-height: 1.5;
  box-shadow: 0 10px 20px rgba(198, 40, 80, 0.16);
`;

const VariantChip = styled.span`
  display: inline-block;
  background: ${props => ({
    hot:         '#e63000',
    new:         props.theme.colors.successBase,
    flash:       props.theme.colors.warningBase,
    bundle:      '#7c3aed',
    recommended: props.theme.colors.primary,
    'top-rated': props.theme.colors.warning[500],
  }[props.$v] || props.theme.colors.primary)};
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  padding: 5px 9px;
  border-radius: 999px;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const OutOfStockBadge = styled.span`
  display: inline-block;
  background: rgba(10, 15, 23, 0.72);
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  padding: 5px 9px;
  border-radius: 999px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
`;

const LowStockBadge = styled.span`
  display: inline-block;
  background: ${p => p.theme.colors.warning[500]};
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  padding: 5px 9px;
  border-radius: 999px;
  letter-spacing: 0.3px;
`;

const WishBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(228, 231, 236, 0.86);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  color: ${props => props.$on ? '#e63000' : props.theme.colors.neutral[300]};
  box-shadow: 0 12px 22px rgba(16, 24, 40, 0.1);

  &:hover {
    background: #fff;
    transform: translateY(-1px) scale(1.04);
    color: #e63000;
    border-color: rgba(230, 48, 0, 0.18);
  }

  svg {
    width: 16px;
    height: 16px;
    fill: ${props => props.$on ? 'currentColor' : 'none'};
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: fill 0.15s;
    animation: ${props => props.$on ? css`${popIn} 0.3s ease` : 'none'};
  }
`;

/* Quick-add slides up from bottom of image on hover */
const QuickAdd = styled.button`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  z-index: 3;
  height: 42px;
  border: 1px solid rgba(255,255,255,0.42);
  border-radius: 999px;
  background:
    linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryHover});
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transform: translateY(calc(100% + 16px));
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s;
  box-shadow: 0 16px 28px rgba(61, 129, 239, 0.28);

  ${Card}:hover & {
    transform: translateY(0);
  }

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${p => p.theme.colors.neutral[300]};
  }
`;

/* ─── Content ─────────────────────────────────────────── */

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 14px 14px 16px;
  gap: 9px;
`;

const ProductName = styled.p`
  font-size: 14px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  line-height: 1.32;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
`;

const CurrentPrice = styled.span`
  font-size: 20px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
  letter-spacing: 0;
  line-height: 1;
`;

const FlashPrice = styled(CurrentPrice)`
  color: ${p => p.theme.colors.dangerBase};
`;

const OldPrice = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.tertiary};
  text-decoration: line-through;
`;

const SaveLabel = styled.span`
  font-size: 11px;
  font-weight: 800;
  color: ${props => props.theme.colors.success[600]};
  background: ${props => props.theme.colors.success[100]};
  padding: 4px 7px;
  border-radius: 999px;
`;

/* ─── Social / meta row ───────────────────────────────── */

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
`;

const StarRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: ${props => props.theme.colors.warningBase};
  line-height: 1;

  svg {
    width: 12px;
    height: 12px;
    fill: currentColor;
  }
`;

const ReviewLabel = styled.span`
  font-size: 11px;
  color: ${props => props.theme.colors.text.tertiary};
`;

const SoldLabel = styled.span`
  font-size: 11px;
  color: ${props => props.theme.colors.text.tertiary};
  margin-left: auto;
`;

const FreeShipChip = styled.span`
  width: fit-content;
  font-size: 10px;
  font-weight: 800;
  color: ${props => props.theme.colors.successBase};
  background: ${props => props.theme.colors.success[100]};
  padding: 5px 8px;
  border-radius: 999px;
`;

const DistanceChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary || '#3D81EF'};
  background: ${props => props.theme?.colors?.primarySoftBg || '#EEF4FF'};
  padding: 4px 8px;
  border-radius: 999px;
  width: fit-content;
`;

const UnratedChip = styled.span`
  font-size: 10px;
  font-weight: 800;
  color: ${props => props.theme?.colors?.text?.secondary || '#888'};
  background: ${props => props.theme?.colors?.surface || '#F5F5F5'};
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px dashed ${props => props.theme?.colors?.border?.default || '#E0E0E0'};
`;

/* ─── Quantity controls ───────────────────────────────── */

const QtyBar = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  overflow: hidden;
  align-self: flex-start;
  margin-top: 2px;
  animation: ${fadeUp} 0.2s ease;
  background: #ffffff;
  box-shadow: 0 10px 20px rgba(16, 24, 40, 0.06);
`;

const QtyBtn = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;

  &:hover { background: ${props => props.theme.colors.primarySoftBg}; color: ${props => props.theme.colors.primary}; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
`;

const QtyNum = styled.span`
  min-width: 30px;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
`;

/* ─── Helpers ─────────────────────────────────────────── */

const HeartSvg = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CartSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 5h2l2 11h10l2-8H7" />
    <circle cx="10" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </svg>
);

const StarSvg = ({ $active }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ opacity: $active ? 1 : 0.2 }}>
    <path d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2-4.5-4.4 6.3-.9L12 2.8Z" />
  </svg>
);

const Stars = ({ rating }) => {
  const r = Math.round((rating || 0) * 2) / 2;
  return (
    <StarRow>
      {[1, 2, 3, 4, 5].map(i => (
        <StarSvg key={i} $active={i <= r} />
      ))}
    </StarRow>
  );
};

const fmtCount = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const fmtSold  = (n) => !n ? null : n >= 1000 ? `${(n / 1000).toFixed(1)}k+ sold` : `${n}+ sold`;

/* Persist wishlist to localStorage */
const WISH_KEY = 'shopply_wishlist';
const getWishlist = () => {
  try { return new Set(JSON.parse(localStorage.getItem(WISH_KEY) || '[]')); } catch { return new Set(); }
};
const toggleWish = (id) => {
  const w = getWishlist();
  if (w.has(id)) w.delete(id); else w.add(id);
  localStorage.setItem(WISH_KEY, JSON.stringify([...w]));
  return w.has(id);
};

import API_BASE_URL from '@config/api';
import { getCurrentUserId } from '../../utils/currentUser.js';

/* Read qty for this product from localStorage (no API call) */
const readLocalQty = (productId) => {
  try {
    const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
    const item = cart.find(i => String(i.id) === String(productId) && JSON.stringify(i.selectedVariant) === 'null');
    return item ? (item.quantity || 0) : 0;
  } catch { return 0; }
};

/* ─── Component ───────────────────────────────────────── */

export const ProductCard = ({ product, variant, onClick, onAddToCart }) => {
  const [qty, setQty]       = useState(() => readLocalQty(product?.id));
  const [busy, setBusy]     = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [liked, setLiked]   = useState(() => getWishlist().has(product?.id));

  /* Sync qty from localStorage whenever cart changes */
  const syncQty = useCallback(() => {
    setQty(readLocalQty(product?.id));
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    syncQty();
    window.addEventListener('cartUpdated', syncQty);
    return () => window.removeEventListener('cartUpdated', syncQty);
  }, [product?.id, syncQty]);

  if (!product) return null;

  const outOfStock  = product.stock === 'out';
  const lowStock    = product.stock === 'low' || (product.stockQuantity != null && product.stockQuantity <= 5 && product.stockQuantity > 0);
  const isFlashDeal = !!product.flashDeal || !!product.flashDealPrice;
  const displayPrice = isFlashDeal ? (product.flashDealPrice ?? product.price) : product.price;
  const basePrice    = isFlashDeal ? product.price : (product.originalPrice ?? null);
  const hasDisc      = basePrice != null && basePrice > displayPrice;
  const discPct      = hasDisc ? Math.round(((basePrice - displayPrice) / basePrice) * 100) : null;
  const imgSrc       = product.image || product.images?.[0] || null;
  const placeholderChar = product.name?.[0]?.toUpperCase() || 'S';

  /* ── Add first item ── */
  const pushCart = async (e) => {
    e.stopPropagation();
    if (busy || outOfStock) return;
    setBusy(true);
    try {
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      const idx  = cart.findIndex(i => String(i.id) === String(product.id) && JSON.stringify(i.selectedVariant) === 'null');
      const newQty = idx >= 0 ? cart[idx].quantity + 1 : 1;

      if (idx >= 0) { cart[idx].quantity = newQty; }
      else { cart.push({ ...product, quantity: 1, selectedVariant: null, addedAt: new Date().toISOString() }); }

      localStorage.setItem('shopply_cart', JSON.stringify(cart));
      localStorage.setItem('shopply_cart_count', cart.reduce((s, i) => s + (i.quantity || 1), 0).toString());
      setQty(newQty);
      window.dispatchEvent(new Event('cartUpdated'));

      // Fire-and-forget server sync
      fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getCurrentUserId(), productId: product.id, quantity: 1, variant: null, storeId: product.storeId }),
      }).catch(() => {});

      if (onAddToCart) onAddToCart(product);
    } finally { setBusy(false); }
  };

  /* ── Change qty (+ / -) ── */
  const changeQty = async (e, delta) => {
    e.stopPropagation();
    if (busy) return;
    const next = qty + delta;
    if (next < 0) return;
    setBusy(true);
    try {
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      const idx  = cart.findIndex(i => String(i.id) === String(product.id) && JSON.stringify(i.selectedVariant) === 'null');

      if (next === 0) {
        if (idx >= 0) cart.splice(idx, 1);
        // Remove from server
        fetch(`${API_BASE_URL}/cart/items/by-product/${product.id}?userId=${getCurrentUserId()}`, { method: 'DELETE' }).catch(() => {});
      } else {
        if (idx >= 0) { cart[idx].quantity = next; }
        else { cart.push({ ...product, quantity: next, selectedVariant: null, addedAt: new Date().toISOString() }); }
        // Update server
        fetch(`${API_BASE_URL}/cart/items/by-product/${product.id}?userId=${getCurrentUserId()}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: next, variant: null }),
        }).catch(() => {});
      }

      setQty(next);
      localStorage.setItem('shopply_cart', JSON.stringify(cart));
      localStorage.setItem('shopply_cart_count', cart.reduce((s, i) => s + (i.quantity || 1), 0).toString());
      window.dispatchEvent(new Event('cartUpdated'));
    } finally { setBusy(false); }
  };

  const handleWish = (e) => {
    e.stopPropagation();
    const nowLiked = toggleWish(product.id);
    setLiked(nowLiked);
  };

  const variantLabel = { hot: 'Hot', new: 'New', flash: 'Sale', bundle: 'Bundle', recommended: 'Pick', 'top-rated': 'Top' }[variant];

  return (
    <Card
      $outOfStock={outOfStock}
      onClick={(e) => { e.stopPropagation(); if (!outOfStock && onClick) onClick(); }}
    >
      {/* ── Image ── */}
      <ImageZone>
        {imgSrc && !imgErr
          ? <Img src={imgSrc} alt={product.name} onError={() => setImgErr(true)} loading="lazy" />
          : <ImgPlaceholder>{placeholderChar}</ImgPlaceholder>
        }
        <ImgScrim />

        <TopLeft>
          {outOfStock
            ? <OutOfStockBadge>Out of stock</OutOfStockBadge>
            : lowStock
              ? <LowStockBadge>Low stock</LowStockBadge>
              : discPct
                ? <DiscountChip>-{discPct}%</DiscountChip>
                : variantLabel
                  ? <VariantChip $v={variant}>{variantLabel}</VariantChip>
                  : null
          }
        </TopLeft>

        <WishBtn $on={liked} onClick={handleWish} aria-label={liked ? 'Remove from wishlist' : 'Save'}>
          <HeartSvg />
        </WishBtn>

        {qty === 0 && !outOfStock && (
          <QuickAdd onClick={pushCart} disabled={busy} aria-label="Add to cart">
            <CartSvg /> {busy ? 'Adding…' : 'Add to cart'}
          </QuickAdd>
        )}

        {qty === 0 && outOfStock && (
          <QuickAdd as="div" disabled style={{ cursor: 'not-allowed' }}>
            Out of stock
          </QuickAdd>
        )}
      </ImageZone>

      {/* ── Info ── */}
      <Body>
        <ProductName>{product.name}</ProductName>

        <PriceRow>
          {isFlashDeal
            ? <FlashPrice>R{displayPrice.toFixed(2)}</FlashPrice>
            : <CurrentPrice>R{displayPrice.toFixed(2)}</CurrentPrice>
          }
          {hasDisc && (
            <>
              <OldPrice>R{basePrice.toFixed(2)}</OldPrice>
              {discPct >= 5 && <SaveLabel>-{discPct}%</SaveLabel>}
            </>
          )}
        </PriceRow>

        <MetaRow>
          {product.rating > 0 ? (
            <>
              <Stars rating={product.rating} />
              {product.reviewCount > 0 && <ReviewLabel>({fmtCount(product.reviewCount)})</ReviewLabel>}
            </>
          ) : (
            <UnratedChip>No reviews yet</UnratedChip>
          )}
          {product.salesCount > 0 && <SoldLabel>{fmtSold(product.salesCount)}</SoldLabel>}
        </MetaRow>

        {product.distanceDisplay && (
          <DistanceChip>
            📍 {product.distanceDisplay}
            {product.store?.isOpenNow === false && <span style={{color:'#E53935', fontWeight: 700}}> · Closed</span>}
            {product.pickupOnly && <span style={{color:'#FF6F00', fontWeight: 700}}> · Pickup only</span>}
          </DistanceChip>
        )}

        {product.deliveryEligible && !outOfStock && <FreeShipChip>Free delivery</FreeShipChip>}

        {qty > 0 && (
          <QtyBar>
            <QtyBtn onClick={(e) => changeQty(e, -1)} disabled={busy} aria-label="Remove one">−</QtyBtn>
            <QtyNum>{qty}</QtyNum>
            <QtyBtn onClick={(e) => changeQty(e, +1)} disabled={busy || outOfStock} aria-label="Add one">+</QtyBtn>
          </QtyBar>
        )}
      </Body>
    </Card>
  );
};
