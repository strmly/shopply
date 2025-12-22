import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { Button } from '../../ui/Button';
import {
  InputWrapper,
  InputLabel,
  InputContainer,
  StyledInput,
  StyledSelect,
  InputIcon,
  ErrorMessage,
  HelperText,
} from '../../ui/Input';
import {
  validateAccountHolderName,
  validateAccountNumber,
  validateBranchCode,
  debounce,
} from '../../../utils/validation';

const Container = styled.div`
  min-height: 100vh;
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
  max-width: 500px;
  margin: 0 auto;
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 24px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Label = styled.label`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  font-size: 16px;
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  font-size: 16px;
  background: ${props => props.theme.colors.surface};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.successSoftBg};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const banks = [
  'Standard Bank',
  'First National Bank (FNB)',
  'Nedbank',
  'Absa',
  'Capitec',
  'Investec',
  'African Bank',
];

export const BankAccountSetup = ({ onNext, onBack, data }) => {
  const [formData, setFormData] = useState({
    accountHolderName: data.bankAccount?.accountHolderName || '',
    bankName: data.bankAccount?.bankName || '',
    accountNumber: data.bankAccount?.accountNumber || '',
    branchCode: data.bankAccount?.branchCode || '',
    payoutMethod: data.bankAccount?.payoutMethod || 'weekly',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationState, setValidationState] = useState({});

  // Real-time validation
  const validateField = (field, value) => {
    let result = { isValid: true, error: null };

    switch (field) {
      case 'accountHolderName':
        result = validateAccountHolderName(value);
        break;
      case 'accountNumber':
        result = validateAccountNumber(value);
        break;
      case 'branchCode':
        result = validateBranchCode(value);
        break;
      case 'bankName':
        if (!value || value.trim().length < 2) {
          result = { isValid: false, error: 'Bank name is required' };
        }
        break;
      default:
        break;
    }

    setValidationState(prev => ({
      ...prev,
      [field]: result.isValid ? 'success' : 'error',
    }));

    if (touched[field] || result.isValid === false) {
      setErrors(prev => ({
        ...prev,
        [field]: result.error,
      }));
    }
  };

  const debouncedValidate = debounce(validateField, 300);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    debouncedValidate(field, value);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validate = () => {
    const newErrors = {};
    const newTouched = {};

    const nameResult = validateAccountHolderName(formData.accountHolderName);
    const accountResult = validateAccountNumber(formData.accountNumber);
    const branchResult = validateBranchCode(formData.branchCode);
    const bankResult = !formData.bankName || formData.bankName.trim().length < 2
      ? { isValid: false, error: 'Bank name is required' }
      : { isValid: true, error: null };

    if (!nameResult.isValid) {
      newErrors.accountHolderName = nameResult.error;
      newTouched.accountHolderName = true;
    }
    if (!bankResult.isValid) {
      newErrors.bankName = bankResult.error;
      newTouched.bankName = true;
    }
    if (!accountResult.isValid) {
      newErrors.accountNumber = accountResult.error;
      newTouched.accountNumber = true;
    }
    if (!branchResult.isValid) {
      newErrors.branchCode = branchResult.error;
      newTouched.branchCode = true;
    }

    setErrors(newErrors);
    setTouched(newTouched);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    onNext({ bankAccount: formData });
  };

  return (
    <Container>
      <Title>Bank Account Setup</Title>
      <Subtitle>Where should we send your payouts?</Subtitle>

      <SecurityNote>
        🔒 Your banking data is securely encrypted
      </SecurityNote>

      <Form onSubmit={handleSubmit}>
        <InputWrapper>
          <InputLabel>
            Account Holder Name *
            {touched.accountHolderName && validationState.accountHolderName === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledInput
              type="text"
              value={formData.accountHolderName}
              onChange={(e) => handleChange('accountHolderName', e.target.value)}
              onBlur={() => handleBlur('accountHolderName')}
              placeholder="John Doe"
              $error={!!errors.accountHolderName}
              $success={touched.accountHolderName && !errors.accountHolderName && formData.accountHolderName}
              $hasIcon={touched.accountHolderName && validationState.accountHolderName === 'success'}
            />
            {touched.accountHolderName && validationState.accountHolderName === 'success' && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.accountHolderName && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.accountHolderName}</span>
            </ErrorMessage>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>
            Bank Name *
            {touched.bankName && validationState.bankName === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledSelect
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              onBlur={() => handleBlur('bankName')}
              $error={!!errors.bankName}
              $success={touched.bankName && !errors.bankName && formData.bankName}
            >
              <option value="">Select bank</option>
              {banks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </StyledSelect>
            {touched.bankName && validationState.bankName === 'success' && (
              <InputIcon style={{ color: '#15A17C', right: '32px' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.bankName && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.bankName}</span>
            </ErrorMessage>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>
            Account Number *
            {touched.accountNumber && validationState.accountNumber === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledInput
              type="text"
              inputMode="numeric"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              onBlur={() => handleBlur('accountNumber')}
              placeholder="1234567890"
              $error={!!errors.accountNumber}
              $success={touched.accountNumber && !errors.accountNumber && formData.accountNumber}
              $hasIcon={touched.accountNumber && validationState.accountNumber === 'success'}
            />
            {touched.accountNumber && validationState.accountNumber === 'success' && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.accountNumber && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.accountNumber}</span>
            </ErrorMessage>
          )}
          {!errors.accountNumber && (
            <HelperText>Enter your account number (numbers only, 8-20 digits)</HelperText>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>
            Branch Code *
            {touched.branchCode && validationState.branchCode === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledInput
              type="text"
              inputMode="numeric"
              value={formData.branchCode}
              onChange={(e) => handleChange('branchCode', e.target.value.replace(/\D/g, ''))}
              onBlur={() => handleBlur('branchCode')}
              placeholder="123456"
              $error={!!errors.branchCode}
              $success={touched.branchCode && !errors.branchCode && formData.branchCode}
              $hasIcon={touched.branchCode && validationState.branchCode === 'success'}
            />
            {touched.branchCode && validationState.branchCode === 'success' && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.branchCode && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.branchCode}</span>
            </ErrorMessage>
          )}
          {!errors.branchCode && (
            <HelperText>Enter your branch code (numbers only, 4-10 digits)</HelperText>
          )}
        </InputWrapper>

        <InputGroup>
          <Label>Payout Method *</Label>
          <Select
            value={formData.payoutMethod}
            onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value })}
            required
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </InputGroup>

        <ButtonGroup>
          <Button 
            type="button" 
            onClick={onBack} 
            variant="outline"
            style={{ flex: 1 }}
          >
            Back
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            style={{ flex: 1 }}
          >
            Complete Setup
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

