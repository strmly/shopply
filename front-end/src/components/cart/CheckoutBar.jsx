import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const Bar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.background};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  padding-bottom: calc(${props => props.theme.spacing.md} + env(safe-area-inset-bottom));
  z-index: 1000;
  box-shadow: ${props => props.theme.shadows.lg};
  backdrop-filter: blur(10px);
  animation: ${slideUp} 0.3s ease-out;
`;

const BarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  max-width: 600px;
  margin: 0 auto;
`;

const TotalSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const TotalPrice = styled.div`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 22px;
  line-height: 1.2;
`;

const ETAText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
`;

const CheckoutButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => {
    if (props.disabled) return props.theme.colors.surface;
    return props.theme.colors.primary;
  }};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  min-width: 140px;
  animation: ${props => props.pulse ? css`${pulse} 2s ease-in-out infinite` : 'none'};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const WarningText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.warningBase};
  font-weight: 600;
  font-size: 11px;
  margin-top: 4px;
`;

export const CheckoutBar = ({ total, eta, deliveryAddress, paymentMethod, onCheckout }) => {
  const navigate = useNavigate();
  const isReady = deliveryAddress && paymentMethod;
  const missingItems = [];
  if (!deliveryAddress) missingItems.push('delivery address');
  if (!paymentMethod) missingItems.push('payment method');

  const getButtonText = () => {
    if (!deliveryAddress) return 'Add Address';
    if (!paymentMethod) return 'Select Payment';
    return 'Checkout →';
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
  };

  return (
    <Bar>
      <BarContent>
        <TotalSection>
          <TotalPrice>R{total.toFixed(2)}</TotalPrice>
          <ETAText>{eta}</ETAText>
          {!isReady && (
            <WarningText>
              {missingItems.length > 0 && `Add ${missingItems.join(' and ')} to continue`}
            </WarningText>
          )}
        </TotalSection>
        
        <CheckoutButton
          disabled={!isReady}
          pulse={isReady}
          onClick={handleCheckout}
        >
          {getButtonText()}
        </CheckoutButton>
      </BarContent>
    </Bar>
  );
};

