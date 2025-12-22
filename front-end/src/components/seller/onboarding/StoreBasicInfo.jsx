import { useState, useEffect } from 'react';
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
  SuccessMessage,
} from '../../ui/Input';
import {
  validatePhone,
  validateEmail,
  validateStoreName,
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

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const storeTypes = [
  'Grocery Store',
  'Bakery',
  'Butcher Shop',
  'General Store',
  'Electronics',
  'Fashion & Clothing',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Liquor Store',
  'Other',
];

export const StoreBasicInfo = ({ onNext, onBack, data }) => {
  const [formData, setFormData] = useState({
    storeType: data.storeBasicInfo?.storeType || '',
    storePhone: data.storeBasicInfo?.storePhone || '',
    contactEmail: data.storeBasicInfo?.contactEmail || data.email || '',
    legalBusinessName: data.legalBusinessName || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationState, setValidationState] = useState({});

  // Real-time validation on change (debounced)
  const validateField = (field, value) => {
    let result = { isValid: true, error: null };

    switch (field) {
      case 'storePhone':
        result = validatePhone(value);
        break;
      case 'contactEmail':
        result = validateEmail(value, false);
        break;
      case 'storeType':
        if (!value || value.trim().length === 0) {
          result = { isValid: false, error: 'Store type is required' };
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

  // Debounced validation
  const debouncedValidate = debounce(validateField, 300);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Validate in real-time
    debouncedValidate(field, value);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validate = () => {
    const newErrors = {};
    const newTouched = {};

    // Validate all fields
    const storeTypeResult = !formData.storeType || formData.storeType.trim().length === 0
      ? { isValid: false, error: 'Store type is required' }
      : { isValid: true, error: null };

    const phoneResult = validatePhone(formData.storePhone);
    const emailResult = validateEmail(formData.contactEmail, false);

    if (!storeTypeResult.isValid) {
      newErrors.storeType = storeTypeResult.error;
      newTouched.storeType = true;
    }
    if (!phoneResult.isValid) {
      newErrors.storePhone = phoneResult.error;
      newTouched.storePhone = true;
    }
    if (!emailResult.isValid) {
      newErrors.contactEmail = emailResult.error;
      newTouched.contactEmail = true;
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

    onNext({
      storeBasicInfo: {
        storeType: formData.storeType,
        storePhone: formData.storePhone,
        contactEmail: formData.contactEmail,
      },
      legalBusinessName: formData.legalBusinessName,
    });
  };

  return (
    <Container>
      <Title>Store Basic Info</Title>
      <Subtitle>Tell us about your store</Subtitle>

      <Form onSubmit={handleSubmit}>
        <InputWrapper>
          <InputLabel>
            Store Type *
            {touched.storeType && validationState.storeType === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledSelect
              value={formData.storeType}
              onChange={(e) => handleChange('storeType', e.target.value)}
              onBlur={() => handleBlur('storeType')}
              $error={!!errors.storeType}
              $success={touched.storeType && !errors.storeType && formData.storeType}
            >
              <option value="">Select store type</option>
              {storeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </StyledSelect>
            {touched.storeType && validationState.storeType === 'success' && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.storeType && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.storeType}</span>
            </ErrorMessage>
          )}
          {!errors.storeType && touched.storeType && (
            <HelperText>Select the type that best describes your store</HelperText>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>
            Store Phone Number *
            {touched.storePhone && validationState.storePhone === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledInput
              type="tel"
              value={formData.storePhone}
              onChange={(e) => handleChange('storePhone', e.target.value)}
              onBlur={() => handleBlur('storePhone')}
              placeholder="+27 12 345 6789"
              $error={!!errors.storePhone}
              $success={touched.storePhone && !errors.storePhone && formData.storePhone}
              $hasIcon={touched.storePhone && validationState.storePhone === 'success'}
            />
            {touched.storePhone && validationState.storePhone === 'success' && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.storePhone && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.storePhone}</span>
            </ErrorMessage>
          )}
          {!errors.storePhone && (
            <HelperText>This will be displayed to customers. Format: +27 12 345 6789</HelperText>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>
            Contact Email
            {touched.contactEmail && validationState.contactEmail === 'success' && formData.contactEmail && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledInput
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              onBlur={() => handleBlur('contactEmail')}
              placeholder="store@example.com"
              $error={!!errors.contactEmail}
              $success={touched.contactEmail && !errors.contactEmail && formData.contactEmail}
              $hasIcon={touched.contactEmail && validationState.contactEmail === 'success' && formData.contactEmail}
            />
            {touched.contactEmail && validationState.contactEmail === 'success' && formData.contactEmail && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.contactEmail && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.contactEmail}</span>
            </ErrorMessage>
          )}
          {!errors.contactEmail && (
            <HelperText>Optional: For receipts and important notifications</HelperText>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>Legal Business Name (Optional)</InputLabel>
          <InputContainer>
            <StyledInput
              type="text"
              value={formData.legalBusinessName}
              onChange={(e) => setFormData({ ...formData, legalBusinessName: e.target.value })}
              placeholder="If different from store name"
            />
          </InputContainer>
          <HelperText>Required only for registered businesses</HelperText>
        </InputWrapper>

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
            Continue
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};
