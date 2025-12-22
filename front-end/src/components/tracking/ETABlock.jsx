import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Block = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
  text-align: center;
`;

const Label = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ETA = styled.div`
  ${props => props.theme.typography.heading1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 32px;
  margin-bottom: ${props => props.theme.spacing.sm};
  line-height: 1.2;
`;

const UpdatingText = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 11px;
  font-style: italic;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const DetailRow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
`;

const calculateDistance = (courierLocation, userLocation) => {
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

export const ETABlock = ({ eta, courierLocation, userLocation, status }) => {
  const distance = calculateDistance(courierLocation, userLocation);
  const isDelivered = status === 'delivered';
  const isActive = ['processing', 'out_for_delivery'].includes(status);

  return (
    <Block>
      <Label>Expected Delivery</Label>
      <ETA>{isDelivered ? 'Delivered' : eta || 'Calculating...'}</ETA>
      {isActive && !isDelivered && (
        <UpdatingText>(Updating in real-time)</UpdatingText>
      )}
      
      {isActive && courierLocation && userLocation && distance && (
        <Details>
          <DetailRow>
            📍 Courier is {distance} km away from your location
          </DetailRow>
          <DetailRow>
            🚦 Traffic is moderate in your area
          </DetailRow>
          {status === 'processing' && (
            <DetailRow>
              📦 Store is finishing preparation
            </DetailRow>
          )}
        </Details>
      )}
    </Block>
  );
};











