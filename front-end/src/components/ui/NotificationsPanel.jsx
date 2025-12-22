import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn 0.2s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: 1001;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.secondary};
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    color: ${props => props.theme.colors.text.primary};
    transform: scale(1.1);
  }
`;

const ActionsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const MarkAllReadButton = styled.button`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primary};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.sm};
  transition: ${props => props.theme.transitions.swift};
  
  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.sm};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
  opacity: 0.5;
`;

const EmptyText = styled.p`
  ${props => props.theme.typography.body1}
  margin: 0;
`;

const NotificationItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xs};
  background: ${props => props.$read ? props.theme.colors.background : props.theme.colors.primarySoftBg};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.$read ? props.theme.colors.border.light : props.theme.colors.primary};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  position: relative;
  
  &:hover {
    background: ${props => props.theme.colors.surface};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  ${props => !props.$read && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: ${props.theme.colors.primary};
      border-radius: ${props.theme.radii.xs} 0 0 ${props.theme.radii.xs};
    }
  `}
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const NotificationTitle = styled.h3`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const NotificationTime = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  white-space: nowrap;
`;

const NotificationMessage = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const NotificationType = styled.span`
  display: inline-block;
  margin-top: ${props => props.theme.spacing.xs};
  ${props => props.theme.typography.caption}
  padding: 2px 8px;
  border-radius: ${props => props.theme.radii.xs};
  background: ${props => {
    const type = props.type;
    if (type === 'order') return props.theme.colors.status.successLight;
    if (type === 'promotion') return props.theme.colors.status.warningLight;
    if (type === 'system') return props.theme.colors.status.infoLight;
    return props.theme.colors.surface;
  }};
  color: ${props => {
    const type = props.type;
    if (type === 'order') return props.theme.colors.status.success;
    if (type === 'promotion') return props.theme.colors.warningBase;
    if (type === 'system') return props.theme.colors.info[500];
    return props.theme.colors.text.secondary;
  }};
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.text.secondary};
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

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const NotificationsPanel = ({ isOpen, onClose, userId = 'default', apiBaseUrl = 'http://localhost:5000/api' }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/notifications/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications/user/${userId}/count`);
      const data = await response.json();
      
      if (data.success) {
        setUnreadCount(data.data?.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      try {
        await fetch(`${apiBaseUrl}/notifications/${notification.id}/read`, {
          method: 'PUT',
        });
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to notification detail page
    onClose();
    navigate(`/notifications/${notification.id}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${apiBaseUrl}/notifications/user/${userId}/read-all`, {
        method: 'PUT',
      });
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (!isOpen) return null;

  const hasUnread = notifications.some(n => !n.read);

  return (
    <>
      <Overlay onClick={onClose} />
      <Panel>
        <Header>
          <Title>Notifications</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        
        {notifications.length > 0 && (
          <ActionsBar>
            <MarkAllReadButton 
              onClick={handleMarkAllRead}
              disabled={!hasUnread}
            >
              Mark all as read
            </MarkAllReadButton>
            {unreadCount > 0 && (
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-secondary, #667085)' 
              }}>
                {unreadCount} unread
              </span>
            )}
          </ActionsBar>
        )}

        <NotificationsList>
          {loading ? (
            <LoadingState>Loading notifications...</LoadingState>
          ) : notifications.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🔔</EmptyIcon>
              <EmptyText>No notifications yet</EmptyText>
            </EmptyState>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                $read={notification.read}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationHeader>
                  <NotificationTitle>
                    {getTypeIcon(notification.type)} {notification.title}
                  </NotificationTitle>
                  <NotificationTime>
                    {formatTime(notification.createdAt)}
                  </NotificationTime>
                </NotificationHeader>
                <NotificationMessage>{notification.message}</NotificationMessage>
                <NotificationType type={notification.type}>
                  {notification.type}
                </NotificationType>
              </NotificationItem>
            ))
          )}
        </NotificationsList>
      </Panel>
    </>
  );
};

