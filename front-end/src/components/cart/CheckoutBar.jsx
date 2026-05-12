import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

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
    transform: scale(1);
  }
  50% {
    transform: scale(1.025);
  }
`;

const Bar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 86px;
  background: rgba(255, 255, 255, 0.88);
  border-top: 1px solid rgba(228, 231, 236, 0.78);
  padding: 12px min(5vw, 48px);
  z-index: 999;
  box-shadow: 0 -18px 44px rgba(16, 24, 40, 0.1);
  backdrop-filter: blur(18px);
  animation: ${slideUp} 0.3s ease-out;

  @media (max-width: 560px) {
    bottom: 84px;
  }
`;

const BarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  max-width: 760px;
  margin: 0 auto;
`;

const TotalSection = styled.div`
  display: grid;
  gap: 3px;
  min-width: 0;
  flex: 1;
`;

const TotalPrice = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 25px;
  line-height: 1.05;
`;

const ETAText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
`;

const CheckoutButton = styled.button`
  padding: 15px 22px;
  background: ${props => props.disabled ? props.theme.colors.neutral[200] : props.theme.colors.text.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: 999px;
  ${props => props.theme.typography.button}
  font-weight: 900;
  font-size: 15px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  min-width: 150px;
  box-shadow: ${props => props.disabled ? 'none' : '0 18px 34px rgba(16, 24, 40, 0.18)'};
  animation: ${props => props.$pulse ? css`${pulse} 2s ease-in-out infinite` : 'none'};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 22px 42px rgba(16, 24, 40, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const WarningText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.warningBase};
  font-weight: 800;
`;

export const CheckoutBar = ({ total, eta, deliveryAddress, paymentMethod, onCheckout }) => {
  const navigate = useNavigate();
  const isReady = !!deliveryAddress;
  const missingItems = [];
  if (!deliveryAddress) missingItems.push('delivery address');

  const getButtonText = () => {
    if (!deliveryAddress) return 'Add address';
    return 'Checkout';
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
          $pulse={isReady}
          onClick={handleCheckout}
        >
          {getButtonText()}
        </CheckoutButton>
      </BarContent>
    </Bar>
  );
};
