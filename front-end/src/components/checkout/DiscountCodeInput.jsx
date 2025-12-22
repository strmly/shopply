import { useState } from 'react';
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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  margin-bottom: ${props => props.expanded ? props.theme.spacing.sm : 0};
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Chevron = styled.span`
  font-size: 18px;
  color: ${props => props.theme.colors.text.tertiary};
  transition: transform 0.2s ease;
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const ExpandedContent = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  animation: ${fadeIn} 0.2s ease-in;
`;

const Input = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.error 
    ? props.theme.colors.dangerBase 
    : props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const ApplyButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SuccessMessage = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.successBase};
  font-weight: 600;
  margin-top: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const ErrorText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.dangerBase};
  font-weight: 600;
  margin-top: ${props => props.theme.spacing.xs};
`;

export const DiscountCodeInput = ({ promoCode, onPromoCodeChange, cart }) => {
  const [expanded, setExpanded] = useState(!!promoCode);
  const [inputValue, setInputValue] = useState(promoCode || '');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(!!promoCode);

  const handleApply = async () => {
    if (!inputValue.trim()) {
      setError('Please enter a promo code');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/cart/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default',
          promoCode: inputValue.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setError(null);
        setSuccess(true);
        onPromoCodeChange(inputValue.trim());
      } else {
        setError(data.message || 'Invalid promo code');
        setSuccess(false);
      }
    } catch (err) {
      setError('Failed to apply promo code');
      setSuccess(false);
    }
  };

  const discount = cart?.totals?.discount || 0;

  return (
    <Card>
      <Header 
        expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <Title>
          🏷 {promoCode ? `Promo: ${promoCode}` : 'Add Promo Code'}
        </Title>
        <Chevron expanded={expanded}>↓</Chevron>
      </Header>

      {expanded && (
        <ExpandedContent>
          <Input
            type="text"
            placeholder="Enter code"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            error={error}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleApply();
              }
            }}
          />
          <ApplyButton onClick={handleApply}>
            Apply
          </ApplyButton>
        </ExpandedContent>
      )}

      {success && discount > 0 && (
        <SuccessMessage>
          ✓ Promo applied! You saved R{discount.toFixed(2)}.
        </SuccessMessage>
      )}

      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
};











