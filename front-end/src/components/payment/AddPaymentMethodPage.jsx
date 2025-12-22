import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { 
  InputWrapper, 
  InputLabel, 
  Input, 
  HelperText,
  ErrorMessage 
} from '../ui/Input';
import { BottomNavigation } from '../home/BottomNavigation';
import { toast } from '../ui/Toast';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 100px;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    color: ${props => props.theme.colors.primary};
    transform: translateX(-2px);
  }
`;

const Title = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 24px;
  margin: 0;
  flex: 1;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const EntryOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const EntryOption = styled.button`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.$active 
    ? props.theme.colors.primarySoftBg 
    : props.theme.colors.surface
  };
  border: 2px solid ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.border.light
  };
  border-radius: ${props => props.theme.radii.lg};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.$active 
    ? props.theme.colors.primary 
    : props.theme.colors.text.primary
  };

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const OptionIcon = styled.div`
  font-size: 32px;
`;

const OptionLabel = styled.div`
  font-size: 14px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CardNumberWrapper = styled.div`
  position: relative;
`;

const BrandIndicator = styled.div`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  font-weight: 700;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
`;

const SecurityNote = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.success[100]};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.success[600]};
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const ToggleLabel = styled.label`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
  flex: 1;
  cursor: pointer;
`;

const ToggleSwitch = styled.input`
  width: 48px;
  height: 24px;
  appearance: none;
  background: ${props => props.checked ? props.theme.colors.primary : props.theme.colors.neutral[200]};
  border-radius: ${props => props.theme.radii.pill};
  position: relative;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.checked ? '24px' : '2px'};
    transition: ${props => props.theme.transitions.swift};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.disabled 
    ? props.theme.colors.neutral[200] 
    : props.theme.colors.primary
  };
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.button}
  font-weight: 600;
  font-size: 16px;
  margin-top: ${props => props.theme.spacing.lg};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const CameraView = styled.div`
  height: 400px;
  background: ${props => props.theme.colors.neutral[900]};
  border-radius: ${props => props.theme.radii.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.lg};
  color: white;
  position: relative;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const CardFrame = styled.div`
  width: 320px;
  height: 200px;
  border: 3px dashed rgba(255, 255, 255, 0.6);
  border-radius: ${props => props.theme.radii.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: ${props => props.theme.transitions.swift};

  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: ${props => props.theme.radii.lg};
    padding: 3px;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
`;

const InstructionText = styled.div`
  ${props => props.theme.typography.body1}
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  padding: 0 ${props => props.theme.spacing.xl};
`;

import API_BASE_URL from '@config/api';

// Luhn algorithm validation
const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Detect card brand
const detectCardBrand = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]|^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6/.test(cleaned)) return 'discover';
  return 'unknown';
};

// Format card number with spaces
const formatCardNumber = (value) => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join(' ') : cleaned;
};

// Format expiry date
const formatExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

export const AddPaymentMethodPage = ({ location }) => {
  const navigate = useNavigate();
  const [entryMode, setEntryMode] = useState('manual'); // 'scan' or 'manual'
  const [formData, setFormData] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    cardholderName: '',
  });
  const [errors, setErrors] = useState({});
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectedBrand, setDetectedBrand] = useState('');

  const userId = 'default'; // TODO: Get from auth context

  useEffect(() => {
    // Check camera permission
    if (entryMode === 'scan') {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then(() => {
          // Camera access granted
        })
        .catch(() => {
          // Camera access denied, switch to manual
          setEntryMode('manual');
        });
    }
  }, [entryMode]);

  useEffect(() => {
    // Detect brand as user types
    if (formData.cardNumber.length > 4) {
      const brand = detectCardBrand(formData.cardNumber);
      setDetectedBrand(brand);
    } else {
      setDetectedBrand('');
    }
  }, [formData.cardNumber]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\D/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!formData.expMonth || formData.expMonth < 1 || formData.expMonth > 12) {
      newErrors.expMonth = 'Invalid month';
    }

    const currentYear = new Date().getFullYear();
    if (!formData.expYear || formData.expYear < currentYear) {
      newErrors.expYear = 'Invalid year';
    } else if (formData.expYear === currentYear && formData.expMonth < new Date().getMonth() + 1) {
      newErrors.expMonth = 'Card has expired';
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      // Limit based on detected brand
      const brand = detectCardBrand(formattedValue);
      const maxLength = getCardNumberLength(brand);
      const cleaned = formattedValue.replace(/\D/g, '');
      if (cleaned.length > maxLength) {
        formattedValue = formatCardNumber(cleaned.slice(0, maxLength));
      }
    } else if (field === 'expMonth' || field === 'expYear') {
      // Allow only numbers
      formattedValue = value.replace(/\D/g, '');
    } else if (field === 'cvv') {
      // Allow only numbers, limit based on brand
      const maxLength = getCVVLength(detectedBrand);
      formattedValue = value.replace(/\D/g, '').slice(0, maxLength);
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleExpiryChange = (value) => {
    const formatted = formatExpiry(value);
    const parts = formatted.split('/');
    if (parts.length === 2) {
      setFormData(prev => ({
        ...prev,
        expMonth: parts[0],
        expYear: parts[1] ? '20' + parts[1] : '',
      }));
    }
  };

  const handleScan = () => {
    // TODO: Implement actual card scanning
    // For now, show a placeholder
    toast.info('Card scanning coming soon. Please use manual entry.');
    setEntryMode('manual');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);

      const cardNumber = formData.cardNumber.replace(/\D/g, '');
      const brand = detectCardBrand(cardNumber);
      const last4 = cardNumber.slice(-4);

      const response = await fetch(`${API_BASE_URL}/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: 'card',
          cardNumber,
          brand,
          last4,
          expMonth: parseInt(formData.expMonth),
          expYear: parseInt(formData.expYear),
          cardholderName: formData.cardholderName || undefined,
          isDefault,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Card added successfully! 🎉');
          // Small delay for better UX
          setTimeout(() => {
            navigate('/payment-methods');
          }, 500);
        } else {
          toast.error(data.message || data.error || 'Failed to add card');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || 'Failed to add card';
        toast.error(errorMessage);
        
        // Set field-specific errors if provided
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const fieldErrors = {};
          errorData.errors.forEach(err => {
            if (err.field) {
              fieldErrors[err.field] = err.message;
            }
          });
          setErrors(prev => ({ ...prev, ...fieldErrors }));
        }
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add card. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>←</BackButton>
        <Title>Add Payment Method</Title>
      </Header>

      <Content>
        <EntryOptions>
          <EntryOption
            $active={entryMode === 'scan'}
            onClick={() => setEntryMode('scan')}
          >
            <OptionIcon>📷</OptionIcon>
            <OptionLabel>Scan Card</OptionLabel>
          </EntryOption>
          <EntryOption
            $active={entryMode === 'manual'}
            onClick={() => setEntryMode('manual')}
          >
            <OptionIcon>⌨️</OptionIcon>
            <OptionLabel>Enter Manually</OptionLabel>
          </EntryOption>
        </EntryOptions>

        {entryMode === 'scan' ? (
          <CameraView>
            <CardFrame>
              <div style={{ fontSize: '48px' }}>💳</div>
            </CardFrame>
            <InstructionText>
              Position your card within the frame
            </InstructionText>
            <SaveButton onClick={handleScan}>
              Start Scanning
            </SaveButton>
          </CameraView>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormSection>
              <InputWrapper>
                <InputLabel>Card Number</InputLabel>
                <CardNumberWrapper>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    maxLength={19}
                    inputMode="numeric"
                    $error={!!errors.cardNumber}
                  />
                  {detectedBrand && (
                    <BrandIndicator>{detectedBrand}</BrandIndicator>
                  )}
                </CardNumberWrapper>
                {errors.cardNumber && <ErrorMessage>{errors.cardNumber}</ErrorMessage>}
              </InputWrapper>

              <FormRow>
                <InputWrapper>
                  <InputLabel>Expiry Date (MM/YY)</InputLabel>
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expMonth && formData.expYear 
                      ? `${String(formData.expMonth).padStart(2, '0')}/${String(formData.expYear).slice(-2)}`
                      : ''
                    }
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    maxLength={5}
                    inputMode="numeric"
                    $error={!!errors.expMonth || !!errors.expYear}
                  />
                  {(errors.expMonth || errors.expYear) && (
                    <ErrorMessage>{errors.expMonth || errors.expYear}</ErrorMessage>
                  )}
                </InputWrapper>

                <InputWrapper>
                  <InputLabel>
                    CVV
                    {detectedBrand && (
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        color: 'inherit',
                        opacity: 0.7 
                      }}>
                        ({getCVVLength(detectedBrand)} digits)
                      </span>
                    )}
                  </InputLabel>
                  <Input
                    type="text"
                    placeholder={detectedBrand === 'amex' ? '1234' : '123'}
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    maxLength={4}
                    inputMode="numeric"
                    $error={!!errors.cvv}
                  />
                  {errors.cvv && <ErrorMessage>{errors.cvv}</ErrorMessage>}
                  {!errors.cvv && detectedBrand && (
                    <HelperText>
                      {getCVVLength(detectedBrand)}-digit code on the {detectedBrand === 'amex' ? 'front' : 'back'} of your card
                    </HelperText>
                  )}
                </InputWrapper>
              </FormRow>

              <InputWrapper>
                <InputLabel>Cardholder Name (Optional)</InputLabel>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                />
                <HelperText>Name as it appears on the card</HelperText>
              </InputWrapper>
            </FormSection>

            <SecurityNote>
              🔒 We never store your CVV. Payments are processed securely.
            </SecurityNote>

            <ToggleWrapper>
              <ToggleLabel htmlFor="default-toggle">
                Set as default payment method
              </ToggleLabel>
              <ToggleSwitch
                id="default-toggle"
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
            </ToggleWrapper>

            <SaveButton type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Card'}
            </SaveButton>
          </form>
        )}
      </Content>

      <BottomNavigation currentPath="/payment-methods" />
    </Container>
  );
};

