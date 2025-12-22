import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => 
    props.isDefault 
      ? props.theme.colors.primary 
      : props.hasWarning
      ? props.theme.colors.warning[300]
      : props.theme.colors.border.light
  };
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.3s ease-in;
  box-shadow: ${props => 
    props.isDefault 
      ? props.theme.shadows.md 
      : props.theme.shadows.xs
  };

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  flex: 1;
`;

const BrandLogo = styled.div`
  width: 56px;
  height: 36px;
  border-radius: ${props => props.theme.radii.sm};
  background: ${props => {
    const brand = props.brand?.toLowerCase();
    if (brand === 'visa') return 'linear-gradient(135deg, #1A1F71 0%, #1434A4 100%)';
    if (brand === 'mastercard') return 'linear-gradient(135deg, #EB001B 0%, #F79E1B 100%)';
    if (brand === 'amex') return 'linear-gradient(135deg, #006FCF 0%, #002663 100%)';
    if (brand === 'discover') return 'linear-gradient(135deg, #FF6000 0%, #FF8C00 100%)';
    if (brand === 'diners') return 'linear-gradient(135deg, #0079BE 0%, #004A7C 100%)';
    if (brand === 'jcb') return 'linear-gradient(135deg, #0B4EA2 0%, #0066CC 100%)';
    if (brand === 'unionpay') return 'linear-gradient(135deg, #E21836 0%, #B71C1C 100%)';
    return props.theme.colors.neutral[200];
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  flex-shrink: 0;
  box-shadow: ${props => props.theme.shadows.sm};
  position: relative;
  overflow: hidden;

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
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const CardDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const CardNumber = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
`;

const ExpiryDate = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const Badges = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: ${props => {
    if (props.variant === 'default') return props.theme.colors.primarySoftBg;
    if (props.variant === 'warning') return props.theme.colors.warning[100];
    if (props.variant === 'danger') return props.theme.colors.danger[100];
    return props.theme.colors.neutral[100];
  }};
  color: ${props => {
    if (props.variant === 'default') return props.theme.colors.primary;
    if (props.variant === 'warning') return props.theme.colors.warning[600];
    if (props.variant === 'danger') return props.theme.colors.danger[600];
    return props.theme.colors.text.secondary;
  }};
  border-radius: ${props => props.theme.radii.pill};
  font-size: 11px;
  font-weight: 600;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.tertiary};
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};
  border-radius: ${props => props.theme.radii.sm};

  &:hover {
    background: ${props => props.theme.colors.neutral[50]};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const WarningMessage = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.warning[100]};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.warning[600]};
  font-size: 13px;
`;

const getBrandInitials = (brand) => {
  if (!brand) return 'CARD';
  const brandLower = brand.toLowerCase();
  if (brandLower === 'visa') return 'VISA';
  if (brandLower === 'mastercard') return 'MC';
  if (brandLower === 'amex') return 'AMEX';
  if (brandLower === 'discover') return 'DISC';
  return brand.toUpperCase().slice(0, 4);
};

export const PaymentMethodCard = ({ 
  paymentMethod, 
  onSetDefault, 
  onRename,
  onDelete,
  onMenuClick
}) => {
  const isDefault = paymentMethod.isDefault;
  const hasWarning = paymentMethod.isExpired || paymentMethod.hasFailedPayment || paymentMethod.isExpiringSoon;
  
  const getWarningMessage = () => {
    if (paymentMethod.isExpired) {
      return 'This card has expired. Update to avoid checkout issues.';
    }
    if (paymentMethod.hasFailedPayment) {
      return 'This card failed recently. Try another or update.';
    }
    if (paymentMethod.isExpiringSoon) {
      return 'This card expires soon. Update to avoid checkout issues.';
    }
    return null;
  };

  const warningMessage = getWarningMessage();

  return (
    <Card isDefault={isDefault} hasWarning={hasWarning}>
      <TopRow>
        <CardInfo>
          <BrandLogo brand={paymentMethod.brand}>
            {getBrandInitials(paymentMethod.brand)}
          </BrandLogo>
          <CardDetails>
            <CardNumber>{paymentMethod.maskedNumber || `•••• ${paymentMethod.last4}`}</CardNumber>
            <ExpiryDate>Expires {paymentMethod.expiryDate || `${String(paymentMethod.expMonth).padStart(2, '0')}/${String(paymentMethod.expYear).slice(-2)}`}</ExpiryDate>
          </CardDetails>
        </CardInfo>
        <MenuButton onClick={() => onMenuClick && onMenuClick(paymentMethod)}>
          ⋮
        </MenuButton>
      </TopRow>

      <Badges>
        {isDefault && <Badge variant="default">Default</Badge>}
        {paymentMethod.isExpired && <Badge variant="danger">Expired</Badge>}
        {paymentMethod.isExpiringSoon && !paymentMethod.isExpired && <Badge variant="warning">Expiring Soon</Badge>}
        {paymentMethod.hasFailedPayment && <Badge variant="danger">Failed Payment</Badge>}
      </Badges>

      {warningMessage && (
        <WarningMessage>
          {warningMessage}
        </WarningMessage>
      )}
    </Card>
  );
};

