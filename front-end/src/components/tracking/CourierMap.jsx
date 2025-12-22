import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #f5f5f5;
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  gap: 8px;
`;

const MapInfo = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  font-size: 11px;
  font-weight: 600;
  box-shadow: ${props => props.theme.shadows.sm};
  z-index: 10;
`;

// Simple map visualization using divs (in production, use Leaflet or Google Maps)
export const CourierMap = ({ courierLocation, userLocation, orderId }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // In production, initialize a real map library here (Leaflet, Google Maps, etc.)
    // For now, we'll use a placeholder
  }, [courierLocation, userLocation]);

  const calculateDistance = () => {
    if (!courierLocation || !userLocation) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (courierLocation.lat - userLocation.lat) * Math.PI / 180;
    const dLng = (courierLocation.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(courierLocation.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1);
  };

  const distance = calculateDistance();

  return (
    <MapWrapper ref={mapRef}>
      <MapInfo>
        {distance ? `Courier is ${distance} km away` : 'Tracking courier location...'}
      </MapInfo>
      <MapPlaceholder>
        <div style={{ fontSize: '32px' }}>🗺️</div>
        <div>Live Map View</div>
        <div style={{ fontSize: '11px', opacity: 0.8 }}>
          {distance ? `${distance} km from your location` : 'Loading...'}
        </div>
      </MapPlaceholder>
    </MapWrapper>
  );
};











