import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.theme.colors.border.light};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.4s ease-out;
  position: relative;
  box-shadow: ${props => props.theme.shadows.sm};

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 18px;
`;

const Badge = styled.div`
  background: ${props => {
    if (props.$count === 0) return props.theme.colors.successBase;
    if (props.$count <= 4) return props.theme.colors.warningBase;
    return props.theme.colors.dangerBase;
  }};
  color: white;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.body2}
  font-weight: 700;
  font-size: 16px;
  min-width: 32px;
  text-align: center;
  animation: ${props => props.$animate ? bounce : 'none'} 0.5s ease-out,
             ${props => props.$pulse ? pulse : 'none'} 2s ease-in-out infinite;
`;

const Subtext = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const AlertBar = styled.div`
  background: ${props => props.theme.colors.warningSoftBg};
  border-left: 3px solid ${props => props.theme.colors.warningBase};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.sm};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.warningBase};
  font-size: 12px;
  margin-top: ${props => props.theme.spacing.sm};
  animation: ${slideIn} 0.3s ease-out;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
  font-size: 14px;
`;

const CTAButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.sm};
  min-height: 48px;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

export const PendingOrdersWidget = ({ 
  pendingOrders = { count: 0, orders: [], urgentCount: 0 },
  onViewOrders 
}) => {
  const navigate = useNavigate();
  const [badgeAnimate, setBadgeAnimate] = useState(false);
  const [prevCount, setPrevCount] = useState(pendingOrders.count);

  useEffect(() => {
    if (pendingOrders.count > prevCount) {
      setBadgeAnimate(true);
      setTimeout(() => setBadgeAnimate(false), 500);
    }
    setPrevCount(pendingOrders.count);
  }, [pendingOrders.count, prevCount]);

  const handleClick = () => {
    if (onViewOrders) {
      onViewOrders();
    } else {
      navigate('/seller/orders');
    }
  };

  const { count, orders, urgentCount } = pendingOrders;
  const needsAttention = orders.some(order => order.needsAttention);
  const oldestOrder = orders.length > 0 ? orders[0] : null;

  return (
    <Container 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Pending orders: ${count} ${count === 1 ? 'order' : 'orders'}. ${count > 0 ? `${urgentCount} urgent.` : 'All caught up.'} Click to view orders.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Header>
        <Title>Pending Orders</Title>
        <Badge 
          $count={count} 
          $animate={badgeAnimate}
          $pulse={count >= 5}
          aria-label={`${count} pending ${count === 1 ? 'order' : 'orders'}`}
        >
          {count}
        </Badge>
      </Header>

      {count === 0 ? (
        <EmptyState>
          No pending orders.
          <br />
          You're all caught up! 🎉
        </EmptyState>
      ) : (
        <>
          {count >= 5 && (
            <Subtext style={{ color: '#C62850', fontWeight: 600 }}>
              High demand: prioritize packing!
            </Subtext>
          )}
          
          {needsAttention && oldestOrder && (
            <AlertBar>
              Order needs attention — placed {oldestOrder.ageMinutes} mins ago
            </AlertBar>
          )}

          {count <= 4 && (
            <Subtext>
              {count === 1 ? '1 order' : `${count} orders`} need{count === 1 ? 's' : ''} packing now
            </Subtext>
          )}

          <CTAButton onClick={(e) => { e.stopPropagation(); handleClick(); }}>
            View Orders
          </CTAButton>
        </>
      )}
    </Container>
  );
};
