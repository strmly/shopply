import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const pop = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`;

const Card = styled.button`
  width: 100%;
  padding: 18px;
  border: 1px solid rgba(228, 231, 236, 0.92);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(61, 129, 239, 0.26);
    box-shadow: 0 24px 54px rgba(16, 24, 40, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 900;
`;

const Badge = styled.div`
  min-width: 42px;
  height: 42px;
  padding: 0 12px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: ${props => props.$count > 4 ? props.theme.colors.dangerBase : props.$count > 0 ? props.theme.colors.warningBase : props.theme.colors.successBase};
  color: #ffffff;
  font-size: 18px;
  font-weight: 950;
  animation: ${props => props.$animate ? pop : 'none'} 0.5s ease-out;
`;

const Copy = styled.p`
  margin: 14px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.5;
  font-weight: 750;
`;

const Alert = styled.div`
  margin-top: 14px;
  padding: 12px;
  border-radius: 16px;
  background: ${props => props.theme.colors.warningSoftBg};
  border: 1px solid rgba(245, 158, 11, 0.22);
  color: ${props => props.theme.colors.warningBase};
  font-size: 12px;
  font-weight: 850;
`;

const CTA = styled.div`
  margin-top: 16px;
  min-height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 13px;
  font-weight: 950;
  box-shadow: 0 14px 28px rgba(61, 129, 239, 0.22);
`;

export const PendingOrdersWidget = ({
  pendingOrders = { count: 0, orders: [], urgentCount: 0 },
  onViewOrders,
}) => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [previousCount, setPreviousCount] = useState(pendingOrders.count);

  useEffect(() => {
    if (pendingOrders.count > previousCount) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timeout);
    }
    setPreviousCount(pendingOrders.count);
  }, [pendingOrders.count, previousCount]);

  const { count, orders, urgentCount } = pendingOrders;
  const oldestOrder = orders?.[0];
  const needsAttention = orders?.some(order => order.needsAttention);

  const handleClick = () => {
    if (onViewOrders) onViewOrders();
    else navigate('/seller/orders');
  };

  return (
    <Card
      type="button"
      onClick={handleClick}
      aria-label={`${count} pending seller orders. Open order management.`}
    >
      <Header>
        <Title>Pending Orders</Title>
        <Badge $count={count} $animate={animate}>{count}</Badge>
      </Header>

      {count === 0 ? (
        <Copy>All orders are clear. New buyer orders will appear here as soon as they need packing.</Copy>
      ) : (
        <>
          <Copy>
            {count === 1 ? '1 order needs' : `${count} orders need`} packing now.
            {urgentCount > 0 ? ` ${urgentCount} marked urgent.` : ''}
          </Copy>
          {needsAttention && oldestOrder && (
            <Alert>Oldest order needs attention, placed {oldestOrder.ageMinutes} minutes ago.</Alert>
          )}
          <CTA>View order queue</CTA>
        </>
      )}
    </Card>
  );
};
