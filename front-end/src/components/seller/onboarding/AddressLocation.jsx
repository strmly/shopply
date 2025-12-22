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
  validateAddress,
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

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.body1}
  font-size: 16px;
  min-height: 80px;
  resize: vertical;
  transition: ${props => props.theme.transitions.swift};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primarySoftBg};
  }
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  margin: ${props => props.theme.spacing.md} 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

export const AddressLocation = ({ onNext, onBack, data }) => {
  const [formData, setFormData] = useState({
    street: data.address?.street || '',
    suburb: data.address?.suburb || '',
    city: data.address?.city || '',
    entranceInstructions: data.address?.entranceInstructions || '',
    lat: data.address?.lat || -26.1076,
    lng: data.address?.lng || 28.0567,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationState, setValidationState] = useState({});

  // Real-time validation for individual fields
  const validateField = (field, value) => {
    const address = { ...formData, [field]: value };
    const result = validateAddress(address);
    
    if (result.errors[field]) {
      setErrors(prev => ({ ...prev, [field]: result.errors[field] }));
      setValidationState(prev => ({ ...prev, [field]: 'error' }));
    } else if (touched[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      setValidationState(prev => ({ ...prev, [field]: 'success' }));
    }
  };

  const debouncedValidate = debounce(validateField, 300);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    debouncedValidate(field, value);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData({
          ...formData,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  const validate = () => {
    const result = validateAddress(formData);
    setErrors(result.errors);
    setTouched({
      street: true,
      suburb: true,
      city: true,
    });
    return result.isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    onNext({
      address: {
        street: formData.street,
        suburb: formData.suburb,
        city: formData.city,
        entranceInstructions: formData.entranceInstructions,
        lat: formData.lat,
        lng: formData.lng,
      },
    });
  };

  return (
    <Container>
      <Title>Address & Location</Title>
      <Subtitle>Where is your store located?</Subtitle>

      <Form onSubmit={handleSubmit}>
        <MapPlaceholder>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>📍</div>
            <div>Map with draggable pin</div>
            <Button 
              type="button" 
              onClick={handleLocationDetect}
              style={{ marginTop: '12px', fontSize: '12px', padding: '8px 16px' }}
            >
              Detect My Location
            </Button>
          </div>
        </MapPlaceholder>

        <InputWrapper>
          <InputLabel>
            Street Address *
            {touched.street && validationState.street === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledInput
              type="text"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value)}
              onBlur={() => handleBlur('street')}
              placeholder="123 Main Street"
              $error={!!errors.street}
              $success={touched.street && !errors.street && formData.street}
              $hasIcon={touched.street && validationState.street === 'success'}
            />
            {touched.street && validationState.street === 'success' && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.street && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.street}</span>
            </ErrorMessage>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>
            Suburb *
            {touched.suburb && validationState.suburb === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledInput
              type="text"
              value={formData.suburb}
              onChange={(e) => handleChange('suburb', e.target.value)}
              onBlur={() => handleBlur('suburb')}
              placeholder="Sandton"
              $error={!!errors.suburb}
              $success={touched.suburb && !errors.suburb && formData.suburb}
              $hasIcon={touched.suburb && validationState.suburb === 'success'}
            />
            {touched.suburb && validationState.suburb === 'success' && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.suburb && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.suburb}</span>
            </ErrorMessage>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>
            City *
            {touched.city && validationState.city === 'success' && (
              <span style={{ color: '#15A17C' }}>✓</span>
            )}
          </InputLabel>
          <InputContainer>
            <StyledInput
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              onBlur={() => handleBlur('city')}
              placeholder="Johannesburg"
              $error={!!errors.city}
              $success={touched.city && !errors.city && formData.city}
              $hasIcon={touched.city && validationState.city === 'success'}
            />
            {touched.city && validationState.city === 'success' && (
              <InputIcon style={{ color: '#15A17C' }}>✓</InputIcon>
            )}
          </InputContainer>
          {errors.city && (
            <ErrorMessage>
              <span>⚠️</span>
              <span>{errors.city}</span>
            </ErrorMessage>
          )}
        </InputWrapper>

        <InputWrapper>
          <InputLabel>Entrance Instructions (Optional)</InputLabel>
          <InputContainer>
            <StyledTextarea
              value={formData.entranceInstructions}
              onChange={(e) => setFormData({ ...formData, entranceInstructions: e.target.value })}
              placeholder="Gate code, floor number, etc."
            />
          </InputContainer>
          <HelperText>Help delivery drivers find your store entrance</HelperText>
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

