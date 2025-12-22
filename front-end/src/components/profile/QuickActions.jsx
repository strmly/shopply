import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { OrdersQuickActionCard } from '../orders/OrdersQuickActionCard';
import { ReturnsQuickActionCard } from '../returns/ReturnsQuickActionCard';
import { ReviewsQuickActionCard } from '../reviews/ReviewsQuickActionCard';
import { VoucherQuickActionCard } from '../vouchers/VoucherQuickActionCard';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 18px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.md};
`;

const ActionTile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    opacity: 0.8;
  }
`;

const Icon = styled.div`
  font-size: 32px;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Label = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 13px;
  text-align: center;
`;

const actions = [
  { id: 'addresses', label: 'My Addresses', icon: '📍', route: '/addresses' },
  { id: 'payments', label: 'Payment Methods', icon: '💳', route: '/payment-methods' },
  { id: 'reviews', label: 'Reviews', icon: '⭐', route: '/reviews' },
  { id: 'vouchers', label: 'Vouchers', icon: '🎁', route: '/vouchers' },
];

export const QuickActions = ({ navigate }) => {
  const handleAction = (route) => {
    navigate(route);
  };

  return (
    <Container>
      <Title>Quick Actions</Title>
      <OrdersQuickActionCard />
      <ReturnsQuickActionCard />
      <ReviewsQuickActionCard />
      <VoucherQuickActionCard />
      <Grid>
        {actions.map((action) => (
          <ActionTile
            key={action.id}
            onClick={() => handleAction(action.route)}
          >
            <Icon>{action.icon}</Icon>
            <Label>{action.label}</Label>
          </ActionTile>
        ))}
      </Grid>
    </Container>
  );
};











