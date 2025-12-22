import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 600;
  font-size: 15px;
`;

const SelectorRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const SelectorChip = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.selected 
    ? props.theme.colors.primary 
    : props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.selected 
    ? props.theme.colors.primarySoftBg 
    : props.theme.colors.background};
  color: ${props => props.selected 
    ? props.theme.colors.primary 
    : props.theme.colors.text.primary};
  ${props => props.theme.typography.body2}
  font-weight: ${props => props.selected ? 700 : 500};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-1px);
  }
`;

const Icon = styled.span`
  font-size: 18px;
`;

export const PaymentDeliverySelectors = ({
  deliveryMethod,
  paymentMethod,
  onDeliveryMethodChange,
  onPaymentMethodChange,
}) => {
  const deliveryMethods = [
    { value: 'delivery', label: 'Deliver to Me', icon: '🚚' },
    { value: 'pickup', label: 'Pickup', icon: '🏪' },
    { value: 'group', label: 'Group Delivery', icon: '👥' },
  ];

  const paymentMethods = [
    { value: 'card', label: 'Card', icon: '💳' },
    { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
    { value: 'cash', label: 'Cash on Delivery', icon: '💵' },
  ];

  return (
    <Container>
      <Section>
        <SectionTitle>Delivery Method</SectionTitle>
        <SelectorRow>
          {deliveryMethods.map((method) => (
            <SelectorChip
              key={method.value}
              selected={deliveryMethod === method.value}
              onClick={() => onDeliveryMethodChange && onDeliveryMethodChange(method.value)}
            >
              <Icon>{method.icon}</Icon>
              {method.label}
            </SelectorChip>
          ))}
        </SelectorRow>
      </Section>

      <Section>
        <SectionTitle>Payment Method</SectionTitle>
        <SelectorRow>
          {paymentMethods.map((method) => (
            <SelectorChip
              key={method.value}
              selected={paymentMethod === method.value}
              onClick={() => onPaymentMethodChange && onPaymentMethodChange(method.value)}
            >
              <Icon>{method.icon}</Icon>
              {method.label}
            </SelectorChip>
          ))}
        </SelectorRow>
      </Section>
    </Container>
  );
};











