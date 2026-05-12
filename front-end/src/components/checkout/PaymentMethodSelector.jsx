import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.error 
    ? props.theme.colors.dangerBase 
    : props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Option = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => props.selected 
    ? props.theme.colors.primarySoftBg 
    : 'transparent'};
  border: 2px solid ${props => props.selected 
    ? props.theme.colors.primary 
    : props.theme.colors.border.light};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const OptionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex: 1;
`;

const Radio = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const OptionText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
`;

const AddButton = styled.button`
  background: transparent;
  border: 1px dashed ${props => props.theme.colors.border.light};
  color: ${props => props.theme.colors.primary};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const ErrorText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.dangerBase};
  font-weight: 600;
  margin-top: ${props => props.theme.spacing.xs};
`;

export const PaymentMethodSelector = ({ paymentMethod, onPaymentMethodChange, error }) => {
  const savedCard = localStorage.getItem('tsenga_saved_card');
  const cardNumber = savedCard ? JSON.parse(savedCard).last4 : null;

  return (
    <Card error={!!error}>
      <Title>
        💳 Payment Method
      </Title>
      
      <OptionGroup>
        {cardNumber && (
          <Option 
            selected={paymentMethod === 'card'}
            onClick={() => onPaymentMethodChange('card')}
          >
            <OptionLeft>
              <Radio
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => onPaymentMethodChange('card')}
              />
              <OptionText>Card ending {cardNumber}</OptionText>
            </OptionLeft>
          </Option>
        )}

        <Option 
          selected={paymentMethod === 'mobile_money'}
          onClick={() => onPaymentMethodChange('mobile_money')}
        >
          <OptionLeft>
            <Radio
              type="radio"
              name="paymentMethod"
              value="mobile_money"
              checked={paymentMethod === 'mobile_money'}
              onChange={() => onPaymentMethodChange('mobile_money')}
            />
            <OptionText>Mobile Money</OptionText>
          </OptionLeft>
        </Option>

        <Option 
          selected={paymentMethod === 'cash'}
          onClick={() => onPaymentMethodChange('cash')}
        >
          <OptionLeft>
            <Radio
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => onPaymentMethodChange('cash')}
            />
            <OptionText>Cash on Delivery</OptionText>
          </OptionLeft>
        </Option>
      </OptionGroup>

      <AddButton onClick={() => alert('Add new card feature coming soon')}>
        + Add New Card
      </AddButton>

      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
};











