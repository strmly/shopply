import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';
import { Button } from '../../ui/Button';
import {
  InputWrapper,
  InputLabel,
  InputContainer,
  StyledInput,
  StyledTextarea,
  InputIcon,
  ErrorMessage,
  HelperText,
} from '../../ui/Input';
import {
  validateStoreName,
  validateDescription,
  validateFile,
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

const LogoUpload = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed ${props => 
    props.$error 
      ? props.theme.colors.dangerBase 
      : props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  background: ${props => props.theme.colors.surface};
  margin: ${props => props.theme.spacing.md} 0;

  &:hover {
    border-color: ${props => 
      props.$error 
        ? props.theme.colors.dangerBase 
        : props.theme.colors.primary};
    background: ${props => 
      props.$error 
        ? props.theme.colors.dangerSoftBg 
        : props.theme.colors.primarySoftBg};
  }
`;

const LogoPreview = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const HoursSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
`;

const DayRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
`;

const DayLabel = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  width: 100px;
  font-size: 14px;
`;

const TimeInput = styled.input`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body2}
  font-size: 14px;
  width: 100px;
`;

const ClosedToggle = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  background: ${props => props.closed 
    ? props.theme.colors.dangerSoftBg 
    : props.theme.colors.successSoftBg};
  color: ${props => props.closed 
    ? props.theme.colors.dangerBase 
    : props.theme.colors.successBase};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const StoreSetup = ({ onNext, onBack, data }) => {
  const [formData, setFormData] = useState({
    storeName: data.name || data.storeName || '',
    description: data.description || '',
    logo: data.logo || null,
    hours: data.hours || {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false },
    },
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationState, setValidationState] = useState({});

  // Real-time validation
  const validateField = (field, value) => {
    let result = { isValid: true, error: null };

    switch (field) {
      case 'storeName':
        result = validateStoreName(value);
        break;
      case 'description':
        result = validateDescription(value);
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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const validation = validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      });

      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, logo: validation.error }));
        e.target.value = ''; // Clear the input
        return;
      }

      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.logo;
        return newErrors;
      });

      // Read file
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.onerror = () => {
        setErrors(prev => ({ ...prev, logo: 'Failed to read file. Please try again.' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      hours: {
        ...formData.hours,
        [day]: {
          ...formData.hours[day],
          [field]: value,
        },
      },
    });
  };

  const toggleDayClosed = (day) => {
    setFormData({
      ...formData,
      hours: {
        ...formData.hours,
        [day]: {
          ...formData.hours[day],
          closed: !formData.hours[day].closed,
        },
      },
    });
  };

  const validate = () => {
    const newErrors = {};
    const newTouched = {};

    const nameResult = validateStoreName(formData.storeName);
    const descResult = validateDescription(formData.description);

    if (!nameResult.isValid) {
      newErrors.storeName = nameResult.error;
      newTouched.storeName = true;
    }
    if (!descResult.isValid) {
      newErrors.description = descResult.error;
      newTouched.description = true;
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
      storeInfo: {
        name: formData.storeName,
        description: formData.description,
        logo: formData.logo,
        hours: formData.hours,
      },
    });
  };

  return (
    <Container>
      <Title>Store Setup</Title>
      <Subtitle>Set up your store name, logo, and hours</Subtitle>

      <Form onSubmit={handleSubmit}>
        <InputWrapper>
          <InputLabel>
            Store Name *
            {touched.storeName && validationState.storeName === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledInput
              type="text"
              value={formData.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              onBlur={() => handleBlur('storeName')}
              placeholder="FreshMart"
              $error={!!errors.storeName}
              $success={touched.storeName && !errors.storeName && formData.storeName}
              $hasIcon={touched.storeName && validationState.storeName === 'success'}
            />
            {touched.storeName && validationState.storeName === 'success' && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.storeName && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.storeName}</span>
            </ErrorMessage>
          )}
          {!errors.storeName && (
            <HelperText>This is how customers will see your store</HelperText>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>
            Description
            {touched.description && validationState.description === 'success' && formData.description && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledTextarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              placeholder="A brief description of your store"
              $error={!!errors.description}
              $success={touched.description && !errors.description && formData.description}
            />
          </InputContainer>
          {errors.description && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.description}</span>
            </ErrorMessage>
          )}
          {!errors.description && (
            <HelperText>
              Optional: Help customers understand what you sell ({formData.description.length}/500 characters)
            </HelperText>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>Store Logo (Optional)</InputLabel>
          <LogoUpload 
            onClick={() => document.getElementById('logo-upload').click()}
            $error={!!errors.logo}
          >
            {formData.logo ? (
              <LogoPreview src={formData.logo} alt="Logo" />
            ) : (
              <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>📷</div>
                <div style={{ fontSize: '12px' }}>Upload Logo</div>
              </div>
            )}
          </LogoUpload>
          <input
            id="logo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleLogoUpload}
          />
          {errors.logo && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.logo}</span>
            </ErrorMessage>
          )}
          {!errors.logo && (
            <HelperText>Recommended: Square image, max 5MB. Formats: JPG, PNG, WebP</HelperText>
          )}
        </InputWrapper>

        <InputGroup>
          <Label>Store Hours</Label>
          <HoursSection>
            {days.map((day) => (
              <DayRow key={day}>
                <DayLabel>{day.charAt(0).toUpperCase() + day.slice(1)}</DayLabel>
                {!formData.hours[day].closed ? (
                  <>
                    <TimeInput
                      type="time"
                      value={formData.hours[day].open}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    />
                    <span>to</span>
                    <TimeInput
                      type="time"
                      value={formData.hours[day].close}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    />
                  </>
                ) : (
                  <div style={{ flex: 1, color: '#666', fontSize: '14px' }}>Closed</div>
                )}
                <ClosedToggle
                  closed={formData.hours[day].closed}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDayClosed(day);
                  }}
                >
                  {formData.hours[day].closed ? 'Closed' : 'Open'}
                </ClosedToggle>
              </DayRow>
            ))}
          </HoursSection>
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
            Continue
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

