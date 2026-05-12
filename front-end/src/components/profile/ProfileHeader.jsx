import styled from 'styled-components';

const Container = styled.section`
  position: relative;
  overflow: hidden;
  padding: 30px;
  background:
    linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 48%, rgba(241,247,255,0.86) 100%) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.24), rgba(196, 184, 252, 0.2), rgba(255,255,255,0.82)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 24px 58px rgba(16, 24, 40, 0.1);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 22px;
  align-items: center;

  &::after {
    content: '';
    position: absolute;
    right: 18px;
    bottom: -46px;
    width: 210px;
    height: 210px;
    background: radial-gradient(circle, rgba(126, 193, 246, 0.2), transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Avatar = styled.div`
  width: 92px;
  height: 92px;
  border-radius: 28px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.primarySoftText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  font-weight: 900;
  flex-shrink: 0;
  box-shadow: 0 18px 34px rgba(16, 24, 40, 0.12);
`;

const Info = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
  min-width: 0;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: ${props => props.theme.colors.primarySoftText};
  ${props => props.theme.typography.caption}
  font-weight: 900;
  text-transform: uppercase;
`;

const DotMark = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${props => props.theme.colors.successBase};
`;

const Name = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: clamp(34px, 6vw, 58px);
  line-height: 0.98;
  letter-spacing: 0;
  margin: 0;
`;

const Email = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Location = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

const Pill = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.primary};
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 999px;
  padding: 8px 11px;
  font-weight: 900;
`;

export const ProfileHeader = ({ user, location }) => {
  const userName = user?.name || 'Guest User';
  const userEmail = user?.email || 'guest@example.com';
  const userLocation = location?.suburb || 'Location not set';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'G';

  return (
    <Container>
      <Avatar>{initials}</Avatar>
      <Info>
        <Eyebrow><DotMark />Your Shopply profile</Eyebrow>
        <Name>{userName}</Name>
        <Email>{userEmail}</Email>
        <Location>
          <Pill>{userLocation}</Pill>
          <Pill>Local shopper</Pill>
        </Location>
      </Info>
    </Container>
  );
};
