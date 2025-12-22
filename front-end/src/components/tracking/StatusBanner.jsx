import styled, { keyframes, css } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const Banner = styled.div`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  animation: ${fadeIn} 0.3s ease-in;
  background: ${props => {
    if (props.$status === 'delivered') return props.theme.colors.successSoftBg;
    if (props.$status === 'cancelled') return props.theme.colors.dangerSoftBg;
    if (props.$severity === 'warning') return props.theme.colors.warningSoftBg;
    return props.theme.colors.primarySoftBg;
  }};
  border: 2px solid ${props => {
    if (props.$status === 'delivered') return props.theme.colors.successBase;
    if (props.$status === 'cancelled') return props.theme.colors.dangerBase;
    if (props.$severity === 'warning') return props.theme.colors.warningBase;
    return props.theme.colors.primary;
  }};
`;

const Icon = styled.span`
  font-size: 24px;
  ${props => props.$pulsing ? css`animation: ${pulse} 2s ease-in-out infinite;` : css`animation: none;`}
`;

const Text = styled.div`
  flex: 1;
  ${props => props.theme.typography.body1}
  color: ${props => {
    if (props.$status === 'delivered') return props.theme.colors.successBase;
    if (props.$status === 'cancelled') return props.theme.colors.dangerBase;
    if (props.$severity === 'warning') return props.theme.colors.warningBase;
    return props.theme.colors.primary;
  }};
  font-weight: 700;
  font-size: 16px;
`;

const getStatusMessage = (status, currentStage) => {
  const messages = {
    'pending': 'Preparing your order…',
    'confirmed': 'Store is preparing your order…',
    'processing': 'Your order is being packed',
    'out_for_delivery': 'Your order is on the way!',
    'delivered': 'Your order has arrived',
    'cancelled': 'Order cancelled',
  };

  return messages[status] || 'Processing your order…';
};

const getStatusIcon = (status) => {
  const icons = {
    'pending': '⏳',
    'confirmed': '📦',
    'processing': '📦',
    'out_for_delivery': '🚚',
    'delivered': '✓',
    'cancelled': '✕',
  };

  return icons[status] || '⏳';
};

export const StatusBanner = ({ status, currentStage }) => {
  const message = getStatusMessage(status, currentStage);
  const icon = getStatusIcon(status);
  const pulsing = ['pending', 'confirmed', 'processing', 'out_for_delivery'].includes(status);
  const severity = status === 'cancelled' ? 'error' : null;

  return (
    <Banner $status={status} $severity={severity}>
      <Icon $pulsing={pulsing}>{icon}</Icon>
      <Text $status={status} $severity={severity}>{message}</Text>
    </Banner>
  );
};











