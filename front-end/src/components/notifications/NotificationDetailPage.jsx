import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Content = styled.div`
  max-width: 100%;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  z-index: 100;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.primary};
  transition: ${props => props.theme.transitions.swift};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.radii.md};
  
  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const HeaderTitle = styled.h1`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${props => props.theme.spacing.lg};
  opacity: 0.5;
`;

const ErrorTitle = styled.h2`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ErrorMessage = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
`;

const RetryButton = styled.button`
  ${props => props.theme.typography.button}
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const NotificationCard = styled.div`
  background: ${props => props.theme.colors.surface};
  margin: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.radii.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border.default};
`;

const NotificationHeader = styled.div`
  padding: ${props => props.theme.spacing.xl};
  background: ${props => {
    if (props.type === 'order') return props.theme.colors.status.successLight;
    if (props.type === 'promotion') return props.theme.colors.status.warningLight;
    if (props.type === 'system') return props.theme.colors.status.infoLight;
    return props.theme.colors.primarySoftBg;
  }};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const TypeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.md};
  background: ${props => {
    if (props.type === 'order') return props.theme.colors.status.success;
    if (props.type === 'promotion') return props.theme.colors.warningBase;
    if (props.type === 'system') return props.theme.colors.info[500];
    return props.theme.colors.primary;
  }};
  color: white;
`;

const NotificationTitle = styled.h1`
  ${props => props.theme.typography.heading2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.spacing.sm};
`;

const NotificationBody = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const NotificationMessage = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MetadataSection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const MetadataTitle = styled.h3`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const MetadataContent = styled.pre`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  overflow-x: auto;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
`;

const ActionButton = styled.button`
  ${props => props.theme.typography.button}
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  margin-top: ${props => props.theme.spacing.lg};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ReadStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.sm};
  ${props => props.theme.typography.caption}
  font-weight: 600;
  background: ${props => props.$read 
    ? props.theme.colors.status.successLight 
    : props.theme.colors.status.warningLight};
  color: ${props => props.$read 
    ? props.theme.colors.status.success 
    : props.theme.colors.warningBase};
`;

const getTypeIcon = (type) => {
  const icons = {
    order: '📦',
    promotion: '🎉',
    system: '⚙️',
    info: 'ℹ️',
  };
  return icons[type] || '🔔';
};

const getTypeLabel = (type) => {
  const labels = {
    order: 'Order Update',
    promotion: 'Promotion',
    system: 'System',
    info: 'Information',
  };
  return labels[type] || 'Notification';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return formatDate(dateString);
};

import API_BASE_URL from '@config/api';

export const NotificationDetailPage = ({ location }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadNotification();
    }
  }, [id]);

  const loadNotification = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setNotification(data.data);
        
        // Mark as read if not already read
        if (!data.data.read) {
          await markAsRead(id);
        }
      } else {
        setError(data.message || 'Failed to load notification');
      }
    } catch (err) {
      console.error('Error loading notification:', err);
      setError('Failed to load notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      // Update local state
      setNotification(prev => prev ? { ...prev, read: true } : null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleActionClick = () => {
    // For order notifications, prefer navigating to tracking by orderId in metadata
    if (notification?.type === 'order' && notification?.metadata?.orderId) {
      navigate(`/tracking/${notification.metadata.orderId}`);
      return;
    }

    // Fallback: use the actionUrl if present
    if (notification?.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <HeaderTitle>Notification</HeaderTitle>
        </Header>
        <LoadingContainer>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>Loading notification...</div>
        </LoadingContainer>
        <BottomNavigation currentPath="/notifications" />
      </Container>
    );
  }

  if (error || !notification) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>←</BackButton>
          <HeaderTitle>Notification</HeaderTitle>
        </Header>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Notification Not Found</ErrorTitle>
          <ErrorMessage>
            {error || 'The notification you are looking for does not exist or has been deleted.'}
          </ErrorMessage>
          <RetryButton onClick={loadNotification}>Try Again</RetryButton>
        </ErrorContainer>
        <BottomNavigation currentPath="/notifications" />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>←</BackButton>
        <HeaderTitle>Notification Details</HeaderTitle>
      </Header>
      
      <Content>
        <NotificationCard>
          <NotificationHeader type={notification.type}>
            <TypeBadge type={notification.type}>
              {getTypeIcon(notification.type)} {getTypeLabel(notification.type)}
            </TypeBadge>
            <NotificationTitle>{notification.title}</NotificationTitle>
            <NotificationMeta>
              <ReadStatus $read={notification.read}>
                {notification.read ? '✓ Read' : '● Unread'}
              </ReadStatus>
              <span>•</span>
              <span>{formatRelativeTime(notification.createdAt)}</span>
              <span>•</span>
              <span>{formatDate(notification.createdAt)}</span>
            </NotificationMeta>
          </NotificationHeader>
          
          <NotificationBody>
            <NotificationMessage>{notification.message}</NotificationMessage>
            
            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
              <MetadataSection>
                <MetadataTitle>Additional Information</MetadataTitle>
                <MetadataContent>
                  {JSON.stringify(notification.metadata, null, 2)}
                </MetadataContent>
              </MetadataSection>
            )}
            
            {notification.actionUrl && (
              <ActionButton onClick={handleActionClick}>
                {notification.type === 'order' ? 'View Order' :
                 notification.type === 'promotion' ? 'View Deal' :
                 'Take Action'}
              </ActionButton>
            )}
          </NotificationBody>
        </NotificationCard>
      </Content>
      
      <BottomNavigation currentPath="/notifications" />
    </Container>
  );
};


