import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.18), rgba(196, 184, 252, 0.14), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  padding: 20px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 22px;
  line-height: 1.1;
  margin: 0 0 14px;
`;

const List = styled.div`
  display: grid;
  gap: 8px;
`;

const ListItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px;
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: rgba(61, 129, 239, 0.28);
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateX(3px);
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Label = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
`;

export const AccountSection = ({ navigate }) => {
  return (
    <Container>
      <Title>Account</Title>
      <List>
        <ListItem onClick={() => navigate('/account/edit-profile')}>
          <Label>Edit Profile</Label>
          <Arrow>&gt;</Arrow>
        </ListItem>
        <ListItem onClick={() => navigate('/account/change-password')}>
          <Label>Change Password</Label>
          <Arrow>&gt;</Arrow>
        </ListItem>
        <ListItem onClick={() => navigate('/account/notifications')}>
          <Label>Notification Settings</Label>
          <Arrow>&gt;</Arrow>
        </ListItem>
      </List>
    </Container>
  );
};
