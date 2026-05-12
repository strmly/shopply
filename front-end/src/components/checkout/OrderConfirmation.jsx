import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const checkmark = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.theme.colors.successSoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.xl};
  animation: ${checkmark} 0.5s ease-out;
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.sm};
  text-align: center;
`;

const Message = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  line-height: 1.6;
`;

const OrderInfo = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border.light};
  width: 100%;
  max-width: 400px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} 0;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border.light};
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const InfoValue = styled.span`
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  min-width: 200px;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

import API_BASE_URL from '@config/api';

export const OrderConfirmation = ({ orderId, onContinueShopping }) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/order/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.data);
        }
      } else {
        console.error('Failed to load order:', response.status);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      navigate('/');
    }
  };

  return (
    <Container>
      <SuccessIcon>✓</SuccessIcon>
      <Title>Order Confirmed!</Title>
      <Message>
        Your order has been placed successfully. You'll receive a confirmation email shortly.
      </Message>

      {loading ? (
        <OrderInfo>
          <div style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
            Loading order details...
          </div>
        </OrderInfo>
      ) : order ? (
        <OrderInfo>
          <InfoRow>
            <InfoLabel>Order ID:</InfoLabel>
            <InfoValue>#{order.id.slice(-8)}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Total:</InfoLabel>
            <InfoValue>R{order.totals?.total?.toFixed(2) || '0.00'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>ETA:</InfoLabel>
            <InfoValue>{order.eta || 'Today, 4-6 PM'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Status:</InfoLabel>
            <InfoValue style={{ 
              color: order.status === 'confirmed' ? '#12B76A' : 
                     order.status === 'delivered' ? '#12B76A' :
                     order.status === 'cancelled' ? '#EF4444' : '#F59E0B' 
            }}>
              {order.status === 'confirmed' ? 'Confirmed' : 
               order.status === 'processing' ? 'Processing' :
               order.status === 'out_for_delivery' ? 'Out for Delivery' :
               order.status === 'delivered' ? 'Delivered' :
               order.status === 'cancelled' ? 'Cancelled' : 'Pending'}
            </InfoValue>
          </InfoRow>
        </OrderInfo>
      ) : (
        <OrderInfo>
          <div style={{ textAlign: 'center', padding: '24px', color: '#666' }}>
            Order ID: #{orderId?.slice(-8) || 'N/A'}
          </div>
        </OrderInfo>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>
        <Button 
          onClick={() => navigate(`/tracking/${orderId}`)}
          style={{ background: '#12B76A' }}
        >
          View Order Status
        </Button>
        <Button onClick={handleContinue}>
          Continue Shopping
        </Button>
      </div>
    </Container>
  );
};

