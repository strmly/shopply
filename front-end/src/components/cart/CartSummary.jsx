import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.surface};
  margin: ${props => props.theme.spacing.xl} 0;
  border-radius: ${props => props.theme.radii.lg};
  animation: ${fadeIn} 0.3s ease-in;
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading4}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-weight: 600;
  font-size: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} 0;
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const Label = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.secondary};
`;

const InfoIcon = styled.span`
  font-size: 14px;
  cursor: help;
  color: ${props => props.theme.colors.text.tertiary};
`;

const Value = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const DiscountValue = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.successBase};
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border.light};
  margin: ${props => props.theme.spacing.md} 0;
`;

const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} 0;
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 20px;
  border-top: 2px solid ${props => props.theme.colors.border.default};
  margin-top: ${props => props.theme.spacing.md};
`;

const SavingsBadge = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.successSoftBg};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase};
  font-weight: 600;
  font-size: 12px;
  text-align: center;
`;

export const CartSummary = ({ totals }) => {
  if (!totals) return null;

  const savings = totals.discount || 0;

  return (
    <Container>
      <SectionTitle>Summary</SectionTitle>
      
      <SummaryRow>
        <Label>Items Total</Label>
        <Value>R{totals.itemsTotal?.toFixed(2) || '0.00'}</Value>
      </SummaryRow>

      <SummaryRow>
        <Label>
          Delivery Fee
          <InfoIcon title="Delivery fee based on distance from store">ℹ️</InfoIcon>
        </Label>
        <Value>R{totals.deliveryFee?.toFixed(2) || '0.00'}</Value>
      </SummaryRow>

      {totals.smallOrderFee > 0 && (
        <SummaryRow>
          <Label>
            Small Order Fee
            <InfoIcon title="Applied to orders under R50">ℹ️</InfoIcon>
          </Label>
          <Value>R{totals.smallOrderFee?.toFixed(2) || '0.00'}</Value>
        </SummaryRow>
      )}

      <SummaryRow>
        <Label>
          Service Fee
          <InfoIcon title="Platform service fee (2% of order)">ℹ️</InfoIcon>
        </Label>
        <Value>R{totals.serviceFee?.toFixed(2) || '0.00'}</Value>
      </SummaryRow>

      {totals.discount > 0 && (
        <>
          <SummaryRow>
            <Label>Discounts</Label>
            <DiscountValue>-R{totals.discount.toFixed(2)}</DiscountValue>
          </SummaryRow>
          <SavingsBadge>
            ✓ You saved R{totals.discount.toFixed(2)} on discounts
          </SavingsBadge>
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











