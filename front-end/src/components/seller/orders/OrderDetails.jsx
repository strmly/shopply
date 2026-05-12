import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { TopNavigation } from '../../home/TopNavigation';
import { BottomNavigation } from '../../home/BottomNavigation';
import { CourierAssignmentModal } from './CourierAssignmentModal';
import { PickupCodeScreen } from './PickupCodeScreen';
import { SkeletonCard, SkeletonText } from '../../ui/Skeleton';
import { toast } from '../../ui/Toast';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 120px;
`;

const Content = styled.div`
  max-width: 100%;
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const OrderNumber = styled.div`
  ${props => props.theme.typography.heading2}
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.pill};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
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

const PaymentIcon = styled.div`
  font-size: 24px;
  margin-top: ${props => props.theme.spacing.xs};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border.light};
  box-shadow: ${props => props.theme.shadows.sm};
  animation: ${slideIn} 0.3s ease-out;
`;

const CardTitle = styled.div`
  ${props => props.theme.typography.heading3}
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const BuyerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ItemRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemThumbnail = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.radii.sm};
  background: ${props => props.theme.colors.surfaceAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${props => props.theme.radii.sm};
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ItemVariant = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const ItemPrice = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-align: right;
`;

const InstructionsBox = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primarySoftBg};
  border-left: 4px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  margin-top: ${props => props.theme.spacing.sm};
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  position: relative;
  padding-left: ${props => props.theme.spacing.lg};
  
  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${props => props.theme.colors.border.light};
  }
`;

const TimelineItem = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const TimelineDot = styled.div`
  position: absolute;
  left: -24px;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.border.light
  };
  border: 3px solid ${props => props.theme.colors.background};
  z-index: 1;
`;

const TimelineEvent = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  color: ${props => props.$active 
    ? props.theme.colors.text.primary 
    : props.theme.colors.text.secondary
  };
`;

const TimelineTime = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 11px;
`;

const EarningsRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} 0;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
`;

const EarningsTotal = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} 0;
  border-top: 2px solid ${props => props.theme.colors.border.default};
  margin-top: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.heading3}
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const StickyActionBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 2px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 100;
`;

const PrimaryActionButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: ${props => props.theme.shadows.md};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

import API_BASE_URL from '@config/api';

const getStatusLabel = (status) => {
  const labels = {
    'new': 'New',
    'preparing': 'Preparing',
    'ready': 'Ready',
    'courier_assigned': 'Courier Assigned',
    'completed': 'Completed',
    'delayed': 'Delayed'
  };
  return labels[status] || status;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

export const OrderDetails = ({ location }) => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showPickupCode, setShowPickupCode] = useState(false);
  
  const getSellerId = () => {
    const onboardingId = localStorage.getItem('sellerOnboardingId');
    return onboardingId || '1';
  };
  
  const loadOrder = async () => {
    try {
      setError(null);
      const sellerId = getSellerId();
      
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/orders/${orderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load order (${response.status})`);
      }
      
      const json = await response.json();
      
      if (json.success && json.data) {
        setOrder(json.data);
      } else {
        throw new Error(json.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error loading order:', err);
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);
  
  const handleStatusUpdate = async (newStatus) => {
    try {
      const sellerId = getSellerId();
      const endpoint = newStatus === 'preparing' 
        ? 'mark-preparing'
        : newStatus === 'ready'
        ? 'mark-ready'
        : 'status';
      
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/orders/${orderId}/${endpoint}`,
        {
          method: newStatus === 'preparing' || newStatus === 'ready' ? 'POST' : 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update order status');
      }
      
      const json = await response.json();
      if (json.success) {
        setOrder(json.data);
        const statusLabels = {
          'preparing': 'Preparing',
          'ready': 'Ready',
          'completed': 'Completed'
        };
        toast.success(`Order marked as ${statusLabels[newStatus] || newStatus}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Failed to update order status. Please try again.');
    }
  };
  
  const handleAssignCourier = async (courierId, autoAssign) => {
    try {
      const sellerId = getSellerId();
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/orders/${orderId}/assign-courier`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courierId, autoAssign }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to assign courier');
      }
      
      const json = await response.json();
      if (json.success) {
        setOrder(json.data);
        setShowCourierModal(false);
        toast.success(json.message || 'Courier assigned successfully');
      }
    } catch (err) {
      console.error('Error assigning courier:', err);
      toast.error(err.message || 'Failed to assign courier. Please try again.');
    }
  };
  
  const handleMarkPickedUp = async () => {
    try {
      const sellerId = getSellerId();
      const response = await fetch(
        `${API_BASE_URL}/sellers/${sellerId}/orders/${orderId}/mark-picked-up`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to mark as picked up');
      }
      
      const json = await response.json();
      if (json.success) {
        setOrder(json.data);
        setShowPickupCode(false);
        toast.success('Order marked as picked up successfully');
      }
    } catch (err) {
      console.error('Error marking as picked up:', err);
      toast.error(err.message || 'Failed to mark as picked up. Please try again.');
    }
  };
  
  const getPrimaryAction = () => {
    if (!order) return null;
    
    switch (order.status) {
      case 'new':
        return {
          label: 'Mark as Preparing',
          action: () => handleStatusUpdate('preparing')
        };
      case 'preparing':
        return {
          label: 'Mark as Ready',
          action: () => handleStatusUpdate('ready')
        };
      case 'ready':
        if (order.deliveryMethod === 'pickup') {
          return {
            label: 'Show Pickup Code',
            action: () => setShowPickupCode(true)
          };
        }
        return {
          label: 'Assign Courier',
          action: () => setShowCourierModal(true)
        };
      case 'courier_assigned':
        return {
          label: 'Track Courier',
          action: () => navigate(`/tracking/${order.orderId}`)
        };
      case 'completed':
        return {
          label: 'View Invoice',
          action: () => console.log('View invoice')
        };
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <Container>
        <TopNavigation 
          location={location}
          onLocationClick={() => console.log('Location clicked')}
          onSearch={(query) => console.log('Search:', query)}
          onNotificationClick={() => navigate('/')}
          onSearchClick={() => navigate('/search')}
        />
        <Content>
          <SkeletonCard style={{ minHeight: '400px' }} />
        </Content>
        <BottomNavigation currentPath="/seller/orders" />
      </Container>
    );
  }
  
  if (error || !order) {
    return (
      <Container>
        <TopNavigation 
          location={location}
          onLocationClick={() => console.log('Location clicked')}
          onSearch={(query) => console.log('Search:', query)}
          onNotificationClick={() => navigate('/')}
          onSearchClick={() => navigate('/search')}
        />
        <Content>
          <div style={{ 
            padding: '16px', 
            background: '#FEF3F2', 
            border: '2px solid #F04438', 
            borderRadius: '12px',
            color: '#F04438',
            textAlign: 'center'
          }}>
            {error || 'Order not found'}
          </div>
        </Content>
        <BottomNavigation currentPath="/seller/orders" />
      </Container>
    );
  }
  
  const primaryAction = getPrimaryAction();
  const earnings = order.earnings || {};
  
  return (
    <Container>
      <TopNavigation 
        location={location}
        onLocationClick={() => console.log('Location clicked')}
        onSearch={(query) => console.log('Search:', query)}
        onNotificationClick={() => navigate('/')}
        onSearchClick={() => navigate('/search')}
      />
      <Content>
        <Header>
          <HeaderLeft>
            <OrderNumber>Order #{order.id.slice(-6)}</OrderNumber>
            <StatusBadge $status={order.status}>
              {getStatusLabel(order.status)}
            </StatusBadge>
          </HeaderLeft>
          <PaymentIcon>
            {order.paymentMethod === 'card' ? '💳' : '💵'}
          </PaymentIcon>
        </Header>
        
        <Card>
          <CardTitle>Buyer Information</CardTitle>
          <BuyerInfo>
            <InfoRow>
              <strong>{order.buyerName || 'Customer'}</strong>
            </InfoRow>
            <InfoRow>
              📞 <a href={`tel:${order.buyerPhone}`}>{order.buyerPhone}</a>
            </InfoRow>
            {order.deliveryAddress && (
              <InfoRow>
                📍 {order.deliveryAddress.street}, {order.deliveryAddress.suburb}, {order.deliveryAddress.city}
              </InfoRow>
            )}
          </BuyerInfo>
        </Card>
        
        <Card>
          <CardTitle>Order Items</CardTitle>
          {order.items?.map((item, idx) => (
            <ItemRow key={idx}>
              <ItemThumbnail>
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div style={{ fontSize: '24px' }}>📦</div>
                )}
              </ItemThumbnail>
              <ItemInfo>
                <ItemName>{item.name}</ItemName>
                {item.variant && <ItemVariant>{item.variant}</ItemVariant>}
              </ItemInfo>
              <ItemPrice>
                {item.quantity} × R{item.price.toFixed(2)} = R{(item.quantity * item.price).toFixed(2)}
              </ItemPrice>
            </ItemRow>
          ))}
        </Card>
        
        {(order.orderInstructions || order.notes) && (
          <Card>
            <CardTitle>
              {order.deliveryMethod === 'pickup' ? 'Pickup Instructions' : 'Delivery Instructions'}
            </CardTitle>
            <InstructionsBox>
              {order.orderInstructions || order.notes || 'No special instructions'}
            </InstructionsBox>
          </Card>
        )}
        
        <Card>
          <CardTitle>Order Timeline</CardTitle>
          <Timeline>
            {order.timeline?.map((event, idx) => (
              <TimelineItem key={idx}>
                <TimelineDot $active={true} />
                <TimelineEvent $active={true}>
                  {event.event.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </TimelineEvent>
                <TimelineTime>{formatTimestamp(event.timestamp)}</TimelineTime>
              </TimelineItem>
            ))}
          </Timeline>
        </Card>
        
        <Card>
          <CardTitle>Earnings Summary</CardTitle>
          <EarningsRow>
            <span>Item Total:</span>
            <span>R{earnings.itemsTotal?.toFixed(2) || '0.00'}</span>
          </EarningsRow>
          <EarningsRow>
            <span>Delivery Fee:</span>
            <span>R{earnings.deliveryFee?.toFixed(2) || '0.00'}</span>
          </EarningsRow>
          <EarningsRow>
            <span>Service Fee:</span>
            <span style={{ color: '#C62850' }}>
              R{earnings.serviceFee?.toFixed(2) || '0.00'}
            </span>
          </EarningsRow>
          <EarningsTotal>
            <span>Your Earnings:</span>
            <span>R{earnings.sellerEarnings?.toFixed(2) || '0.00'}</span>
          </EarningsTotal>
          {earnings.payoutScheduled && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#667085' 
            }}>
              Payout Scheduled: {new Date(earnings.payoutScheduled).toLocaleDateString()}
            </div>
          )}
        </Card>
      </Content>
      
      {primaryAction && (
        <StickyActionBar>
          <PrimaryActionButton onClick={primaryAction.action}>
            {primaryAction.label}
          </PrimaryActionButton>
        </StickyActionBar>
      )}
      
      {showCourierModal && (
        <CourierAssignmentModal
          order={order}
          onAssign={handleAssignCourier}
          onClose={() => setShowCourierModal(false)}
        />
      )}
      
      {showPickupCode && (
        <PickupCodeScreen
          order={order}
          onMarkPickedUp={handleMarkPickedUp}
          onClose={() => setShowPickupCode(false)}
        />
      )}
      
      <BottomNavigation currentPath="/seller/orders" />
    </Container>
  );
};

