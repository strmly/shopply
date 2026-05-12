import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  position: relative;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.24), rgba(196, 184, 252, 0.2), rgba(255, 255, 255, 0.72)) border-box;
  border: 1px solid transparent;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.3s ease-in;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 18% 0%, rgba(126, 193, 246, 0.16), transparent 32%),
      linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0));
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 64px rgba(16, 24, 40, 0.14);
    border-color: rgba(61, 129, 239, 0.34);
  }

  &:hover::before {
    opacity: 1;
  }

  &:hover img {
    transform: scale(1.045);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 0.9;
  background: ${props => props.theme.colors.gradient.soft};
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(13, 28, 51, 0.02) 38%, rgba(13, 28, 51, 0.58) 100%),
      linear-gradient(115deg, rgba(255,255,255,0.34) 0%, transparent 36%);
    pointer-events: none;
  }
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Handle broken images */
  &[src=""],
  &:not([src]) {
    opacity: 0;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${props => {
    if (props.$variant === 'hot') return props.theme.colors.danger?.[500] || props.theme.colors.dangerBase;
    if (props.$variant === 'flash') return props.theme.colors.warningBase;
    if (props.$variant === 'new') return props.theme.colors.info[600];
    return props.theme.colors.primary;
  }};
  color: ${props => props.theme.colors.text.inverse};
  padding: 7px 10px;
  border-radius: 999px;
  ${props => props.theme.typography.caption}
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
  z-index: 2;
  box-shadow: 0 12px 26px rgba(16, 24, 40, 0.18);
`;

const ImageMeta = styled.div`
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  display: flex;
  max-width: calc(100% - 24px);
  gap: 6px;
`;

const ImagePill = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.primary};
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  padding: 7px 10px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.14);
  backdrop-filter: blur(10px);
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
`;

const Name = styled.h3`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 800;
  line-height: 1.32;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8em;
`;

const StoreName = styled.p`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 800;
`;

const FurnitureInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 28px;
`;

const ConditionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  background: ${props => {
    const condition = props.$condition?.toLowerCase();
    if (condition === 'new') return props.theme.colors.success[100];
    if (condition === 'like-new') return props.theme.colors.info[100];
    if (condition === 'used') return props.theme.colors.warning[100];
    if (condition === 'refurbished') return props.theme.colors.info[200];
    return props.theme.colors.background;
  }};
  color: ${props => {
    const condition = props.$condition?.toLowerCase();
    if (condition === 'new') return props.theme.colors.success[700];
    if (condition === 'like-new') return props.theme.colors.info[700];
    if (condition === 'used') return props.theme.colors.warning[700];
    if (condition === 'refurbished') return props.theme.colors.info[800];
    return props.theme.colors.text.secondary;
  }};
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  ${props => props.theme.typography.caption}
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
`;

const Dimensions = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 5px 9px;
  border-radius: 999px;
  background: ${props => props.theme.colors.neutral[50]};
  font-weight: 700;
  white-space: nowrap;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
`;

const Price = styled.span`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  letter-spacing: 0;
`;

const OriginalPrice = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  text-decoration: line-through;
`;

const DiscountBadge = styled.span`
  ${props => props.theme.typography.caption}
  background: ${props => props.theme.colors.danger?.[100] || props.theme.colors.dangerBase + '20'};
  color: ${props => props.theme.colors.dangerBase};
  padding: 4px 7px;
  border-radius: 999px;
  font-weight: 800;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  min-width: 0;
  font-weight: 700;
`;

const CartButton = styled.button`
  background: ${props => props.$quantity > 0 
    ? props.theme.colors.primary 
    : props.theme.colors.text.primary};
  color: ${props => props.$quantity > 0 
    ? props.theme.colors.text.inverse 
    : props.theme.colors.text.inverse};
  border: none;
  border-radius: 999px;
  padding: ${props => props.theme.spacing.xs};
  min-width: 44px;
  height: 44px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.button}
  position: relative;
  box-shadow: 0 16px 30px rgba(16, 24, 40, 0.18);

  &:hover {
    background: ${props => props.$quantity > 0 
      ? props.theme.colors.primaryHover 
      : props.theme.colors.primary};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CartIcon = styled.span`
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-1px);
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  width: 100%;
  justify-content: center;
`;

const QuantityButton = styled.button`
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  padding: 0;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CartQuantityWrapper = styled.div`
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  padding: 5px;
  min-width: 98px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14px 26px rgba(16, 24, 40, 0.08);
`;

const QuantityDisplay = styled.span`
  ${props => props.theme.typography.body2}
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  min-width: ${props => props.theme.spacing.lg};
  text-align: center;
`;

const PlaceholderImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.colors.gradient.soft};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primarySoftText};
  font-size: 32px;
  font-weight: 900;
`;

import API_BASE_URL from '@config/api';
const userId = 'default';

export const ProductCard = ({ product, variant, onClick, onAddToCart }) => {
  const [quantity, setQuantity] = useState(0);
  const [cartItemId, setCartItemId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if product is in cart
  useEffect(() => {
    if (!product?.id) return undefined;

    const checkCart = async () => {
      // Check server cart first (source of truth)
      try {
        const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.data.items) {
          const serverItem = data.data.items.find(item => 
            item.productId === product.id && 
            JSON.stringify(item.variant) === JSON.stringify(null)
          );
          if (serverItem) {
            setQuantity(serverItem.quantity || 0);
            setCartItemId(serverItem.id);
            return;
          }
        }
      } catch (err) {
        console.error('Error checking server cart:', err);
      }

      // Fallback to localStorage
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      const cartItem = cart.find(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(null)
      );
      
      if (cartItem) {
        setQuantity(cartItem.quantity || 0);
        // Try to find matching server item ID
        fetch(`${API_BASE_URL}/cart?userId=${userId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data.items) {
              const serverItem = data.data.items.find(item => 
                item.productId === product.id && 
                JSON.stringify(item.variant) === JSON.stringify(null)
              );
              if (serverItem) {
                setCartItemId(serverItem.id);
              }
            }
          })
          .catch(() => {});
      } else {
        setQuantity(0);
        setCartItemId(null);
      }
    };

    checkCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      checkCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [product?.id]);

  if (!product) return null;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const imageUrl = product.image || product.images?.[0] || null;
  const displayPrice = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;
  const displayRating = typeof product.rating === 'number' ? product.rating.toFixed(1) : product.rating;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Add to localStorage cart
      const cartItem = {
        ...product,
        quantity: 1,
        selectedVariant: null,
        addedAt: new Date().toISOString(),
      };

      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      const existingIndex = cart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(null)
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
        setQuantity(cart[existingIndex].quantity);
      } else {
        cart.push(cartItem);
        setQuantity(1);
      }

      localStorage.setItem('shopply_cart', JSON.stringify(cart));
      const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      localStorage.setItem('shopply_cart_count', cartCount.toString());

      // Sync with backend
      try {
        const response = await fetch(`${API_BASE_URL}/cart/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            productId: product.id,
            quantity: 1,
            variant: null,
            storeId: product.storeId,
          }),
        });

        const data = await response.json();
        if (data.success && data.data.items) {
          const serverItem = data.data.items.find(item => 
            item.productId === product.id && 
            JSON.stringify(item.variant) === JSON.stringify(null)
          );
          if (serverItem) {
            setCartItemId(serverItem.id);
          }
        }
      } catch (error) {
        console.error('Error syncing cart to backend:', error);
      }

      window.dispatchEvent(new Event('cartUpdated'));
      if (onAddToCart) onAddToCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncreaseQuantity = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(true);
    const newQuantity = quantity + 1;
    
    try {
      // Update localStorage
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      const existingIndex = cart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(null)
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity = newQuantity;
        localStorage.setItem('shopply_cart', JSON.stringify(cart));
        const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        localStorage.setItem('shopply_cart_count', cartCount.toString());
        setQuantity(newQuantity);
      }

      // Sync with backend
      if (cartItemId) {
        try {
          await fetch(`${API_BASE_URL}/cart/items/${cartItemId}?userId=${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity }),
          });
        } catch (error) {
          console.error('Error updating quantity on server:', error);
        }
      } else {
        // If no cartItemId, add item
        await handleAddToCart(e);
        return;
      }

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error increasing quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecreaseQuantity = async (e) => {
    e.stopPropagation();
    if (isUpdating || quantity <= 1) return;
    
    setIsUpdating(true);
    const newQuantity = quantity - 1;
    
    try {
      // Update localStorage
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      const existingIndex = cart.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(null)
      );

      if (existingIndex >= 0) {
        if (newQuantity === 0) {
          cart.splice(existingIndex, 1);
          setQuantity(0);
          setCartItemId(null);
        } else {
          cart[existingIndex].quantity = newQuantity;
          setQuantity(newQuantity);
        }
        localStorage.setItem('shopply_cart', JSON.stringify(cart));
        const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        localStorage.setItem('shopply_cart_count', cartCount.toString());
      }

      // Sync with backend
      if (cartItemId && newQuantity > 0) {
        try {
          await fetch(`${API_BASE_URL}/cart/items/${cartItemId}?userId=${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity }),
          });
        } catch (error) {
          console.error('Error updating quantity on server:', error);
        }
      } else if (cartItemId && newQuantity === 0) {
        // Remove from cart
        try {
          await fetch(`${API_BASE_URL}/cart/items/${cartItemId}?userId=${userId}`, {
            method: 'DELETE',
          });
          setCartItemId(null);
        } catch (error) {
          console.error('Error removing from cart:', error);
        }
      }

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getBadgeText = () => {
    if (variant === 'hot') return 'Hot';
    if (variant === 'flash') return 'Flash';
    if (variant === 'new') return 'New';
    if (hasDiscount && discountPercent) return `-${discountPercent}%`;
    return null;
  };

  return (
    <Card onClick={handleClick}>
      <ImageContainer>
        {imageUrl && !imageError ? (
          <Image 
            src={imageUrl} 
            alt={product.name}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <PlaceholderImage>F</PlaceholderImage>
        )}
        {getBadgeText() && (
          <Badge $variant={variant}>{getBadgeText()}</Badge>
        )}
        {(displayRating || product.condition) && (
          <ImageMeta>
            {displayRating && <ImagePill>{displayRating} rated</ImagePill>}
            {!displayRating && product.condition && <ImagePill>{product.condition}</ImagePill>}
          </ImageMeta>
        )}
      </ImageContainer>
      
      <Content>
        <Name>{product.name}</Name>
        {product.storeName && <StoreName>{product.storeName}</StoreName>}
        
        {/* Furniture-specific info */}
        {(product.condition || product.dimensions_cm) && (
          <FurnitureInfo>
            {product.condition && (
              <ConditionBadge $condition={product.condition}>
                {product.condition}
              </ConditionBadge>
            )}
            {product.dimensions_cm && product.dimensions_cm.width && (
              <Dimensions>
                {product.dimensions_cm.width} x {product.dimensions_cm.depth} x {product.dimensions_cm.height}cm
              </Dimensions>
            )}
          </FurnitureInfo>
        )}
        
        <PriceRow>
          <Price>R{displayPrice}</Price>
          {hasDiscount && (
            <>
              <OriginalPrice>R{product.originalPrice.toFixed(2)}</OriginalPrice>
              {discountPercent && <DiscountBadge>-{discountPercent}%</DiscountBadge>}
            </>
          )}
        </PriceRow>

        <Footer>
          <Rating>
            {displayRating ? `Rated ${displayRating}` : 'Local find'}
          </Rating>
          {quantity > 0 ? (
            <CartQuantityWrapper>
              <QuantityControls>
                <QuantityButton 
                  onClick={handleDecreaseQuantity}
                  disabled={isUpdating || quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </QuantityButton>
                <QuantityDisplay>{quantity}</QuantityDisplay>
                <QuantityButton 
                  onClick={handleIncreaseQuantity}
                  disabled={isUpdating}
                  aria-label="Increase quantity"
                >
                  +
                </QuantityButton>
              </QuantityControls>
            </CartQuantityWrapper>
          ) : (
            <CartButton $quantity={0} onClick={handleAddToCart} disabled={isUpdating}>
              <CartIcon>+</CartIcon>
            </CartButton>
          )}
        </Footer>
      </Content>
    </Card>
  );
};
