import styled, { keyframes, css } from 'styled-components';
import { fadeIn } from '../../theme/animations';

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

const StyledPlaceOrderButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => {
    if (props.disabled) return props.theme.colors.neutral[300];
    return props.theme.colors.gradient.primary;
  }};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  min-width: 160px;
  box-shadow: ${props => props.disabled ? 'none' : '0 16px 30px rgba(61, 129, 239, 0.24)'};
  animation: ${props => props.pulse && !props.disabled ? css`${pulse} 2s ease-in-out infinite` : 'none'};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.gradient.primary};
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

const ErrorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
`;

const ErrorItem = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.dangerBase};
  font-weight: 600;
  font-size: 10px;
`;

export const PlaceOrderButton = ({ total, eta, isValid, errors, onPlaceOrder }) => {
  const getButtonText = () => {
    if (!isValid) {
      const errorKeys = Object.keys(errors || {});
      if (errorKeys.length > 0) {
        if (errorKeys.includes('deliveryAddress')) return 'Add Address';
        if (errorKeys.includes('phone')) return 'Add Phone';
        return 'Fix Issues';
      }
      return 'Fix Issues';
    }
    return 'SEND TO SELLER';
  };

  const errorMessages = Object.values(errors || {}).filter(Boolean);

  return (
    <Bar>
      <BarContent>
        <TotalSection>
          <TotalPrice>R{total.toFixed(2)}</TotalPrice>
          <ETAText>{eta}</ETAText>
          {!isValid && errorMessages.length > 0 && (
            <ErrorList>
              {errorMessages.slice(0, 2).map((error, index) => (
                <ErrorItem key={index}>• {error}</ErrorItem>
              ))}
            </ErrorList>
          )}
        </TotalSection>
        
        <StyledPlaceOrderButton
          disabled={!isValid}
          pulse={isValid}
          onClick={onPlaceOrder}
        >
          {getButtonText()}
        </StyledPlaceOrderButton>
      </BarContent>
    </Bar>
  );
};

