import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { Map } from '../ui';
import { Input, InputContainer, Label, Button } from '../ui';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.5s ease-in;
`;

const MapSection = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.radii.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  flex: 1;
`;

const SectionTitle = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const HelperText = styled.p`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const AccuracyWarning = styled.div`
  ${props => props.theme.typography.body2}
  background: ${props => props.theme.colors.warning[100]};
  color: ${props => props.theme.colors.warningBase};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  margin-top: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &::before {
    content: '⚠️';
    font-size: 18px;
  }
`;

const RefineButton = styled.button`
  ${props => props.theme.typography.body2}
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-top: ${props => props.theme.spacing.xs};
`;

const WarningText = styled.p`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.warningBase};
  background: ${props => props.theme.colors.warning[100]};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
`;

export const AddressConfirmationScreen = ({ 
  initialAddress, 
  initialLocation,
  onConfirm,
  onEdit 
}) => {
  const [address, setAddress] = useState({
    street: initialAddress?.street || '',
    suburb: initialAddress?.suburb || '',
    city: initialAddress?.city || '',
    postalCode: initialAddress?.postalCode || '',
    unit: initialAddress?.unit || '',
    floor: initialAddress?.floor || '',
    deliveryInstructions: initialAddress?.deliveryInstructions || '',
  });

  const [location, setLocation] = useState(
    initialLocation || { lat: -26.1076, lng: 28.0567 } // Default to Johannesburg
  );

  const [errors, setErrors] = useState({});
  const [showAccuracyWarning, setShowAccuracyWarning] = useState(false);

  const handleInputChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    // Check if pin is too far from original address (mock check)
    // In production, calculate distance from geocoded address
    const distance = Math.random() * 100; // Mock distance in meters
    setShowAccuracyWarning(distance > 50);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!address.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!address.suburb.trim()) {
      newErrors.suburb = 'Suburb is required';
    }
    
    if (!address.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validate()) {
      onConfirm({
        ...address,
        latitude: location.lat,
        longitude: location.lng,
        location: location,
      });
    }
  };

  // Check if address might be ambiguous
  const isAmbiguous = address.street && !address.unit && address.street.toLowerCase().includes('complex');

  return (
    <Container>
      <SectionTitle>Confirm your location</SectionTitle>
      <HelperText>Drag the pin to your entrance or gate</HelperText>

      <MapSection>
        <Map
          center={location}
          zoom={15}
          onPositionChange={handleLocationChange}
          draggable={true}
          height="100%"
        />
      </MapSection>
      
      {showAccuracyWarning && (
        <AccuracyWarning>
          Pin doesn't match street. Move closer?
          <RefineButton onClick={() => setShowAccuracyWarning(false)}>
            Got it
          </RefineButton>
        </AccuracyWarning>
      )}

      <FormSection>
        <InputContainer>
          <Label>Street Address *</Label>
          <Input
            value={address.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            placeholder="123 Main Street"
            error={errors.street}
          />
          {errors.street && <HelperText style={{ color: '#C62850' }}>{errors.street}</HelperText>}
        </InputContainer>

        <Row>
          <InputContainer>
            <Label>Suburb *</Label>
            <Input
              value={address.suburb}
              onChange={(e) => handleInputChange('suburb', e.target.value)}
              placeholder="Sandton"
              error={errors.suburb}
            />
            {errors.suburb && <HelperText style={{ color: '#C62850' }}>{errors.suburb}</HelperText>}
          </InputContainer>

          <InputContainer>
            <Label>City *</Label>
            <Input
              value={address.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Johannesburg"
              error={errors.city}
            />
            {errors.city && <HelperText style={{ color: '#C62850' }}>{errors.city}</HelperText>}
          </InputContainer>
        </Row>

        <Row>
          <InputContainer>
            <Label>Unit / Apartment</Label>
            <Input
              value={address.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              placeholder="Unit 5"
            />
          </InputContainer>

          <InputContainer>
            <Label>Floor</Label>
            <Input
              value={address.floor}
              onChange={(e) => handleInputChange('floor', e.target.value)}
              placeholder="3rd Floor"
            />
          </InputContainer>
        </Row>

        <InputContainer>
          <Label>Postal Code</Label>
          <Input
            value={address.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder="2196"
          />
        </InputContainer>

        <InputContainer>
          <Label>Landmark (Optional)</Label>
          <Input
            value={address.landmark || ''}
            onChange={(e) => handleInputChange('landmark', e.target.value)}
            placeholder="Opposite ABC School, Next to petrol station"
          />
        </InputContainer>

        <InputContainer>
          <Label>Delivery Instructions</Label>
          <Input
            value={address.deliveryInstructions}
            onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
            placeholder="Gate code, entrance details, etc."
            as="textarea"
            rows={3}
          />
        </InputContainer>

        {isAmbiguous && (
          <WarningText>
            Multiple buildings share this address. Add unit number for accurate delivery.
          </WarningText>
        )}

        <ButtonGroup>
          <Button variant="primary" $fullWidth onClick={handleConfirm}>
            Confirm Location
          </Button>
          <RefineButton onClick={onEdit} style={{ alignSelf: 'center', marginTop: '8px' }}>
            Edit on map again
          </RefineButton>
        </ButtonGroup>
      </FormSection>
    </Container>
  );
};

