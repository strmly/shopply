import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  isolation: isolate;
  padding: 12px min(5vw, 48px);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.86)),
    radial-gradient(circle at 14% 0%, rgba(61, 129, 239, 0.08), transparent 28%),
    radial-gradient(circle at 88% 0%, rgba(245, 158, 11, 0.07), transparent 26%);
  border-bottom: 1px solid rgba(228, 231, 236, 0.72);
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.07);
  backdrop-filter: blur(18px);

  &::after {
    content: '';
    position: absolute;
    left: min(5vw, 48px);
    right: min(5vw, 48px);
    bottom: -1px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(61, 129, 239, 0.26), rgba(245, 158, 11, 0.18), transparent);
    pointer-events: none;
  }

  @media (max-width: 640px) {
    padding: 10px 12px;
  }
`;

const NavContent = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 8px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.86), rgba(255,255,255,0.72)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.18), rgba(228, 231, 236, 0.82), rgba(245, 158, 11, 0.12)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  box-shadow:
    0 18px 44px rgba(16, 24, 40, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(18px);

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
    gap: 10px;
    border-radius: 24px;
  }
`;

const MainCluster = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
`;

const BrandButton = styled.button`
  display: inline-grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 9px;
  height: 48px;
  padding: 0 12px 0 8px;
  border: 1px solid rgba(228, 231, 236, 0.82);
  border-radius: 999px;
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 14px 28px rgba(16, 24, 40, 0.06);

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(61, 129, 239, 0.28);
    color: ${props => props.theme.colors.primary};
    box-shadow: 0 18px 36px rgba(16, 24, 40, 0.1);
  }

  @media (max-width: 1040px) {
    display: none;
  }
`;

const BrandGlyph = styled.span`
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 15px;
  font-weight: 900;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
`;

const BrandText = styled.span`
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0;
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.09);
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 3px solid ${props => props.theme.colors.primarySoftBg};
    outline-offset: 2px;
  }
`;

const PageTitleWrap = styled.div`
  min-width: 0;
  display: grid;
  gap: 3px;
`;

const PageEyebrow = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  text-transform: uppercase;
`;

const PageTitle = styled.h1`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 900;
  font-size: 20px;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  width: fit-content;
  max-width: 240px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(196, 184, 252, 0.16), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 6px 10px 6px 7px;
  border-radius: 999px;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 8px 18px rgba(16, 24, 40, 0.06);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 26px rgba(16, 24, 40, 0.1);
  }

  &:active {
    transform: scale(0.97);
  }

  &:focus-visible {
    outline: 3px solid ${props => props.theme.colors.primarySoftBg};
    outline-offset: 2px;
  }
`;

const LocationIcon = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${props => props.theme.colors.successBase};
  box-shadow: 0 0 0 3px ${props => props.theme.colors.successSoftBg};
  flex-shrink: 0;
`;

const LocationText = styled.div`
  min-width: 0;
  text-align: left;
`;

const LocationLabel = styled.span`
  display: none;
`;

const ConfidenceDot = styled.span`
  display: none;
`;

const LocationValue = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(22vw, 180px);
`;

const LocationChange = styled.span`
  font-size: 10px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.secondary};
  white-space: nowrap;

  @media (max-width: 560px) {
    display: none;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  width: 100%;

  @media (max-width: 780px) {
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const SearchButton = styled.button`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 9px;
  flex: 1;
  min-width: 0;
  height: 46px;
  padding: 0 15px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.28), rgba(245, 158, 11, 0.18), rgba(255,255,255,0.84)) border-box;
  border: 1px solid transparent;
  border-radius: 999px;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.06);

  &:hover {
    border-color: transparent;
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 18px 36px rgba(16, 24, 40, 0.1);
  }

  &:focus-visible {
    outline: 3px solid ${props => props.theme.colors.primarySoftBg};
    outline-offset: 2px;
  }

  @media (max-width: 680px) {
    min-width: 46px;
    width: 46px;
    padding: 0;
    justify-content: center;
    grid-template-columns: auto;
  }
`;

const SearchLabel = styled.span`
  ${props => props.theme.typography.caption}
  font-weight: 900;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;

  @media (max-width: 680px) {
    display: none;
  }
`;

const RoomSelectWrap = styled.div`
  position: relative;
  flex-shrink: 0;
  display: grid;

  &::before {
    content: 'Rooms';
    position: absolute;
    left: 13px;
    top: 6px;
    color: ${props => props.theme.colors.primarySoftText};
    font-size: 9px;
    font-weight: 900;
    line-height: 1;
    text-transform: uppercase;
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    right: 15px;
    top: 50%;
    width: 7px;
    height: 7px;
    border-right: 2px solid ${props => props.theme.colors.text.secondary};
    border-bottom: 2px solid ${props => props.theme.colors.text.secondary};
    transform: translateY(-65%) rotate(45deg);
    pointer-events: none;
    transition: ${props => props.theme.transitions.swift};
  }

  &:focus-within::after,
  &:hover::after {
    border-color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 980px) {
    display: none;
  }
`;

const RoomSelect = styled.select`
  appearance: none;
  height: 50px;
  min-width: 142px;
  max-width: 170px;
  padding: 17px 34px 5px 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.2), rgba(228, 231, 236, 0.84), rgba(245, 158, 11, 0.16)) border-box;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  outline: none;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.06);

  &:hover,
  &:focus {
    border-color: transparent;
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 18px 36px rgba(16, 24, 40, 0.1);
  }

  &:focus-visible {
    outline: 3px solid ${props => props.theme.colors.primarySoftBg};
    outline-offset: 2px;
  }
`;

const IconButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(228, 231, 236, 0.94), rgba(255,255,255,0.86)) border-box;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  color: ${props => props.theme.colors.text.primary};
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.06);

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: transparent;
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 18px 36px rgba(16, 24, 40, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 3px solid ${props => props.theme.colors.primarySoftBg};
    outline-offset: 2px;
  }
`;

const NavIconWrap = styled.span`
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

const NotificationAction = styled.div`
  position: relative;
  display: inline-flex;

  &:hover > div,
  &:focus-within > div {
    opacity: 1;
    transform: translate(-50%, 0);
    pointer-events: auto;
  }
`;

const NotificationHoverCard = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  width: 250px;
  padding: 14px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96)) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.26), rgba(228, 231, 236, 0.82), rgba(245, 158, 11, 0.14)) border-box;
  border: 1px solid transparent;
  box-shadow:
    0 24px 54px rgba(16, 24, 40, 0.18),
    inset 0 1px 0 rgba(255,255,255,0.88);
  opacity: 0;
  transform: translate(-50%, -6px);
  transition: ${props => props.theme.transitions.swift};
  pointer-events: none;
  z-index: 20;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    width: 12px;
    height: 12px;
    background: #ffffff;
    border-left: 1px solid rgba(228, 231, 236, 0.82);
    border-top: 1px solid rgba(228, 231, 236, 0.82);
    transform: translateX(-50%) rotate(45deg);
  }

  @media (max-width: 780px) {
    display: none;
  }
`;

const NotificationHoverTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const NotificationHoverIcon = styled.span`
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primary};
  border: 1px solid rgba(61, 129, 239, 0.18);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
`;

const NotificationHoverText = styled.div`
  min-width: 0;
`;

const NotificationHoverTitle = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 900;
  line-height: 1.2;
`;

const NotificationHoverMeta = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 3px;
  font-weight: 800;
`;

const NotificationHoverFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(228, 231, 236, 0.72);
`;

const NotificationHoverPill = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.$active ? props.theme.colors.primarySoftText : props.theme.colors.text.secondary};
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : '#ffffff'};
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.22)' : 'rgba(228, 231, 236, 0.84)'};
  border-radius: 999px;
  padding: 6px 9px;
  font-weight: 900;
`;

const CartAction = styled.div`
  position: relative;
  display: inline-flex;

  &:hover > div,
  &:focus-within > div {
    opacity: 1;
    transform: translate(-50%, 0);
    pointer-events: auto;
  }
`;

const CartHoverCard = styled(NotificationHoverCard)``;

const CartHoverIcon = styled(NotificationHoverIcon)`
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primarySoftText};
`;

const ProfileAction = styled.div`
  position: relative;
  display: inline-flex;

  &:hover > div,
  &:focus-within > div {
    opacity: 1;
    transform: translate(-50%, 0);
    pointer-events: auto;
  }
`;

const ProfileHoverCard = styled(NotificationHoverCard)``;

const ProfileHoverIcon = styled(NotificationHoverIcon)`
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    ${props => props.theme.colors.gradient.soft} border-box;
  color: ${props => props.theme.colors.primarySoftText};
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: ${props => props.theme.colors.danger?.[500] || props.theme.colors.dangerBase};
  border-radius: 999px;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.theme.typography.caption}
  font-size: 10px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.inverse};
  line-height: 1;
  box-shadow: 0 10px 18px rgba(198, 40, 80, 0.28);
  white-space: nowrap;
`;

const ProfileAuthRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(228, 231, 236, 0.72);
  margin-top: 10px;
`;

const ProfileAuthBtn = styled.button`
  height: 36px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  white-space: nowrap;

  ${props => props.$primary ? `
    background: ${props.theme.colors.text.primary};
    color: ${props.theme.colors.text.inverse};
    border: none;
    box-shadow: 0 8px 18px rgba(16, 24, 40, 0.18);
    &:hover {
      background: ${props.theme.colors.primary};
      box-shadow: 0 12px 24px rgba(61, 129, 239, 0.28);
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text.primary};
    border: 1px solid rgba(228, 231, 236, 0.9);
    &:hover {
      border-color: rgba(61, 129, 239, 0.36);
      color: ${props.theme.colors.primary};
      background: ${props.theme.colors.primarySoftBg};
      transform: translateY(-1px);
    }
  `}
`;

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

const BellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.8 10.5c0-3.2 2-5.6 5.2-5.6s5.2 2.4 5.2 5.6v3.4l1.8 2.6H5l1.8-2.6v-3.4Z" />
    <path d="M9.8 19c.5 1.2 1.2 1.8 2.2 1.8s1.7-.6 2.2-1.8" />
  </svg>
);

export const TopNavigation = ({
  location,
  title,
  onBack,
  onLocationClick,
  onNotificationClick,
  onSearchClick,
  onCartClick,
  onProfileClick,
  onRoomChange,
  unreadCount = 0,
  cartCount: cartCountProp,
  selectedRoom = 'All Rooms',
}) => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(cartCountProp || 0);
  const suburb = location?.suburb || 'Your Area';
  const city = location?.city || '';
  const isTitleMode = Boolean(title);

  useEffect(() => {
    if (cartCountProp !== undefined) {
      setCartCount(cartCountProp);
      return;
    }

    const loadCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('shopply_cart') || '[]');
        const count = Array.isArray(cart)
          ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
          : Number(localStorage.getItem('shopply_cart_count') || 0);
        setCartCount(count);
      } catch {
        setCartCount(Number(localStorage.getItem('shopply_cart_count') || 0));
      }
    };

    loadCartCount();
    window.addEventListener('cartUpdated', loadCartCount);
    window.addEventListener('storage', loadCartCount);
    return () => {
      window.removeEventListener('cartUpdated', loadCartCount);
      window.removeEventListener('storage', loadCartCount);
    };
  }, [cartCountProp]);

  const handleCartClick = () => {
    if (onCartClick) onCartClick();
    else navigate('/cart');
  };

  const handleProfileClick = () => {
    if (onProfileClick) onProfileClick();
    else navigate('/profile');
  };

  const handleRoomSelect = (room) => {
    if (onRoomChange) {
      onRoomChange(room);
      return;
    }

    const roomRoutes = {
      'All Rooms': 'all',
      'Living Room': 'living',
      Bedroom: 'bedroom',
      Dining: 'dining',
      Office: 'office',
      Outdoor: 'outdoor',
      Kids: 'kids',
      Storage: 'storage',
    };

    navigate(`/category/${roomRoutes[room] || encodeURIComponent(room.toLowerCase().replace(/\s+/g, '-'))}`);
  };

  return (
    <NavContainer>
      <NavContent>
        <MainCluster>
          {isTitleMode ? (
            <>
              {onBack && (
                <BackButton onClick={onBack} aria-label="Go back">
                  &lt;
                </BackButton>
              )}
              <PageTitleWrap>
                <PageEyebrow>Shopply</PageEyebrow>
                <PageTitle>{title}</PageTitle>
              </PageTitleWrap>
            </>
          ) : (
            <>
              <BrandButton type="button" onClick={() => navigate('/')} aria-label="Go to home">
                <BrandGlyph>S</BrandGlyph>
                <BrandText>Shopply</BrandText>
              </BrandButton>
              <LocationButton onClick={onLocationClick}>
                <LocationIcon aria-hidden="true" />
                <LocationText>
                  <LocationLabel>
                    <ConfidenceDot aria-hidden="true" />
                    Deliver to
                  </LocationLabel>
                  <LocationValue>{suburb}{city ? `, ${city}` : ''}</LocationValue>
                </LocationText>
                <LocationChange>Change</LocationChange>
              </LocationButton>
            </>
          )}
        </MainCluster>

        <Actions>
          <SearchButton onClick={onSearchClick} aria-label="Search">
            <NavIconWrap>
              <SearchIcon />
            </NavIconWrap>
            <SearchLabel>Search furniture, rooms, stores</SearchLabel>
          </SearchButton>
          <NotificationAction>
            <IconButton onClick={onNotificationClick} aria-label="Notifications">
              <NavIconWrap>
                <BellIcon />
              </NavIconWrap>
              {unreadCount > 0 && (
                <NotificationBadge>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </NotificationBadge>
              )}
            </IconButton>
            <NotificationHoverCard role="status">
              <NotificationHoverTop>
                <NotificationHoverIcon>
                  <NavIconWrap>
                    <BellIcon />
                  </NavIconWrap>
                </NotificationHoverIcon>
                <NotificationHoverText>
                  <NotificationHoverTitle>Notifications</NotificationHoverTitle>
                  <NotificationHoverMeta>
                    {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'No unread updates'}
                  </NotificationHoverMeta>
                </NotificationHoverText>
              </NotificationHoverTop>
              <NotificationHoverFooter>
                <NotificationHoverPill $active={unreadCount > 0}>
                  {unreadCount > 0 ? 'New activity' : 'All caught up'}
                </NotificationHoverPill>
                <NotificationHoverPill>Open panel</NotificationHoverPill>
              </NotificationHoverFooter>
            </NotificationHoverCard>
          </NotificationAction>
          <ProfileAction>
            <IconButton onClick={handleProfileClick} aria-label="Profile">
              <NavIconWrap>
                <ProfileIcon />
              </NavIconWrap>
            </IconButton>
            <ProfileHoverCard role="status">
              <NotificationHoverTop>
                <ProfileHoverIcon>
                  <NavIconWrap>
                    <ProfileIcon />
                  </NavIconWrap>
                </ProfileHoverIcon>
                <NotificationHoverText>
                  <NotificationHoverTitle>Account</NotificationHoverTitle>
                  <NotificationHoverMeta>
                    Orders, addresses, settings &amp; seller tools
                  </NotificationHoverMeta>
                </NotificationHoverText>
              </NotificationHoverTop>
              <ProfileAuthRow>
                <ProfileAuthBtn onClick={() => navigate('/profile')}>
                  Sign in
                </ProfileAuthBtn>
                <ProfileAuthBtn $primary onClick={() => navigate('/profile')}>
                  Sign up
                </ProfileAuthBtn>
              </ProfileAuthRow>
            </ProfileHoverCard>
          </ProfileAction>
        </Actions>
      </NavContent>
    </NavContainer>
  );
};
