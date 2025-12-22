import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
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
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const ListItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
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

export const SupportHelp = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>Support & Help</Title>
      <List>
        <ListItem onClick={() => navigate('/support/help')}>
          <Label>Help Center</Label>
          <Arrow>→</Arrow>
        </ListItem>
        <ListItem onClick={() => navigate('/support/contact')}>
          <Label>Contact Support</Label>
          <Arrow>→</Arrow>
        </ListItem>
        <ListItem onClick={() => navigate('/support/faqs')}>
          <Label>FAQs</Label>
          <Arrow>→</Arrow>
        </ListItem>
      </List>
    </Container>
  );
};
