import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { Map } from '../ui/Map';
import { AddressSearch } from './AddressSearch';
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
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
`;

const HeaderLeft = styled.div`
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
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.xl};
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 18px;
  margin: 0;
`;

const SearchBar = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const MapContainer = styled.div`
  height: 300px;
  border-radius: ${props => props.theme.radii.lg};
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.border.light};
  margin-bottom: ${props => props.theme.spacing.md};
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
  position: sticky;
  bottom: 100px;
  z-index: 50;
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
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

const AutoDetectButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  ${props => props.theme.typography.button}
  font-size: 14px;
  margin-bottom: ${props => props.theme.spacing.md};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
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
  const [mapCenter, setMapCenter] = useState(
    location ? { lat: location.lat, lng: location.lng } : null
  );

  useEffect(() => {
    if (isEdit) {
      loadAddress();
    } else if (location) {
      setMapCenter({ lat: location.lat, lng: location.lng });
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
            latitude: addr.latitude,
            longitude: addr.longitude,
            isDefault: addr.isDefault || false,
          });
          
          if (addr.latitude && addr.longitude) {
            setMapCenter({ lat: addr.latitude, lng: addr.longitude });
          }
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

  const handleMapPositionChange = (position) => {
    setFormData(prev => ({
      ...prev,
      latitude: position.lat,
      longitude: position.lng,
    }));
    setMapCenter(position);
  };

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(pos);
          handleMapPositionChange(pos);
          toast.success('Location detected');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Failed to detect location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
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
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please set location on map';
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
            <BackButton onClick={() => navigate(-1)}>←</BackButton>
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
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <Title>{isEdit ? 'Edit Address' : 'Add Address'}</Title>
        </HeaderLeft>
      </Header>

      <Content>
        <Section>
          <SectionTitle>Location</SectionTitle>
          
          <SearchBar>
            <AddressSearch
              value={formData.street}
              onChange={(value) => {
                handleInputChange('street', value);
                // If suggestion selected, it will be handled by onSelect
              }}
              onSelect={(suggestion) => {
                // Auto-fill form from suggestion
                if (suggestion.street) {
                  handleInputChange('street', suggestion.street);
                }
                if (suggestion.suburb) {
                  handleInputChange('suburb', suggestion.suburb);
                }
                if (suggestion.city) {
                  handleInputChange('city', suggestion.city);
                }
              }}
              placeholder="Search your street, building, or landmark"
            />
          </SearchBar>

          <AutoDetectButton onClick={handleAutoDetect}>
            📍 Auto-detect my location
          </AutoDetectButton>
          
          {mapCenter && (
            <MapContainer>
              <Map
                center={mapCenter}
                zoom={15}
                height="300px"
                draggable={true}
                onPositionChange={handleMapPositionChange}
              />
            </MapContainer>
          )}

          {errors.location && (
            <ErrorMessage>{errors.location}</ErrorMessage>
          )}
        </Section>

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
              <Input
                placeholder="Enter custom label"
                value={formData.customLabel || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, customLabel: value, label: value || 'Other' }));
                }}
                style={{ marginTop: '8px' }}
              />
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
            <HelperText>Use the search above to find your address quickly</HelperText>
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

