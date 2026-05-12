import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { TrackingHeader } from './TrackingHeader';
import { StatusBanner } from './StatusBanner';
import { ETABlock } from './ETABlock';
import { ProgressBar } from './ProgressBar';
import { CourierBlock } from './CourierBlock';
import { OrderContentsPreview } from './OrderContentsPreview';
import { StoreInformationBlocks } from './StoreInformationBlocks';
import { FulfillmentTimeline } from './FulfillmentTimeline';
import { IssueNotifications } from './IssueNotifications';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: ${props => props.theme.spacing.xl};
`;

const Content = styled.div`
  max-width: 100%;
  padding: 0 ${props => props.theme.spacing.lg};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
`;

import API_BASE_URL from '@config/api';

export const OrderTrackingPage = ({ location }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courierLocation, setCourierLocation] = useState(null);

  useEffect(() => {
    if (orderId) {
      loadTracking();
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        loadTracking();
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [orderId, location]);

  const loadTracking = async () => {
    try {
      setLoading(true);
      const locationParam = location ? encodeURIComponent(JSON.stringify(location)) : '';
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}?location=${locationParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setTracking(data.data);
        setCourierLocation(data.data.courierLocation);
      }
    } catch (error) {
      console.error('Error loading tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !tracking) {
    return (
      <Container>
        <TrackingHeader orderId={orderId} onClose={() => navigate(-1)} />
        <LoadingContainer>Loading order tracking...</LoadingContainer>
      </Container>
    );
  }

  if (!tracking) {
    return (
      <Container>
        <TrackingHeader orderId={orderId} onClose={() => navigate(-1)} />
        <Content>
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ marginBottom: '24px', color: '#666' }}>Order not found</p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Go Home
            </button>
          </div>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <TrackingHeader orderId={orderId} onClose={() => navigate(-1)} />
      
      <Content>
        <StatusBanner 
          status={tracking.status} 
          currentStage={tracking.currentStage}
        />
        
        <ETABlock 
          eta={tracking.eta}
          courierLocation={courierLocation}
          userLocation={location}
          status={tracking.status}
        />
        
        <ProgressBar 
          currentStage={tracking.currentStage}
          status={tracking.status}
        />
        
        {tracking.courier && tracking.status !== 'pending' && (
          <CourierBlock 
            courier={tracking.courier}
            courierLocation={courierLocation}
            userLocation={location}
            orderId={orderId}
          />
        )}
        
        <OrderContentsPreview 
          items={tracking.storeGroups}
        />
        
        {tracking.storeStatuses && tracking.storeStatuses.length > 0 && (
          <StoreInformationBlocks 
            storeStatuses={tracking.storeStatuses}
          />
        )}
        
        <FulfillmentTimeline 
          timeline={tracking.timeline}
        />
        
        {tracking.issues && tracking.issues.length > 0 && (
          <IssueNotifications 
            issues={tracking.issues}
          />
        )}
        
      </Content>
    </Container>
  );
};











