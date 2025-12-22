import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PreviewWrapper = styled.div`
  width: 100%;
  height: ${props => props.height || '80px'};
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
  position: relative;

  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: ${props => props.theme.radii.md};
  }

  .leaflet-control-container {
    display: none;
  }
`;

export const MapPreview = ({ lat, lng, height = '80px' }) => {
  if (!lat || !lng) {
    return (
      <PreviewWrapper height={height}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: '#F2F5F9',
          color: '#98A2B3',
          fontSize: '12px'
        }}>
          No location
        </div>
      </PreviewWrapper>
    );
  }

  return (
    <PreviewWrapper height={height}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </PreviewWrapper>
  );
};

