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

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Label = styled.label`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Input = styled.input`
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

const ErrorText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.dangerBase};
  font-weight: 600;
  font-size: 12px;
`;

const OptionalLabel = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-weight: 400;
  font-size: 11px;
`;

export const ContactInformation = ({ contactInfo, onContactInfoChange, error }) => {
  const handleChange = (field, value) => {
    onContactInfoChange({
      ...contactInfo,
      [field]: value,
    });
  };

  return (
    <Card error={!!error}>
      <Title>
        📱 Contact Information
      </Title>
      
      <InputGroup>
        <InputWrapper>
          <Label>
            Phone Number
            {error && <ErrorText>*</ErrorText>}
          </Label>
          <Input
            type="tel"
            placeholder="+27 12 345 6789"
            value={contactInfo.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={error}
          />
          {error && <ErrorText>{error}</ErrorText>}
        </InputWrapper>

        <InputWrapper>
          <Label>
            Email <OptionalLabel>(optional)</OptionalLabel>
          </Label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={contactInfo.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </InputWrapper>
      </InputGroup>
    </Card>
  );
};











