import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { API_BASE_URL } from '../../config/api.js';
import { AuthModal } from '../auth';
import { isSignedIn } from '../../utils/authState';
import { useUser } from '../../context/UserContext';

const NavContainer = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  padding: 0 min(4vw, 32px) calc(10px + env(safe-area-inset-bottom));
  pointer-events: none;
`;

const NavShell = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 8px;
  background:
    linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.22), rgba(196, 184, 252, 0.18), rgba(255,255,255,0.72)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  box-shadow: 0 -8px 40px rgba(16, 24, 40, 0.13);
  backdrop-filter: blur(18px);
  pointer-events: auto;
`;

const NavList = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  min-width: 0;
`;

const NavButton = styled.button`
  width: 100%;
  min-height: 58px;
  display: grid;
  grid-template-rows: 24px auto;
  align-items: center;
  justify-items: center;
  gap: 4px;
  padding: 8px 6px;
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.22)' : 'transparent'};
  border-radius: 20px;
  background: ${props => props.$active
    ? props.theme.colors.gradient.soft
    : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 7px;
    width: 28px;
    height: 3px;
    border-radius: 999px;
    background: ${props => props.theme.colors.gradient.primary};
    opacity: ${props => props.$active ? 1 : 0};
    transform: translateY(${props => props.$active ? '0' : '-3px'});
    transition: ${props => props.theme.transitions.swift};
  }

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: ${props => props.$active ? props.theme.colors.gradient.soft : 'rgba(232, 241, 255, 0.65)'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0) scale(0.97);
  }
`;

const IconWrap = styled.span`
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: inherit;

  svg {
    width: 22px;
    height: 22px;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -9px;
  right: -13px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  background: ${props => props.theme.colors.dangerBase};
  border: 2px solid #ffffff;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.theme.typography.caption}
  font-size: 10px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.inverse};
  line-height: 1;
  box-shadow: 0 10px 18px rgba(198, 40, 80, 0.28);
`;

const Label = styled.span`
  ${props => props.theme.typography.caption}
  width: 100%;
  color: inherit;
  font-weight: ${props => props.$active ? 900 : 700};
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 10.8 12 3l9 7.8" />
    <path d="M5.5 9.5V21h13V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="10.8" cy="10.8" r="6.8" />
    <path d="m16 16 5 5" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5h2l2 11h10l2-8H7" />
    <circle cx="10" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21c1.2-4.2 4-6.2 7.5-6.2s6.3 2 7.5 6.2" />
  </svg>
);

export const BottomNavigation = ({ currentPath, onSearchClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = currentPath || location.pathname;
  const [cartCount, setCartCount] = useState(0);
  const { role, loading: contextLoading } = useUser();
  const profileSignedIn = contextLoading ? isSignedIn() : role !== 'guest';
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/search', icon: SearchIcon, label: 'Search' },
    { path: '/cart', icon: CartIcon, label: 'Cart' },
    { path: '/profile', icon: ProfileIcon, label: 'Profile' },
  ];

  useEffect(() => {
    const loadCartCount = () => {
      try {
        const cartStr = localStorage.getItem('shopply_cart');
        let calculatedCount = 0;

        if (cartStr) {
          const cart = JSON.parse(cartStr);
          if (Array.isArray(cart) && cart.length > 0) {
            calculatedCount = cart.reduce((sum, item) => {
              const quantity = typeof item.quantity === 'number'
                ? item.quantity
                : parseInt(item.quantity, 10) || 1;
              return sum + quantity;
            }, 0);
          }
        }

        setCartCount(calculatedCount);
        localStorage.setItem('shopply_cart_count', calculatedCount.toString());
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartCount(0);
      }
    };

    loadCartCount();

    const syncWithServer = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cart?userId=default`);
        const data = await response.json();
        if (data.success && data.data && data.data.itemCount !== undefined) {
          const serverCount = data.data.itemCount || 0;
          if (serverCount > 0) {
            setCartCount(serverCount);
            localStorage.setItem('shopply_cart_count', serverCount.toString());
          }
        }
      } catch {
        // Local storage remains the fallback source.
      }
    };

    const serverSyncInterval = setInterval(syncWithServer, 5000);
    syncWithServer();

    window.addEventListener('cartUpdated', loadCartCount);
    window.addEventListener('storage', loadCartCount);

    return () => {
      window.removeEventListener('cartUpdated', loadCartCount);
      window.removeEventListener('storage', loadCartCount);
      clearInterval(serverSyncInterval);
    };
  }, []);

  const isActive = (itemPath) => {
    if (itemPath === '/') return activePath === '/';
    return activePath === itemPath || activePath.startsWith(`${itemPath}/`);
  };

  const handleClick = (item) => {
    if (item.path === '/search' && onSearchClick) {
      onSearchClick();
      return;
    }

    if (item.path === '/profile' && !profileSignedIn) {
      setShowAuthModal(true);
      return;
    }

    navigate(item.path);
  };

  return (
    <>
      <NavContainer aria-label="Primary navigation">
        <NavShell>
          <NavList>
            {navItems.map((item) => {
              const active = isActive(item.path);
              const ItemIcon = item.icon;

              return (
                <NavItem key={item.path}>
                  <NavButton
                    type="button"
                    $active={active}
                    onClick={() => handleClick(item)}
                    aria-current={active ? 'page' : undefined}
                    aria-label={item.label}
                  >
                    <IconWrap>
                      <ItemIcon />
                      {item.path === '/cart' && cartCount > 0 && (
                        <CartBadge>{cartCount > 99 ? '99+' : cartCount}</CartBadge>
                      )}
                    </IconWrap>
                    <Label $active={active}>{item.label}</Label>
                  </NavButton>
                </NavItem>
              );
            })}
          </NavList>
        </NavShell>
      </NavContainer>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          navigate('/profile');
        }}
      />
    </>
  );
};
