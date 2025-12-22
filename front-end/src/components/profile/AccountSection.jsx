import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 18px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const ListItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: transparent;

  &:last-child {
    border-bottom: none;
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: -2px;
  }

  &:active {
    background: ${props => props.theme.colors.neutral[50]};
  }
`;

const Label = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 15px;
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 14px;
`;

export const AccountSection = ({ user, navigate }) => {
  return (
    <Container>
      <Title>Account</Title>
      <List>
        <ListItem onClick={() => navigate('/account/edit-profile')}>
          <Label>Edit Profile</Label>
          <Arrow>→</Arrow>
        </ListItem>
        <ListItem onClick={() => navigate('/account/change-password')}>
          <Label>Change Password</Label>
          <Arrow>→</Arrow>
        </ListItem>
        <ListItem onClick={() => navigate('/account/notifications')}>
          <Label>Notification Settings</Label>
          <Arrow>→</Arrow>
        </ListItem>
      </List>
    </Container>
  );
};
