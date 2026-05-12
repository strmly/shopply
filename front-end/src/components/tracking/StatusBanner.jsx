import styled, { keyframes, css } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.94); opacity: 0.72; }
`;

const Banner = styled.section`
  position: relative;
  overflow: hidden;
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 28px;
  margin-bottom: 18px;
  animation: ${fadeIn} 0.3s ease-in;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94) 58%, ${props => {
      if (props.$status === 'delivered') return 'rgba(236, 253, 245, 0.9)';
      if (props.$status === 'cancelled') return 'rgba(254, 242, 242, 0.9)';
      return 'rgba(241,247,255,0.9)';
    }}) padding-box,
    linear-gradient(140deg, ${props => {
      if (props.$status === 'delivered') return 'rgba(21, 161, 124, 0.28)';
      if (props.$status === 'cancelled') return 'rgba(198, 40, 80, 0.28)';
      return 'rgba(61, 129, 239, 0.24)';
    }}, rgba(228, 231, 236, 0.86), rgba(245, 158, 11, 0.14)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 22px 50px rgba(16, 24, 40, 0.08);

  &::after {
    content: '';
    position: absolute;
    right: -48px;
    top: -58px;
    width: 150px;
    height: 150px;
    border-radius: 999px;
    background: rgba(61, 129, 239, 0.07);
    pointer-events: none;
  }
`;

const Icon = styled.div`
  position: relative;
  z-index: 1;
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: ${props => {
    if (props.$status === 'delivered') return props.theme.colors.status.successLight;
    if (props.$status === 'cancelled') return props.theme.colors.dangerSoftBg;
    return props.theme.colors.gradient.soft;
  }};
  color: ${props => {
    if (props.$status === 'delivered') return props.theme.colors.successBase;
    if (props.$status === 'cancelled') return props.theme.colors.dangerBase;
    return props.theme.colors.primary;
  }};
  border: 1px solid rgba(255,255,255,0.78);
  font-size: 15px;
  font-weight: 900;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.84);
  ${props => props.$pulsing ? css`animation: ${pulse} 2s ease-in-out infinite;` : css`animation: none;`}
`;

const Copy = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
`;

const Label = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const Text = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: clamp(20px, 4vw, 30px);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: 0;
`;

const getStatusMessage = (status) => {
  const messages = {
    pending: 'Preparing your order',
    confirmed: 'Store is preparing your order',
    processing: 'Your order is being packed',
    out_for_delivery: 'Your order is on the way',
    delivered: 'Your order has arrived',
    cancelled: 'Order cancelled',
  };

  return messages[status] || 'Processing your order';
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Packing',
    out_for_delivery: 'On the way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return labels[status] || 'Active';
};

export const StatusBanner = ({ status, currentStage }) => {
  const message = getStatusMessage(status, currentStage);
  const pulsing = ['pending', 'confirmed', 'processing', 'out_for_delivery'].includes(status);

  return (
    <Banner $status={status}>
      <Icon $status={status} $pulsing={pulsing}>{getStatusLabel(status).slice(0, 2).toUpperCase()}</Icon>
      <Copy>
        <Label>Order status</Label>
        <Text>{message}</Text>
      </Copy>
    </Banner>
  );
};
