import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${props => props.theme.radii.lg};
  overflow: hidden;
  position: relative;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    z-index: 1;
  }
`;

// Component to handle map updates when position changes
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
}

// Custom draggable marker component
function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current && onPositionChange) {
      markerRef.current.on('dragend', () => {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onPositionChange({ lat, lng });
        }
      });
    }
  }, [onPositionChange]);

  return position ? (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      draggable={!!onPositionChange}
    />
  ) : null;
}

export const Map = ({ 
  center, 
  zoom = 13, 
  onPositionChange, 
  height = '400px',
  draggable = false 
}) => {
  if (!center) {
    return (
      <MapWrapper style={{ height }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#667085'
        }}>
          Loading map...
        </div>
      </MapWrapper>
    );
  }

  return (
    <MapWrapper style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={[center.lat, center.lng]} zoom={zoom} />
        <DraggableMarker 
          position={center} 
          onPositionChange={draggable ? onPositionChange : null}
        />
      </MapContainer>
    </MapWrapper>
  );
};











