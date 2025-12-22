import styled from 'styled-components';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  flex-shrink: 0;
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Name = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 24px;
  margin: 0;
`;

const Email = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const Location = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: ${props => props.theme.spacing.xs};
`;

export const ProfileHeader = ({ user, location }) => {
  const userName = user?.name || 'Guest User';
  const userEmail = user?.email || 'guest@example.com';
  const userLocation = location?.suburb || 'Not set';

  return (
    <Container>
      <Avatar>👤</Avatar>
      <Info>
        <Name>{userName}</Name>
        <Email>{userEmail}</Email>
        <Location>
          <span>📍</span>
          {userLocation}
        </Location>
      </Info>
    </Container>
  );
};
