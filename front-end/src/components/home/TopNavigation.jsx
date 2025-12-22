import styled from 'styled-components';

const NavContainer = styled.nav`
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border?.default || props.theme.colors.border?.light || props.theme.colors.neutral[100]};
  z-index: 100;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.xs};
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  max-width: 100%;
`;

const LocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  transition: ${props => props.theme.transitions.swift};
  flex: 1;
  min-width: 0;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const LocationIcon = styled.span`
  font-size: ${props => props.theme.typography.body1?.match(/font-size:\s*(\d+px)/)?.[1] || '16px'};
  flex-shrink: 0;
`;

const LocationText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
`;

const LocationLabel = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  white-space: nowrap;
`;

const LocationValue = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.theme.spacing.xxl};
  height: ${props => props.theme.spacing.xxl};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border?.default || props.theme.colors.border?.light || props.theme.colors.neutral[100]};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: ${props => props.theme.typography.body1?.match(/font-size:\s*(\d+px)/)?.[1] || '16px'};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const NotificationButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.theme.spacing.xxl};
  height: ${props => props.theme.spacing.xxl};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border?.default || props.theme.colors.border?.light || props.theme.colors.neutral[100]};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: ${props => props.theme.typography.body1?.match(/font-size:\s*(\d+px)/)?.[1] || '16px'};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: calc(-1 * ${props => props.theme.spacing.xs});
  right: calc(-1 * ${props => props.theme.spacing.xs});
  min-width: ${props => props.theme.spacing.lg};
  height: ${props => props.theme.spacing.lg};
  padding: 0 ${props => props.theme.spacing.xs};
  background: ${props =>
    (props.theme.colors.danger && props.theme.colors.danger[500]) ||
    props.theme.colors.dangerBase};
  border-radius: ${props => props.theme.radii.sm};
  border: 2px solid ${props => props.theme.colors.surface || props.theme.colors.card?.default || props.theme.colors.neutral.white};
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.theme.typography.caption}
  font-weight: 700;
  color: ${props => props.theme.colors.text.inverse};
  line-height: 1;
  z-index: 10;
  box-shadow: ${props => props.theme.shadows.sm};
  white-space: nowrap;
`;

export const TopNavigation = ({
  location,
  onLocationClick,
  onSearch,
  onNotificationClick,
  onSearchClick,
  onProductClick,
  onAddToCart,
  unreadCount = 0,
}) => {
  const suburb = location?.suburb || 'Your Area';
  const city = location?.city || '';

  return (
    <NavContainer>
      <NavContent>
        <LocationButton onClick={onLocationClick}>
          <LocationIcon>📍</LocationIcon>
          <LocationText>
            <LocationLabel>Deliver to</LocationLabel>
            <LocationValue>{suburb}{city ? `, ${city}` : ''}</LocationValue>
          </LocationText>
        </LocationButton>

        <Actions>
          <SearchButton onClick={onSearchClick} aria-label="Search">
            🔍
          </SearchButton>
          <NotificationButton onClick={onNotificationClick} aria-label="Notifications">
            🔔
            {unreadCount > 0 && (
              <NotificationBadge>
                {unreadCount > 9 ? '9+' : unreadCount}
              </NotificationBadge>
            )}
          </NotificationButton>
        </Actions>
      </NavContent>
    </NavContainer>
  );
};
