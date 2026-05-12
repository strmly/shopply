import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const CollapsedButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 2px dashed ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const ExpandedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
`;

const InputRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const Input = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.background};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
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
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: 14px;
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const AppliedCode = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.successSoftBg};
  border: 2px solid ${props => props.theme.colors.successBase};
  border-radius: ${props => props.theme.radii.md};
`;

const CodeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.successBase};
  font-weight: 600;
  font-size: 14px;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.successBase};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transitions.swift};
  font-size: 13px;

  &:hover {
    opacity: 0.8;
  }
`;

const ErrorMessage = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.dangerBase};
  font-weight: 600;
  font-size: 12px;
  margin-top: ${props => props.theme.spacing.xs};
`;

export const PromoCodeInput = ({ promoCode, onApply, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onApply(code);
    
    if (result.success) {
      setCode('');
      setExpanded(false);
    } else {
      setError(result.message || 'Invalid promo code');
    }

    setLoading(false);
  };

  const handleRemove = () => {
    onRemove();
  };

  if (promoCode) {
    return (
      <Container>
        <AppliedCode>
          <CodeInfo>
            <span>✓</span>
            <span>Promo code applied: {promoCode}</span>
          </CodeInfo>
          <RemoveButton onClick={handleRemove}>Remove</RemoveButton>
        </AppliedCode>
      </Container>
    );
  }

  if (!expanded) {
    return (
      <Container>
        <CollapsedButton onClick={() => setExpanded(true)}>
          <span>🏷️</span>
          <span>Add Promo Code</span>
        </CollapsedButton>
      </Container>
    );
  }

  return (
    <Container>
      <ExpandedContainer>
        <InputRow>
          <Input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApply();
              }
            }}
          />
          <ApplyButton onClick={handleApply} disabled={loading}>
            {loading ? '...' : 'Apply'}
          </ApplyButton>
        </InputRow>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ExpandedContainer>
    </Container>
  );
};











