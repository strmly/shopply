import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Header = styled.header`
  position: sticky;
  top: 0;
  background: ${props => props.$scrolled ? 'rgba(255, 255, 255, 0.86)' : 'transparent'};
  z-index: 1000;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.$scrolled ? '0 12px 32px rgba(16, 24, 40, 0.08)' : 'none'};
  backdrop-filter: blur(18px);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1180px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.md} min(5vw, 48px);
  gap: ${props => props.theme.spacing.md};
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.circle};
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  color: ${props => props.theme.colors.text.primary};
  font-size: 20px;
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.1);

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ProductTitle = styled.h1`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  flex: 1;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CartButton = styled(IconButton)`
  position: relative;
`;

const CartBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: ${props => props.theme.colors.dangerBase};
  color: ${props => props.theme.colors.text.inverse};
  border-radius: ${props => props.theme.radii.circle};
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
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
    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
      const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    };

    loadCartCount();
    window.addEventListener('storage', loadCartCount);
    window.addEventListener('cartUpdated', loadCartCount);

    return () => {
      window.removeEventListener('storage', loadCartCount);
      window.removeEventListener('cartUpdated', loadCartCount);
    };
  }, []);

  const displayCount = propCartCount !== undefined ? propCartCount : cartCount;

  return (
    <Header $scrolled={scrolled}>
      <HeaderContent>
        <IconButton onClick={onBack} aria-label="Go back">
          &lt;
        </IconButton>

        <ProductTitle $visible={showTitle}>
          {product?.name || ''}
        </ProductTitle>

        <CartButton onClick={() => navigate('/cart')} aria-label="Open cart">
          +
          {displayCount > 0 && <CartBadge>{displayCount > 99 ? '99+' : displayCount}</CartBadge>}
        </CartButton>
      </HeaderContent>
    </Header>
  );
};
