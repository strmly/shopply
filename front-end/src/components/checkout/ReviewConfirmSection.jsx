import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ReviewItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const CheckIcon = styled.span`
  color: ${props => props.theme.colors.successBase};
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const Label = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  min-width: 120px;
`;

const Value = styled.span`
  flex: 1;
`;

export const ReviewConfirmSection = ({
  deliveryAddress,
  deliveryMethod,
  deliverySpeed,
  paymentMethod,
  contactInfo,
  storeCount,
  eta,
}) => {
  const getDeliveryMethodText = () => {
    if (deliveryMethod === 'pickup') return 'Pickup at Store';
    if (deliveryMethod === 'group') return 'Group Pickup';
    if (deliverySpeed === 'express') return 'Express Delivery';
    return 'Standard Delivery';
  };

  const getPaymentMethodText = () => {
    if (paymentMethod === 'seller_whatsapp') return 'Confirm with seller on WhatsApp';
    if (paymentMethod === 'card') return 'Card ending 4821';
    if (paymentMethod === 'mobile_money') return 'Mobile Money';
    if (paymentMethod === 'cash') return 'Cash on Delivery';
    return 'Not selected';
  };

  return (
    <Card>
      <Title>Review your order:</Title>
      
      <ReviewList>
        {deliveryAddress && (
          <ReviewItem>
            <CheckIcon>✔</CheckIcon>
            <Label>Deliver to:</Label>
            <Value>{deliveryAddress.address || `${deliveryAddress.suburb}, ${deliveryAddress.city}`}</Value>
          </ReviewItem>
        )}

        <ReviewItem>
          <CheckIcon>✔</CheckIcon>
          <Label>Delivery:</Label>
          <Value>{getDeliveryMethodText()} • {eta}</Value>
        </ReviewItem>

        {paymentMethod && (
          <ReviewItem>
            <CheckIcon>✔</CheckIcon>
            <Label>Order handoff:</Label>
            <Value>{getPaymentMethodText()}</Value>
          </ReviewItem>
        )}

        {contactInfo?.phone && (
          <ReviewItem>
            <CheckIcon>✔</CheckIcon>
            <Label>Phone:</Label>
            <Value>{contactInfo.phone}</Value>
          </ReviewItem>
        )}

        <ReviewItem>
          <CheckIcon>✔</CheckIcon>
          <Label>Items from:</Label>
          <Value>{storeCount} {storeCount === 1 ? 'store' : 'stores'}</Value>
        </ReviewItem>
      </ReviewList>
    </Card>
  );
};











