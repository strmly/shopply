import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: 24px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(196, 184, 252, 0.16), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 26px;
  animation: ${fadeIn} 0.3s ease-in;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 16px;
  font-weight: 900;
  font-size: 22px;
  line-height: 1.15;
`;

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
`;

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 700;
`;

const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  border-radius: 999px;
  background: ${props => props.theme.colors.neutral[100]};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 900;
  cursor: help;
`;

const Value = styled.div`
  font-weight: 900;
  color: ${props => props.theme.colors.text.primary};
`;

const DiscountValue = styled.div`
  font-weight: 900;
  color: ${props => props.theme.colors.successBase};
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border.light};
  margin: 14px 0;
`;

const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 4px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 24px;
`;

const SavingsBadge = styled.div`
  margin-top: 10px;
  padding: 10px 12px;
  background: ${props => props.theme.colors.success[100]};
  border: 1px solid rgba(21, 161, 124, 0.16);
  border-radius: 16px;
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase};
  font-weight: 900;
  text-align: center;
`;

export const CartSummary = ({ totals }) => {
  if (!totals) return null;

  return (
    <Container>
      <SectionTitle>Order Summary</SectionTitle>

      <SummaryRow>
        <Label>Items total</Label>
        <Value>R{totals.itemsTotal?.toFixed(2) || '0.00'}</Value>
      </SummaryRow>

      <SummaryRow>
        <Label>
          Delivery fee
          <InfoIcon title="Delivery fee based on distance from store">i</InfoIcon>
        </Label>
        <Value>R{totals.deliveryFee?.toFixed(2) || '0.00'}</Value>
      </SummaryRow>

      {totals.smallOrderFee > 0 && (
        <SummaryRow>
          <Label>
            Small order fee
            <InfoIcon title="Applied to orders under R50">i</InfoIcon>
          </Label>
          <Value>R{totals.smallOrderFee?.toFixed(2) || '0.00'}</Value>
        </SummaryRow>
      )}

      <SummaryRow>
        <Label>
          Service fee
          <InfoIcon title="Platform service fee">i</InfoIcon>
        </Label>
        <Value>R{totals.serviceFee?.toFixed(2) || '0.00'}</Value>
      </SummaryRow>

      {totals.discount > 0 && (
        <>
          <SummaryRow>
            <Label>Discounts</Label>
            <DiscountValue>-R{totals.discount.toFixed(2)}</DiscountValue>
          </SummaryRow>
          <SavingsBadge>You saved R{totals.discount.toFixed(2)} on discounts</SavingsBadge>
        </>
      )}

      <Divider />

      <TotalRow>
        <div>Total</div>
        <div>R{totals.total?.toFixed(2) || '0.00'}</div>
      </TotalRow>
    </Container>
  );
};
