import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { OrdersQuickActionCard } from '../orders/OrdersQuickActionCard';
import { ReturnsQuickActionCard } from '../returns/ReturnsQuickActionCard';
import { ReviewsQuickActionCard } from '../reviews/ReviewsQuickActionCard';
import { VoucherQuickActionCard } from '../vouchers/VoucherQuickActionCard';

const Container = styled.section`
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.18), rgba(196, 184, 252, 0.14), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  animation: ${fadeIn} 0.3s ease-in;
  display: grid;
  gap: 16px;
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 24px;
  line-height: 1.1;
  margin: 0;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ActionTile = styled.button`
  display: grid;
  justify-items: start;
  gap: 10px;
  padding: 16px;
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 20px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  min-height: 118px;
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-3px);
    box-shadow: 0 18px 34px rgba(16, 24, 40, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Icon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 15px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.colors.border.default};
  color: ${props => props.theme.colors.primarySoftText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
`;

const Label = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
`;

const actions = [
  { id: 'addresses', label: 'My Addresses', icon: 'A', route: '/addresses' },
  { id: 'payments', label: 'Payment Methods', icon: 'P', route: '/payment-methods' },
  { id: 'reviews', label: 'Reviews', icon: 'R', route: '/reviews' },
  { id: 'vouchers', label: 'Vouchers', icon: 'V', route: '/vouchers' },
];

export const QuickActions = ({ navigate }) => {
  const handleAction = (route) => {
    navigate(route);
  };

  return (
    <Container>
      <Title>Quick Actions</Title>
      <FeaturedGrid>
        <OrdersQuickActionCard />
        <ReturnsQuickActionCard />
        <ReviewsQuickActionCard />
        <VoucherQuickActionCard />
      </FeaturedGrid>
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
