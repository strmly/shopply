import { useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { CourierMap } from './CourierMap';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const CourierInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const CourierPhoto = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
`;

const CourierDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CourierName = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const CourierMeta = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const VehicleInfo = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  margin-top: 4px;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 200px;
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
  background: ${props => props.theme.colors.surface};
  margin-top: ${props => props.theme.spacing.md};
`;

export const CourierBlock = ({ courier, courierLocation, userLocation, orderId }) => {
  const [showMap, setShowMap] = useState(true);

  if (!courier) {
    return null;
  }

  return (
    <Card>
      <CourierInfo>
        <CourierPhoto>🛵</CourierPhoto>
        <CourierDetails>
          <CourierName>
            {courier.name} (Courier)
          </CourierName>
          <CourierMeta>
            <span>⭐ {courier.rating}</span>
            <span>•</span>
            <span>{courier.deliveryCount} deliveries</span>
          </CourierMeta>
          {courier.vehicle && (
            <VehicleInfo>
              Vehicle: {courier.vehicle} — {courier.vehicleColor}
            </VehicleInfo>
          )}
        </CourierDetails>
      </CourierInfo>

      {showMap && courierLocation && userLocation && (
        <MapContainer>
          <CourierMap
            courierLocation={courierLocation}
            userLocation={userLocation}
            orderId={orderId}
          />
        </MapContainer>
      )}
    </Card>
  );
};











