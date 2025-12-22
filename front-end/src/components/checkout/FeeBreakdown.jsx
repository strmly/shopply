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

const BreakdownList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${props => props.theme.typography.body2}
  color: ${props => props.isTotal 
    ? props.theme.colors.text.primary 
    : props.theme.colors.text.secondary};
  font-weight: ${props => props.isTotal ? 700 : 400};
  font-size: ${props => props.isTotal ? '18px' : '14px'};
`;

const Label = styled.span`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const InfoIcon = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.text.tertiary};
  cursor: help;
`;

const Value = styled.span`
  font-weight: ${props => props.isTotal ? 700 : 600};
`;

const DiscountValue = styled(Value)`
  color: ${props => props.theme.colors.successBase};
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border.light};
  margin: ${props => props.theme.spacing.sm} 0;
`;

const SavingsMessage = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase};
  font-weight: 600;
  margin-top: ${props => props.theme.spacing.xs};
  font-size: 12px;
`;

export const FeeBreakdown = ({ totals }) => {
  if (!totals) {
    return null;
  }

  const {
    itemsTotal = 0,
    deliveryFee = 0,
    smallOrderFee = 0,
    serviceFee = 0,
    discount = 0,
    total = 0,
  } = totals;

  const totalSavings = discount;
  const hasDiscount = discount > 0;

  return (
    <Card>
      <Title>💰 Fees & Total</Title>
      
      <BreakdownList>
        <Row>
          <Label>Items Total</Label>
          <Value>R{itemsTotal.toFixed(2)}</Value>
        </Row>

        {deliveryFee > 0 && (
          <Row>
            <Label>
              Delivery Fee
              <InfoIcon title="Delivery fee varies by distance">ℹ️</InfoIcon>
            </Label>
            <Value>R{deliveryFee.toFixed(2)}</Value>
          </Row>
        )}

        {smallOrderFee > 0 && (
          <Row>
            <Label>
              Small Order Fee
              <InfoIcon title="Applies to orders under R50">ℹ️</InfoIcon>
            </Label>
            <Value>R{smallOrderFee.toFixed(2)}</Value>
          </Row>
        )}

        {serviceFee > 0 && (
          <Row>
            <Label>
              Service Fee
              <InfoIcon title="2% of order value, minimum R2.50">ℹ️</InfoIcon>
            </Label>
            <Value>R{serviceFee.toFixed(2)}</Value>
          </Row>
        )}

        {hasDiscount && (
          <Row>
            <Label>Discounts</Label>
            <DiscountValue>-R{discount.toFixed(2)}</DiscountValue>
          </Row>
        )}

        <Divider />

        <Row isTotal>
          <Label>Total</Label>
          <Value>R{total.toFixed(2)}</Value>
        </Row>
      </BreakdownList>

      {hasDiscount && (
        <SavingsMessage>
          You saved R{totalSavings.toFixed(2)} on this order.
        </SavingsMessage>
      )}
    </Card>
  );
};











