import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;
  width: 100%;
  animation: ${fadeIn} 0.3s ease-in;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 16px;
`;

const Subtext = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const SecurityIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.theme.colors.success[500]};
  font-size: 12px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: ${props => props.theme.colors.neutral[100]};
  color: ${props => props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.radii.pill};
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
`;

const WarningBadge = styled(Badge)`
  background: ${props => props.theme.colors.warning[100]};
  color: ${props => props.theme.colors.warning[600]};
`;

const Arrow = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 18px;
  flex-shrink: 0;
`;

import API_BASE_URL from '@config/api';

export const PaymentMethodQuickActionCard = ({ navigate, userId = 'default' }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, [userId]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payment-methods/my-payment-methods?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentMethods(data.data || []);
        }
      } else if (response.status === 404) {
        // Silently handle 404s - endpoint may not be available
        setPaymentMethods([]);
      }
    } catch (error) {
      // Only log non-404 errors
      if (!error.message.includes('404')) {
        console.error('Error loading payment methods:', error);
      }
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const getSubtext = () => {
    if (loading) return 'Loading...';
    if (paymentMethods.length === 0) return 'No payment method added';
    
    const defaultMethod = paymentMethods.find(pm => pm.isDefault);
    if (defaultMethod) {
      const brand = defaultMethod.brand.charAt(0).toUpperCase() + defaultMethod.brand.slice(1);
      return `${brand} •••• ${defaultMethod.last4}`;
    }
    
    return `${paymentMethods.length} card${paymentMethods.length !== 1 ? 's' : ''} saved`;
  };

  const hasActionNeeded = () => {
    return paymentMethods.some(pm => pm.isExpired || pm.hasFailedPayment || pm.isExpiringSoon);
  };

  const handleClick = () => {
    navigate('/payment-methods');
  };

  return (
    <Card onClick={handleClick}>
      <IconWrapper>💳</IconWrapper>
      <Content>
        <Title>Payment Methods</Title>
        <Subtext>
          {getSubtext()}
          <SecurityIndicator>🔒 Securely stored</SecurityIndicator>
        </Subtext>
        {paymentMethods.some(pm => pm.isDefault) && (
          <Badge>Default</Badge>
        )}
        {hasActionNeeded() && (
          <WarningBadge>Action needed</WarningBadge>
        )}
      </Content>
      <Arrow>→</Arrow>
    </Card>
  );
};

