import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { 
  InputWrapper, 
  InputLabel, 
  Input, 
  StyledTextarea, 
  StyledSelect,
  HelperText,
  ErrorMessage 
} from '../ui/Input';
import { BottomNavigation } from '../home/BottomNavigation';
import { toast } from '../ui/Toast';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 52%, #ffffff 100%);
  animation: ${fadeIn} 0.5s ease-in;
  padding-bottom: 100px;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background:
    linear-gradient(120deg, rgba(255,255,255,0.98), rgba(241,247,255,0.95)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  border: 1px solid transparent;
  border-radius: 0 0 30px 30px;
  padding: calc(18px + env(safe-area-inset-top)) min(5vw, 48px) 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  box-shadow: 0 24px 62px rgba(16, 24, 40, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const BackButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.95);
  font-size: 24px;
  font-weight: 900;
  cursor: pointer;
  color: ${props => props.theme.colors.text.primary};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.06);

  &:hover {
    color: ${props => props.theme.colors.primary};
    transform: translateX(-2px);
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: clamp(22px, 5vw, 34px);
  line-height: 1;
  margin: 0;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding: clamp(16px, 3vw, 24px);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94)) padding-box,
    linear-gradient(140deg, rgba(61,129,239,0.18), rgba(228,231,236,0.9), rgba(21,161,124,0.12)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 20px 46px rgba(16, 24, 40, 0.08);
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  font-size: 18px;
  margin: 0;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid rgba(228, 231, 236, 0.95);
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
  position: sticky;
  bottom: 100px;
  z-index: 50;
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.button}
  font-weight: 600;
  font-size: 16px;
  margin-top: ${props => props.theme.spacing.xl};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

import API_BASE_URL from '@config/api';

const LABEL_OPTIONS = ['Home', 'Work', 'Mom\'s House', 'Other'];

export const AddEditAddressPage = ({ location }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const userId = 'default'; // TODO: Get from auth context

  const [formData, setFormData] = useState({
    label: 'Home',
    customLabel: '',
    street: '',
    unit: '',
    floor: '',
    suburb: '',
    city: '',
    postalCode: '',
    deliveryInstructions: '',
    latitude: null,
    longitude: null,
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isEdit) {
      loadAddress();
    } else if (location) {
      setFormData(prev => ({
        ...prev,
        suburb: location.suburb || '',
        city: location.city || '',
      }));
    }
  }, [id, location]);

  const loadAddress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const addr = data.data;
          const label = addr.label || 'Home';
          setFormData({
            label: LABEL_OPTIONS.includes(label) ? label : 'Other',
            customLabel: LABEL_OPTIONS.includes(label) ? '' : label,
            street: addr.street || '',
            unit: addr.unit || '',
            floor: addr.floor || '',
            suburb: addr.suburb || '',
            city: addr.city || '',
            postalCode: addr.postalCode || '',
            deliveryInstructions: addr.deliveryInstructions || '',
            latitude: addr.latitude || null,
            longitude: addr.longitude || null,
            isDefault: addr.isDefault || false,
          });
        }
      }
    } catch (error) {
      console.error('Error loading address:', error);
      toast.error('Failed to load address');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.suburb.trim()) {
      newErrors.suburb = 'Suburb is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (formData.label === 'Other' && !formData.customLabel.trim()) {
      newErrors.customLabel = 'Custom label is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const addressData = {
        ...formData,
        userId,
        label: formData.label === 'Other' && formData.customLabel 
          ? formData.customLabel 
          : formData.label,
      };
      delete addressData.customLabel;

      const url = isEdit 
        ? `${API_BASE_URL}/addresses/${id}`
        : `${API_BASE_URL}/addresses`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(isEdit ? 'Address updated successfully' : 'Address saved successfully');
          navigate('/addresses');
        } else {
          toast.error(data.message || 'Failed to save address');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => navigate(-1)}>&lt;</BackButton>
            <Title>Edit Address</Title>
          </HeaderLeft>
        </Header>
        <Content>
          <div>Loading...</div>
        </Content>
        <BottomNavigation currentPath="/addresses" />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>&lt;</BackButton>
          <Title>{isEdit ? 'Edit Address' : 'Add Address'}</Title>
        </HeaderLeft>
      </Header>

      <Content>
        <Section>
          <SectionTitle>Address Details</SectionTitle>
          
          <InputWrapper>
            <InputLabel>Address Label</InputLabel>
            <StyledSelect
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
            >
              {LABEL_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </StyledSelect>
            {formData.label === 'Other' && (
              <>
                <Input
                  placeholder="Enter custom label"
                  value={formData.customLabel || ''}
                  onChange={(e) => handleInputChange('customLabel', e.target.value)}
                  $error={!!errors.customLabel}
                  style={{ marginTop: '8px' }}
                />
                {errors.customLabel && <ErrorMessage>{errors.customLabel}</ErrorMessage>}
              </>
            )}
          </InputWrapper>

          <InputWrapper>
            <InputLabel>Street Address *</InputLabel>
            <Input
              placeholder="e.g., 22 Rivonia Rd"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              $error={!!errors.street}
              readOnly={false}
            />
            {errors.street && <ErrorMessage>{errors.street}</ErrorMessage>}
            <HelperText>Type the delivery address exactly as couriers should see it.</HelperText>
          </InputWrapper>

          <FormRow>
            <InputWrapper>
              <InputLabel>Unit / Apartment</InputLabel>
              <Input
                placeholder="e.g., 101"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
              />
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Floor</InputLabel>
              <Input
                placeholder="e.g., 3rd"
                value={formData.floor}
                onChange={(e) => handleInputChange('floor', e.target.value)}
              />
            </InputWrapper>
          </FormRow>

          <InputWrapper>
            <InputLabel>Suburb *</InputLabel>
            <Input
              placeholder="e.g., Sandton"
              value={formData.suburb}
              onChange={(e) => handleInputChange('suburb', e.target.value)}
              $error={!!errors.suburb}
            />
            {errors.suburb && <ErrorMessage>{errors.suburb}</ErrorMessage>}
          </InputWrapper>

          <FormRow>
            <InputWrapper>
              <InputLabel>City *</InputLabel>
              <Input
                placeholder="e.g., Johannesburg"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                $error={!!errors.city}
              />
              {errors.city && <ErrorMessage>{errors.city}</ErrorMessage>}
            </InputWrapper>

            <InputWrapper>
              <InputLabel>Postal Code</InputLabel>
              <Input
                placeholder="e.g., 2196"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
              />
            </InputWrapper>
          </FormRow>

          <InputWrapper>
            <InputLabel>Delivery Instructions</InputLabel>
            <StyledTextarea
              placeholder="Add gate code or landmark to help couriers find you..."
              value={formData.deliveryInstructions}
              onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
              rows={3}
            />
            <HelperText>
              Add gate code or landmark to help couriers find you.
            </HelperText>
          </InputWrapper>
        </Section>

        <Section>
          <ToggleWrapper>
            <ToggleLabel htmlFor="default-toggle">
              Make this my default delivery address
            </ToggleLabel>
            <ToggleSwitch
              id="default-toggle"
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            />
          </ToggleWrapper>
        </Section>

        <SaveButton onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Address'}
        </SaveButton>
      </Content>

      <BottomNavigation currentPath="/addresses" />
    </Container>
  );
};

