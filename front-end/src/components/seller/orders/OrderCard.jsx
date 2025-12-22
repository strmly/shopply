import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
`;

const flash = keyframes`
  0%, 100% {
    border-color: ${props => props.$borderColor};
  }
  50% {
    border-color: ${props => props.$flashColor};
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => {
    if (props.$isUrgent && props.$isOverdue) return props.theme.colors.dangerBase;
    if (props.$isUrgent) return props.theme.colors.warningBase;
    return props.theme.colors.border.light;
  }};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  position: relative;
  box-shadow: ${props => props.theme.shadows.sm};
  animation: ${slideIn} 0.3s ease-out;
  animation-delay: ${props => props.$animationDelay || '0s'};
  transform-origin: center;
  
  ${props => props.$isUrgent && !props.$isOverdue && css`
    animation: ${flash} 2s ease-in-out infinite, ${slideIn} 0.3s ease-out;
    $flashColor: ${props.theme.colors.warningBase};
  `}
  
  ${props => props.$isOverdue && css`
    animation: ${flash} 1s ease-in-out infinite, ${slideIn} 0.3s ease-out;
    $flashColor: ${props.theme.colors.dangerBase};
  `}
  
  ${props => props.$isNew && css`
    animation: ${pulse} 2s ease-in-out infinite, ${slideIn} 0.3s ease-out;
  `}
  
  &:active {
    transform: scale(0.98);
  }
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px) scale(1.01);
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing.sm};
  }
`;

const CardContent = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: flex-start;
`;

const LeftSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const BuyerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const BuyerName = styled.div`
  ${props => props.theme.typography.heading3}
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const OrderNumber = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const ItemCount = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  margin-top: ${props => props.theme.spacing.xs};
`;

const DeliveryMethod = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
`;

const CenterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  align-items: flex-end;
  min-width: 100px;
`;

const ItemThumbnails = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Thumbnail = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.radii.sm};
  background: ${props => props.theme.colors.surfaceAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 10px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TotalPrice = styled.div`
  ${props => props.theme.typography.heading3}
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const PaymentIcon = styled.div`
  font-size: 14px;
  margin-top: ${props => props.theme.spacing.xs};
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
  min-width: 80px;
`;

const StatusBadge = styled.div`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.$status) {
      case 'new': return props.theme.colors.info[500];
      case 'preparing': return props.theme.colors.warning[500];
      case 'ready': return props.theme.colors.success[500];
      case 'courier_assigned': return props.theme.colors.secondary;
      case 'completed': return props.theme.colors.neutral[400];
      case 'delayed': return props.theme.colors.danger[500];
      default: return props.theme.colors.neutral[400];
    }
  }};
  color: white;
`;

const Timer = styled.div`
  ${props => props.theme.typography.caption}
  font-size: 11px;
  font-weight: 600;
  color: ${props => {
    if (props.$isOverdue) return props.theme.colors.dangerBase;
    if (props.$isUrgent) return props.theme.colors.warningBase;
    return props.theme.colors.text.secondary;
  }};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Chevron = styled.div`
  font-size: 18px;
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const UrgentAlert = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  right: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.dangerBase};
  color: white;
  padding: 2px 6px;
  border-radius: ${props => props.theme.radii.xs};
  ${props => props.theme.typography.caption}
  font-size: 10px;
  font-weight: 700;
  animation: ${pulse} 1s ease-in-out infinite;
`;

const UpdateIndicator = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.xs};
  left: ${props => props.theme.spacing.xs};
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.colors.secondary};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const CourierCard = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.secondarySoftBg};
  border-radius: ${props => props.theme.radii.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CourierAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
`;

const CourierInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CourierName = styled.div`
  ${props => props.theme.typography.body2}
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const CourierETA = styled.div`
  ${props => props.theme.typography.caption}
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
`;

const formatTime = (minutes) => {
  if (minutes < 0) {
    return `${Math.abs(minutes)}m late`;
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const getStatusLabel = (status) => {
  const labels = {
    'new': 'New',
    'preparing': 'Preparing',
    'ready': 'Ready',
    'courier_assigned': 'Courier Assigned',
    'completed': 'Completed',
    'delayed': 'Delayed',
    'cancelled': 'Cancelled'
  };
  return labels[status] || status;
};

export const OrderCard = ({ order, onClick, onSwipeAction, style }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const slaStatus = order.slaStatus || {};
  
  useEffect(() => {
    if (slaStatus.remainingMinutes !== undefined) {
      setTimeRemaining(slaStatus.remainingMinutes);
      
      const interval = setInterval(() => {
        const now = new Date();
        const elapsed = (now - new Date(order.createdAt)) / (1000 * 60);
        const remaining = order.slaMinutes - elapsed;
        setTimeRemaining(Math.max(0, Math.floor(remaining)));
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [order, slaStatus]);
  
  const isUrgent = slaStatus.isUrgent || false;
  const isOverdue = slaStatus.isOverdue || false;
  const isNew = order.status === 'new';
  const hasUpdate = order.hasUpdate || false;
  
  const itemCount = order.items?.length || 0;
  const totalPrice = order.total || 0;
  
  // Get first 3 items for thumbnails
  const thumbnails = order.items?.slice(0, 3) || [];
  
  return (
    <Card
      onClick={onClick}
      $isUrgent={isUrgent}
      $isOverdue={isOverdue}
      $isNew={isNew}
      $animationDelay={style?.animationDelay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {hasUpdate && <UpdateIndicator title="Order updated by buyer" />}
      {isOverdue && (
        <UrgentAlert>
          {slaStatus.elapsedMinutes - order.slaMinutes}m late
        </UrgentAlert>
      )}
      
      <CardContent>
        <LeftSection>
          <BuyerInfo>
            <BuyerName>{order.buyerName || 'Customer'}</BuyerName>
          </BuyerInfo>
          <OrderNumber>#{order.id.slice(-6)}</OrderNumber>
          <ItemCount>{itemCount} {itemCount === 1 ? 'item' : 'items'}</ItemCount>
          <DeliveryMethod>
            {order.deliveryMethod === 'delivery' ? '🚚' : order.deliveryMethod === 'pickup' ? '🏬' : '🏠'}
            {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
          </DeliveryMethod>
          
          {order.status === 'courier_assigned' && order.courierInfo && (
            <CourierCard>
              <CourierAvatar>
                {order.courierInfo.name?.charAt(0) || 'C'}
              </CourierAvatar>
              <CourierInfo>
                <CourierName>{order.courierInfo.name}</CourierName>
                <CourierETA>ETA: {order.courierInfo.eta || '8-12'} min</CourierETA>
              </CourierInfo>
            </CourierCard>
          )}
        </LeftSection>
        
        <CenterSection>
          <ItemThumbnails>
            {thumbnails.map((item, idx) => (
              <Thumbnail key={idx}>
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  item.name?.charAt(0) || '?'
                )}
              </Thumbnail>
            ))}
          </ItemThumbnails>
          <TotalPrice>R{totalPrice.toFixed(2)}</TotalPrice>
          <PaymentIcon>
            {order.paymentMethod === 'card' ? '💳' : '💵'}
          </PaymentIcon>
        </CenterSection>
        
        <RightSection>
          <StatusBadge $status={order.status}>
            {getStatusLabel(order.status)}
          </StatusBadge>
          {timeRemaining !== null && (
            <Timer $isUrgent={isUrgent} $isOverdue={isOverdue}>
              {isOverdue ? '⚠️' : '⏱️'} {formatTime(timeRemaining)}
            </Timer>
          )}
          <Chevron>›</Chevron>
        </RightSection>
      </CardContent>
    </Card>
  );
};
