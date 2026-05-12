import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  background: #ffffff;
  border-radius: 26px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border.default};
  box-shadow: 0 16px 36px rgba(16, 24, 40, 0.06);
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
  padding: 14px;
  background: ${props => props.theme.colors.neutral[50]};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;

  &:hover {
    border-color: rgba(61, 129, 239, 0.28);
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateX(3px);
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

export const SupportHelp = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>Support & Help</Title>
      <List>
        <ListItem onClick={() => navigate('/support/help')}>
          <Label>Help Center</Label>
          <Arrow>&gt;</Arrow>
        </ListItem>
        <ListItem onClick={() => navigate('/support/contact')}>
          <Label>Contact Support</Label>
          <Arrow>&gt;</Arrow>
        </ListItem>
        <ListItem onClick={() => navigate('/support/faqs')}>
          <Label>FAQs</Label>
          <Arrow>&gt;</Arrow>
        </ListItem>
      </List>
    </Container>
  );
};
