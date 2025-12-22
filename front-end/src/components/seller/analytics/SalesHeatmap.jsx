import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  background: ${props => props.theme.colors.card.default};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border.default};
  animation: ${fadeIn} 0.4s ease-out;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const MapWrapper = styled.div`
  height: 400px;
  width: 100%;
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.md};
  position: relative;
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.5s ease-out 0.2s both;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const ColorBox = styled.div`
  width: 16px;
  height: 16px;
  border-radius: ${props => props.theme.radii.xs};
  background: ${props => props.color};
`;

const TopSuburbs = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const TopSuburbsTitle = styled.h4`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const SuburbItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.body2}
`;

const SuburbName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const SuburbStats = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
`;

const ChangeBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${props => props.theme.radii.xs};
  font-size: 11px;
  font-weight: 600;
  background: ${props => props.$isPositive ? props.theme.colors.status.successLight : props.theme.colors.status.errorLight};
  color: ${props => props.$isPositive ? props.theme.colors.status.success : props.theme.colors.status.error};
  margin-left: ${props => props.theme.spacing.xs};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
`;

const InsightBox = styled.div`
  background: ${props => props.theme.colors.info[100]};
  border-left: 3px solid ${props => props.theme.colors.info[500]};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  margin-top: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  animation: ${fadeIn} 0.4s ease-out;
  line-height: 1.6;
  
  strong {
    font-weight: 600;
    color: ${props => props.theme.colors.info[700]};
  }
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
`;

// Johannesburg center coordinates
const JHB_CENTER = [-26.2041, 28.0473];

// Mock suburb coordinates (in real app, would use actual geocoding)
const suburbCoords = {
  'Sandton': [-26.1076, 28.0567],
  'Parkmore': [-26.1000, 28.0500],
  'Bryanston': [-26.0833, 28.0333],
  'Rosebank': [-26.1467, 28.0433],
  'Melrose': [-26.1333, 28.0400],
  'Illovo': [-26.1200, 28.0300],
  'Houghton': [-26.1667, 28.0500],
  'Killarney': [-26.1500, 28.0467],
  'Randburg': [-26.0944, 28.0011],
  'Fourways': [-26.0167, 28.0167],
  'Midrand': [-25.9833, 28.1333],
  'Centurion': [-25.8603, 28.1894],
  'Pretoria': [-25.7479, 28.2293],
  'Morningside': [-26.1000, 28.0600],
  'Rivonia': [-26.0500, 28.0500]
};

const getColorForIntensity = (intensity) => {
  if (intensity > 0.7) return '#3D81EF';
  if (intensity > 0.4) return '#5C9AF2';
  if (intensity > 0.2) return '#7EC1F6';
  return '#AFCFFB';
};

const getRadiusForOrders = (orders) => {
  if (orders > 50) return 20;
  if (orders > 20) return 15;
  if (orders > 10) return 10;
  return 8;
};

export const SalesHeatmap = ({ data, sellerId }) => {
  const [selectedSuburb, setSelectedSuburb] = useState(null);

  if (!data || !data.hasData) {
    return (
      <Container>
        <Header>
          <Title>Sales Heatmap by Suburb</Title>
        </Header>
        <EmptyState>
          Not enough orders yet for location insights.
          <br />
          Your first heatmap will appear once you receive 5+ orders.
        </EmptyState>
      </Container>
    );
  }

  const { heatmap, topSuburbs } = data;

  return (
    <Container>
      <Header>
        <Title>Sales Heatmap by Suburb</Title>
      </Header>

      <MapWrapper>
        <MapContainer
          center={JHB_CENTER}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {heatmap.map((item) => {
            const coords = suburbCoords[item.suburb] || JHB_CENTER;
            return (
              <CircleMarker
                key={item.suburb}
                center={coords}
                radius={getRadiusForOrders(item.orders)}
                pathOptions={{
                  fillColor: getColorForIntensity(item.intensity),
                  fillOpacity: 0.6,
                  color: '#3D81EF',
                  weight: 2,
                  opacity: 0.8
                }}
                eventHandlers={{
                  click: () => setSelectedSuburb(item)
                }}
              >
                <Popup>
                  <div>
                    <strong>{item.suburb}</strong>
                    <br />
                    Orders: {item.orders}
                    <br />
                    Revenue: R{item.revenue.toFixed(2)}
                    <br />
                    Active Buyers: {item.activeBuyers}
                    {item.popularProduct && (
                      <>
                        <br />
                        Popular: {item.popularProduct}
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </MapWrapper>

      <Legend>
        <LegendItem>
          <ColorBox color="#AFCFFB" />
          <span>Low</span>
        </LegendItem>
        <LegendItem>
          <ColorBox color="#7EC1F6" />
          <span>Medium</span>
        </LegendItem>
        <LegendItem>
          <ColorBox color="#5C9AF2" />
          <span>High</span>
        </LegendItem>
        <LegendItem>
          <ColorBox color="#3D81EF" />
          <span>Very High</span>
        </LegendItem>
      </Legend>

      {topSuburbs && topSuburbs.length > 0 && (
        <TopSuburbs>
          <TopSuburbsTitle>Top Suburbs This Week:</TopSuburbsTitle>
          {topSuburbs.map((suburb, index) => (
            <SuburbItem key={suburb.suburb}>
              <div>
                <SuburbName>
                  {index + 1}. {suburb.suburb}
                </SuburbName>
                {suburb.change !== undefined && (
                  <ChangeBadge $isPositive={suburb.change >= 0}>
                    {suburb.change >= 0 ? '+' : ''}{suburb.change.toFixed(0)}%
                  </ChangeBadge>
                )}
              </div>
              <SuburbStats>
                {suburb.orders} orders • R{suburb.revenue.toFixed(0)}
              </SuburbStats>
            </SuburbItem>
          ))}
        </TopSuburbs>
      )}

      {data.insights && data.insights.length > 0 && (
        <InsightBox>
          <strong>Key Insights:</strong>
          <InsightsList>
            {data.insights.map((insight, index) => (
              <div key={index}>{insight}</div>
            ))}
          </InsightsList>
        </InsightBox>
      )}

      {selectedSuburb && (
        <InsightBox style={{ marginTop: '12px', background: '#F1F7FF', borderLeftColor: '#3D81EF' }}>
          <strong>{selectedSuburb.suburb}</strong>
          <br />
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>📦 Orders: <strong>{selectedSuburb.orders}</strong></div>
            <div>💰 Revenue: <strong>R{selectedSuburb.revenue.toFixed(2)}</strong></div>
            <div>👥 Active Buyers: <strong>{selectedSuburb.activeBuyers}</strong></div>
            {selectedSuburb.averageOrderValue > 0 && (
              <div>📊 Avg Order Value: <strong>R{selectedSuburb.averageOrderValue.toFixed(2)}</strong></div>
            )}
            {selectedSuburb.popularProduct && (
              <div>🔥 Popular: <strong>{selectedSuburb.popularProduct}</strong></div>
            )}
          </div>
        </InsightBox>
      )}
    </Container>
  );
};

