import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.01);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const Card = styled.div`
  background: ${props => {
    if (props.$status === 'used') return props.theme.colors.neutral[100];
    if (props.$status === 'expired') return props.theme.colors.neutral[50];
    if (props.$expiringSoon) {
      return `linear-gradient(135deg, ${props.theme.colors.warning[100]} 0%, ${props.theme.colors.warning[50]} 100%)`;
    }
    return `linear-gradient(135deg, ${props.theme.colors.surface} 0%, ${props.theme.colors.primarySoftBg} 100%)`;
  }};
  border: 2px solid ${props => {
    if (props.$status === 'used') return props.theme.colors.neutral[200];
    if (props.$status === 'expired') return props.theme.colors.neutral[200];
    if (props.$expiringSoon) return props.theme.colors.warning[400];
    return props.theme.colors.primary;
  }};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.4s ease-in;
  position: relative;
  overflow: hidden;
  opacity: ${props => props.$status === 'expired' || props.$status === 'used' ? 0.7 : 1};
  box-shadow: ${props => {
    if (props.$status === 'used' || props.$status === 'expired') {
      return props.theme.shadows.sm;
    }
    if (props.$expiringSoon) {
      return `0 4px 12px ${props.theme.colors.warning[200]}`;
    }
    return props.theme.shadows.md;
  }};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    ${props => props.$clickable && `
      transform: translateY(-4px) scale(1.02);
      box-shadow: ${props.theme.shadows.lg};
      border-color: ${props.theme.colors.primary};
      
      &::before {
        left: 100%;
      }
    `}
  }

  ${props => props.$expiringSoon && props.$clickable && css`
    animation: ${fadeIn} 0.4s ease-in, ${pulse} 2s ease-in-out infinite;
  `}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ValueSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Value = styled.div`
  ${props => props.theme.typography.heading2}
  color: ${props => {
    if (props.$status === 'used' || props.$status === 'expired') {
      return props.theme.colors.text.secondary;
    }
    return props.theme.colors.primary;
  }};
  font-weight: 800;
  font-size: 32px;
  line-height: 1;
  letter-spacing: -0.5px;
  background: ${props => {
    if (props.$status === 'active' && !props.$expiringSoon) {
      return `linear-gradient(135deg, ${props.theme.colors.primary} 0%, ${props.theme.colors.primaryHover} 100%)`;
    }
    return 'none';
  }};
  -webkit-background-clip: ${props => props.$status === 'active' && !props.$expiringSoon ? 'text' : 'none'};
  -webkit-text-fill-color: ${props => {
    if (props.$status === 'active' && !props.$expiringSoon) {
      return 'transparent';
    }
    if (props.$status === 'used' || props.$status === 'expired') {
      return props.theme.colors.text.secondary;
    }
    return props.theme.colors.primary;
  }};
  background-clip: ${props => props.$status === 'active' && !props.$expiringSoon ? 'text' : 'none'};
`;

const ValueLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const StatusBadge = styled.div`
  padding: 4px 10px;
  border-radius: ${props => props.theme.radii.pill};
  font-size: 11px;
  font-weight: 600;
  background: ${props => {
    if (props.$status === 'used') return props.theme.colors.neutral[200];
    if (props.$status === 'expired') return props.theme.colors.neutral[200];
    if (props.$expiringSoon) return props.theme.colors.warning[300];
    return props.theme.colors.success[200];
  }};
  color: ${props => {
    if (props.$status === 'used') return props.theme.colors.text.secondary;
    if (props.$status === 'expired') return props.theme.colors.text.secondary;
    if (props.$expiringSoon) return props.theme.colors.warning[700];
    return props.theme.colors.success[700];
  }};
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Description = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Conditions = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: ${props => props.theme.radii.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ExpirySection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${props => props.theme.spacing.sm};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const ExpiryLabel = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const Countdown = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.warning[700]};
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '⏰';
    font-size: 14px;
  }
`;

const Hint = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primary};
  font-size: 12px;
  font-weight: 700;
  margin-top: ${props => props.theme.spacing.sm};
  text-align: center;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.primarySoftBg};
  border-radius: ${props => props.theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  &::before {
    content: '💡';
    font-size: 14px;
  }
`;

const formatCountdown = (expiresAt) => {
  if (!expiresAt) return null;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const VoucherCard = ({ voucher, onClick, showHint = false }) => {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (voucher.expiresAt && voucher.status === 'active') {
      const updateCountdown = () => {
        setCountdown(formatCountdown(voucher.expiresAt));
      };
      
      updateCountdown();
      // Update every second for better UX
      const interval = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(interval);
    }
  }, [voucher.expiresAt, voucher.status]);

  const formatValue = () => {
    if (voucher.type === 'percentage') {
      return `${voucher.value}%`;
    }
    return `R${voucher.value.toFixed(0)}`;
  };

  const formatConditions = () => {
    const conditions = [];
    if (voucher.minPurchase > 0) {
      conditions.push(`Min. purchase: R${voucher.minPurchase}`);
    }
    if (voucher.maxDiscount && voucher.type === 'percentage') {
      conditions.push(`Max. discount: R${voucher.maxDiscount}`);
    }
    return conditions.join(' • ');
  };

  const formatExpiry = () => {
    if (!voucher.expiresAt) return 'No expiry';
    const date = new Date(voucher.expiresAt);
    return date.toLocaleDateString('en-ZA', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const isClickable = voucher.status === 'active' && onClick;
  const expiringSoon = voucher.isExpiringSoon || false;

  return (
    <Card 
      $status={voucher.status} 
      $expiringSoon={expiringSoon}
      $clickable={isClickable}
      onClick={isClickable ? onClick : undefined}
    >
      <Header>
        <ValueSection>
          <Value $status={voucher.status}>{formatValue()}</Value>
          <ValueLabel>OFF</ValueLabel>
        </ValueSection>
        <StatusBadge $status={voucher.status} $expiringSoon={expiringSoon}>
          {voucher.status === 'active' && expiringSoon ? 'Expiring Soon' : 
           voucher.status === 'active' ? 'Active' :
           voucher.status === 'used' ? 'Used' : 'Expired'}
        </StatusBadge>
      </Header>

      <Title>{voucher.title}</Title>
      {voucher.description && (
        <Description>{voucher.description}</Description>
      )}

      {formatConditions() && (
        <Conditions>{formatConditions()}</Conditions>
      )}

      <ExpirySection>
        <ExpiryLabel>Expires: {formatExpiry()}</ExpiryLabel>
        {voucher.status === 'active' && countdown && (
          <Countdown>{countdown} left</Countdown>
        )}
      </ExpirySection>

      {showHint && voucher.status === 'active' && (
        <Hint>Apply at checkout</Hint>
      )}
    </Card>
  );
};

