import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  overflow: hidden;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.3s ease-in;
  box-shadow: ${props => props.theme.shadows.sm};
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  /* Slightly reduce aspect ratio so more rows fit on screen */
  padding-top: 85%;
  background: ${props => props.theme.colors.background};
  overflow: hidden;
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  
  /* Handle broken images */
  &[src=""],
  &:not([src]) {
    opacity: 0;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  left: ${props => props.theme.spacing.xs};
  background: ${props => {
    if (props.$variant === 'hot') return props.theme.colors.danger?.[500] || props.theme.colors.dangerBase;
    if (props.$variant === 'flash') return props.theme.colors.warningBase;
    if (props.$variant === 'new') return props.theme.colors.info[600];
    return props.theme.colors.primary;
  }};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.sm};
  ${props => props.theme.typography.caption}
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 1;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${props => props.theme.spacing.xs};
`;

const Name = styled.h3`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8em;
`;

const StoreName = styled.p`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FurnitureInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  align-items: center;
  margin-top: ${props => props.theme.spacing.xs};
`;

const ConditionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
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
  border-radius: ${props => props.theme.radii.sm};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const Dimensions = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-top: auto;
`;

const Price = styled.span`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
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
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.radii.sm};
  font-weight: 600;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing.xs};
  padding-top: ${props => props.theme.spacing.xs};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
`;

const CartButton = styled.button`
  background: ${props => props.$quantity > 0 
    ? props.theme.colors.primary 
    : props.theme.colors.background};
  color: ${props => props.$quantity > 0 
    ? props.theme.colors.text.inverse 
    : props.theme.colors.primary};
  border: ${props => props.$quantity > 0 
    ? 'none' 
    : `2px solid ${props.theme.colors.primary}`};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.xs};
  min-width: ${props => props.$quantity > 0 ? props.theme.spacing.xxl : props.theme.spacing.xl};
  height: ${props => props.theme.spacing.xxl};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.button}
  position: relative;

  &:hover {
    background: ${props => props.quantity > 0 
      ? props.theme.colors.primaryHover 
      : props.theme.colors.primarySoftBg};
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
  font-size: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  width: 100%;
  justify-content: center;
`;

const QuantityButton = styled.button`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.sm};
  width: ${props => props.theme.spacing.lg};
  height: ${props => props.theme.spacing.lg};
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
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing.xs};
  min-width: ${props => props.theme.spacing.xxl};
  height: ${props => props.theme.spacing.xxl};
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: ${props => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.spacing.lg};
`;

import API_BASE_URL from '@config/api';
const userId = 'default';

export const ProductCard = ({ product, variant, onClick, onAddToCart }) => {
  const [quantity, setQuantity] = useState(0);
  const [cartItemId, setCartItemId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!product) return null;

  // Check if product is in cart
  useEffect(() => {
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
  }, [product.id]);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const imageUrl = product.image || product.images?.[0] || null;
  const displayPrice = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;
  const [imageError, setImageError] = useState(false);

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
    if (variant === 'hot') return '🔥 Hot';
    if (variant === 'flash') return '⚡ Flash';
    if (variant === 'new') return '🆕 New';
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
          <PlaceholderImage>🪑</PlaceholderImage>
        )}
        {getBadgeText() && (
          <Badge $variant={variant}>{getBadgeText()}</Badge>
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
                📏 {product.dimensions_cm.width}×{product.dimensions_cm.depth}×{product.dimensions_cm.height}cm
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
          {product.rating && (
            <Rating>
              ⭐ {product.rating.toFixed(1)}
            </Rating>
          )}
          {quantity > 0 ? (
            <CartQuantityWrapper>
              <QuantityControls>
                <QuantityButton 
                  onClick={handleDecreaseQuantity}
                  disabled={isUpdating || quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
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
              <CartIcon>🛒</CartIcon>
            </CartButton>
          )}
        </Footer>
      </Content>
    </Card>
  );
};
