import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Header = styled.header`
  position: sticky;
  top: 0;
  background: ${props => props.$scrolled 
    ? props.theme.colors.background 
    : 'transparent'};
  z-index: 1000;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.$scrolled ? props.theme.shadows.sm : 'none'};
  backdrop-filter: blur(10px);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  background: ${props => props.$scrolled 
    ? props.theme.colors.surface 
    : 'rgba(255, 255, 255, 0.9)'};
  border: none;
  border-radius: ${props => props.theme.radii.circle};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: 20px;
  box-shadow: ${props => props.theme.shadows.xs};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ProductTitle = styled.h1`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  flex: 1;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CartButton = styled.button`
  position: relative;
  background: ${props => props.$scrolled 
    ? props.theme.colors.surface 
    : 'rgba(255, 255, 255, 0.9)'};
  border: none;
  border-radius: ${props => props.theme.radii.circle};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: 20px;
  box-shadow: ${props => props.theme.shadows.xs};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    transform: scale(1.05);
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.text.inverse};
  border-radius: ${props => props.theme.radii.circle};
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  border: 2px solid ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
`;

export const ProductDetailHeader = ({ product, onBack, cartCount: propCartCount }) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);
      setShowTitle(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load cart count from localStorage
    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    };

    loadCartCount();

    // Listen for storage changes (when cart is updated in other tabs/components)
    const handleStorageChange = () => {
      loadCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  // Use prop if provided, otherwise use state
  const displayCount = propCartCount !== undefined ? propCartCount : cartCount;

  return (
    <Header $scrolled={scrolled}>
      <HeaderContent>
        <BackButton $scrolled={scrolled} onClick={onBack}>
          ←
        </BackButton>
        
        <ProductTitle $visible={showTitle}>
          {product?.name || ''}
        </ProductTitle>
        
        <RightActions>
          <CartButton $scrolled={scrolled} onClick={() => navigate('/cart')}>
            🛒
            {displayCount > 0 && <CartBadge>{displayCount > 99 ? '99+' : displayCount}</CartBadge>}
          </CartButton>
        </RightActions>
      </HeaderContent>
    </Header>
  );
};

