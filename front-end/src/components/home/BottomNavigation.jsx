import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border?.default || props.theme.colors.border?.light || props.theme.colors.neutral[100]};
  padding: ${props => props.theme.spacing.xs} 0;
  z-index: 1000;
  box-shadow: ${props => props.theme.shadows.lg};
`;

const NavList = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 100%;
`;

const NavItem = styled.li`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};

  &:active {
    transform: scale(0.95);
  }
`;

const Icon = styled.div`
  font-size: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const CartBadge = styled.span`
  position: absolute;
  top: calc(-1 * ${props => props.theme.spacing.xs});
  right: calc(-1 * ${props => props.theme.spacing.md});
  min-width: ${props => props.theme.spacing.xl};
  height: ${props => props.theme.spacing.xl};
  padding: 0 ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.card?.default || props.theme.colors.background};
  border-radius: ${props => props.theme.radii.md};
  border: 2px solid ${props => props.theme.colors.dangerBase};
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.theme.typography.caption}
  font-weight: 700;
  color: ${props => props.theme.colors.dangerBase};
  line-height: 1;
  z-index: 10;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Label = styled.span`
  ${props => props.theme.typography.caption}
  font-weight: ${props => props.$active ? 600 : 500};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
`;

export const BottomNavigation = ({ currentPath, onSearchClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = currentPath || location.pathname;
  const [cartCount, setCartCount] = useState(0);

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/search', icon: '🔍', label: 'Search' },
    { path: '/cart', icon: '🛒', label: 'Cart' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  // Load cart count and listen for updates
  useEffect(() => {
    const loadCartCount = () => {
      try {
        // Calculate from cart array (most reliable)
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
        
        // Also update stored count
        if (calculatedCount > 0) {
          localStorage.setItem('shopply_cart_count', calculatedCount.toString());
        } else {
          localStorage.setItem('shopply_cart_count', '0');
        }
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartCount(0);
      }
    };

    // Load immediately
    loadCartCount();

    // Also try to sync with server cart periodically
    const syncWithServer = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cart?userId=default');
        const data = await response.json();
        if (data.success && data.data && data.data.itemCount !== undefined) {
          const serverCount = data.data.itemCount || 0;
          if (serverCount > 0) {
            setCartCount(serverCount);
            localStorage.setItem('shopply_cart_count', serverCount.toString());
          }
        }
      } catch (error) {
        // Silently fail - use localStorage count
      }
    };

    // Sync with server every 5 seconds
    const serverSyncInterval = setInterval(syncWithServer, 5000);
    syncWithServer(); // Also sync immediately

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
      clearInterval(serverSyncInterval);
    };
  }, []);

  const ProfileIcon = ({ active }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: active ? 'inherit' : 'inherit' }}
    >
      <path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        fill="currentColor"
      />
      <path
        d="M12 14C7.58172 14 4 16.6863 4 20V22H20V20C20 16.6863 16.4183 14 12 14Z"
        fill="currentColor"
      />
    </svg>
  );

  const handleClick = (item) => {
    if (item.path === '/search' && onSearchClick) {
      onSearchClick();
    } else {
      navigate(item.path);
    }
  };

  return (
    <NavContainer>
      <NavList>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            $active={activePath === item.path}
            onClick={() => handleClick(item)}
          >
            <Icon>
              {item.path === '/profile' ? (
                <ProfileIcon active={activePath === item.path} />
              ) : item.path === '/cart' ? (
                <>
                  {item.icon}
                  {cartCount > 0 && (
                    <CartBadge>
                      {cartCount > 99 ? '99+' : cartCount}
                    </CartBadge>
                  )}
                </>
              ) : (
                item.icon
              )}
            </Icon>
            <Label $active={activePath === item.path}>{item.label}</Label>
          </NavItem>
        ))}
      </NavList>
    </NavContainer>
  );
};
