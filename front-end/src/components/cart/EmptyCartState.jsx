import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { Button } from '../ui';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  animation: ${fadeIn} 0.3s ease-in;
`;

const Illustration = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${props => props.theme.radii.xl};
  background: ${props => props.theme.colors.gradient.soft};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  margin-bottom: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 700;
  font-size: 24px;
`;

const Message = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.xl} 0;
  font-size: 15px;
  max-width: 300px;
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
  justify-content: center;
  margin-top: ${props => props.theme.spacing.md};
`;

const QuickActionChip = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: 13px;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-1px);
  }
`;

export const EmptyCartState = ({ onStartShopping }) => {
  const quickActions = [
    { label: 'Groceries', icon: '🛒' },
    { label: 'Essentials', icon: '📦' },
    { label: 'Trending', icon: '🔥' },
  ];

  return (
    <Container>
      <Illustration>🛒</Illustration>
      <Title>Your cart is empty</Title>
      <Message>
        Start shopping from stores near you
      </Message>
      <Button variant="primary" onClick={onStartShopping}>
        Start Shopping
      </Button>
      <QuickActions>
        {quickActions.map((action, index) => (
          <QuickActionChip key={index}>
            {action.icon} {action.label}
          </QuickActionChip>
        ))}
      </QuickActions>
    </Container>
  );
};











