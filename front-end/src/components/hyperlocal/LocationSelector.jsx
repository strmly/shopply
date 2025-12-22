import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

/**
 * LocationSelector Component
 * Displays user's location and allows radius control
 */
const LocationSelector = ({ 
  onLocationChange, 
  onRadiusChange, 
  initialRadius = 0,
  address = null,
}) => {
  const [selectedRadius, setSelectedRadius] = useState(initialRadius);
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Available radius tiers
  const radiusTiers = [
    { id: 0, label: 'Auto', description: 'Expands automatically' },
    { id: 1, label: 'Within 1km', radiusKm: 1 },
    { id: 2, label: 'Within 5km', radiusKm: 5 },
    { id: 3, label: 'Within 10km', radiusKm: 10 },
    { id: 4, label: 'Within 35km', radiusKm: 35 },
  ];

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(userLocation);
          if (onLocationChange) {
            onLocationChange(userLocation);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    }
  }, [onLocationChange]);

  const handleRadiusChange = (radiusId) => {
    setSelectedRadius(radiusId);
    setShowDropdown(false);
    if (onRadiusChange) {
      onRadiusChange(radiusId);
    }
  };

  const currentTier = radiusTiers.find(t => t.id === selectedRadius) || radiusTiers[0];

  return (
    <Container>
      <LocationInfo onClick={() => setShowDropdown(!showDropdown)}>
        <Icon>📍</Icon>
        <LocationText>
          <Label>Deliver to</Label>
          <Address>{address || 'Getting location...'}</Address>
        </LocationText>
        <RadiusChip>
          {currentTier.label}
          <DropdownIcon>▼</DropdownIcon>
        </RadiusChip>
      </LocationInfo>

      {showDropdown && (
        <Dropdown>
          <DropdownHeader>Search Radius</DropdownHeader>
          {radiusTiers.map((tier) => (
            <DropdownItem
              key={tier.id}
              active={tier.id === selectedRadius}
              onClick={() => handleRadiusChange(tier.id)}
            >
              <TierLabel>{tier.label}</TierLabel>
              {tier.description && <TierDesc>{tier.description}</TierDesc>}
              {tier.id === selectedRadius && <CheckIcon>✓</CheckIcon>}
            </DropdownItem>
          ))}
          <DropdownFooter>
            Auto mode expands radius until products are found (Uber-style)
          </DropdownFooter>
        </Dropdown>
      )}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${props => props.theme?.colors?.background || '#fff'};
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid ${props => props.theme?.colors?.border || '#e0e0e0'};
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme?.colors?.primary || '#007AFF'};
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
  }
`;

const Icon = styled.div`
  font-size: 20px;
`;

const LocationText = styled.div`
  flex: 1;
  min-width: 0;
`;

const Label = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Address = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#000'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RadiusChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.theme?.colors?.primaryLight || '#E3F2FD'};
  color: ${props => props.theme?.colors?.primary || '#007AFF'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const DropdownIcon = styled.span`
  font-size: 10px;
  opacity: 0.7;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
`;

const DropdownHeader = styled.div`
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  border-bottom: 1px solid #f0f0f0;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  background: ${props => props.active ? '#f8f9fa' : 'transparent'};

  &:hover {
    background: #f8f9fa;
  }
`;

const TierLabel = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme?.colors?.text || '#000'};
`;

const TierDesc = styled.div`
  font-size: 12px;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  margin-right: 8px;
`;

const CheckIcon = styled.div`
  color: ${props => props.theme?.colors?.primary || '#007AFF'};
  font-size: 16px;
  font-weight: bold;
`;

const DropdownFooter = styled.div`
  padding: 12px 16px;
  font-size: 11px;
  color: ${props => props.theme?.colors?.textSecondary || '#666'};
  background: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  line-height: 1.4;
`;

export default LocationSelector;

