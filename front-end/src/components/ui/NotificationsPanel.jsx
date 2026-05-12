import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { API_BASE_URL } from '../../config/api.js';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 82% 18%, rgba(61, 129, 239, 0.16), transparent 32%),
    rgba(15, 23, 42, 0.42);
  z-index: 1000;
  animation: fadeIn 0.2s ease-in;
  backdrop-filter: blur(8px);

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Panel = styled.div`
  position: fixed;
  top: 12px;
  right: 12px;
  bottom: 12px;
  width: min(430px, calc(100vw - 24px));
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.78);
  border-radius: 28px;
  box-shadow:
    0 28px 70px rgba(16, 24, 40, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { transform: translateX(calc(100% + 24px)); }
    to { transform: translateX(0); }
  }

  @media (max-width: 560px) {
    top: 8px;
    right: 8px;
    bottom: 8px;
    width: calc(100vw - 16px);
    border-radius: 24px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 18px;
  border-bottom: 1px solid rgba(228, 231, 236, 0.72);
  background:
    linear-gradient(135deg, rgba(61, 129, 239, 0.08), rgba(255, 255, 255, 0) 46%, rgba(245, 158, 11, 0.08)),
    rgba(255, 255, 255, 0.9);
`;

const TitleBlock = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

const Title = styled.h2`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  font-weight: 800;
`;

const CloseButton = styled.button`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.9);
  border-radius: 999px;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);

  &:hover {
    color: ${props => props.theme.colors.primary};
    border-color: rgba(61, 129, 239, 0.28);
    transform: translateY(-1px);
  }
`;

const ActionsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(228, 231, 236, 0.64);
  background: rgba(255, 255, 255, 0.72);
`;

const MarkAllReadButton = styled.button`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  background: ${props => props.theme.colors.gradient.soft};
  border: 1px solid rgba(61, 129, 239, 0.22);
  cursor: pointer;
  padding: 9px 12px;
  border-radius: 999px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 10px 20px rgba(61, 129, 239, 0.09);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(61, 129, 239, 0.14);
  }

  &:disabled {
    opacity: 0.52;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const UnreadPill = styled.span`
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.86);
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
`;

const NotificationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  padding: 44px 24px;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  margin-bottom: 18px;
  background: ${props => props.theme.colors.gradient.soft};
  color: ${props => props.theme.colors.primary};
  border: 1px solid rgba(61, 129, 239, 0.18);
  box-shadow: 0 18px 34px rgba(61, 129, 239, 0.14);

  &::before {
    content: '';
    width: 24px;
    height: 27px;
    border: 2px solid currentColor;
    border-radius: 14px 14px 10px 10px;
    box-shadow: 0 9px 0 -6px currentColor;
  }
`;

const EmptyText = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-weight: 900;
`;

const NotificationItem = styled.div`
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
  margin-bottom: 10px;
  background:
    ${props => props.$read
      ? 'linear-gradient(180deg, #ffffff, rgba(248, 250, 252, 0.86))'
      : `linear-gradient(135deg, ${props.theme.colors.primarySoftBg}, #ffffff 58%)`};
  border-radius: 20px;
  border: 1px solid ${props => props.$read ? 'rgba(228, 231, 236, 0.78)' : 'rgba(61, 129, 239, 0.28)'};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  position: relative;
  box-shadow: ${props => props.$read ? '0 10px 22px rgba(16, 24, 40, 0.04)' : '0 16px 34px rgba(61, 129, 239, 0.11)'};
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(61, 129, 239, 0.32);
    box-shadow: 0 20px 42px rgba(16, 24, 40, 0.1);
  }

  ${props => !props.$read && `
    &::before {
      content: '';
      position: absolute;
      top: 13px;
      right: 13px;
      width: 9px;
      height: 9px;
      background: ${props.theme.colors.primary};
      border-radius: 999px;
      box-shadow: 0 0 0 5px rgba(61, 129, 239, 0.12);
    }
  `}
`;

const TypeMark = styled.span`
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: ${props => {
    const type = props.$type;
    if (type === 'order') return props.theme.colors.status.successLight;
    if (type === 'promotion') return props.theme.colors.status.warningLight;
    if (type === 'system') return props.theme.colors.status.infoLight;
    return props.theme.colors.gradient.soft;
  }};
  color: ${props => {
    const type = props.$type;
    if (type === 'order') return props.theme.colors.status.success;
    if (type === 'promotion') return props.theme.colors.warningBase;
    if (type === 'system') return props.theme.colors.info[500];
    return props.theme.colors.primary;
  }};
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
`;

const NotificationContent = styled.div`
  min-width: 0;
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
  padding-right: 10px;
`;

const NotificationTitle = styled.h3`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  flex: 1;
  font-weight: 900;
  line-height: 1.3;
`;

const NotificationTime = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  white-space: nowrap;
  font-weight: 800;
`;

const NotificationMessage = styled.p`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  line-height: 1.45;
`;

const NotificationType = styled.span`
  display: inline-flex;
  align-items: center;
  margin-top: 10px;
  ${props => props.theme.typography.caption}
  padding: 5px 9px;
  border-radius: 999px;
  font-weight: 900;
  text-transform: capitalize;
  background: ${props => {
    const type = props.$type;
    if (type === 'order') return props.theme.colors.status.successLight;
    if (type === 'promotion') return props.theme.colors.status.warningLight;
    if (type === 'system') return props.theme.colors.status.infoLight;
    return props.theme.colors.surface;
  }};
  color: ${props => {
    const type = props.$type;
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
  min-height: 320px;
  padding: 44px 24px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 900;
`;

const getTypeInitial = (type) => {
  const labels = {
    order: 'O',
    promotion: 'P',
    system: 'S',
    info: 'I',
  };
  return labels[type] || 'N';
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

export const NotificationsPanel = ({ isOpen, onClose, userId = 'default', apiBaseUrl = null }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Use provided apiBaseUrl or fall back to centralized config
  const baseUrl = apiBaseUrl || API_BASE_URL;

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/notifications/user/${userId}`);
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
      const response = await fetch(`${baseUrl}/notifications/user/${userId}/count`);
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
        await fetch(`${baseUrl}/notifications/${notification.id}/read`, {
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
      await fetch(`${baseUrl}/notifications/user/${userId}/read-all`, {
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
          <TitleBlock>
            <Title>Notifications</Title>
            <Subtitle>Fresh updates from nearby stores and orders</Subtitle>
          </TitleBlock>
          <CloseButton onClick={onClose} aria-label="Close notifications">x</CloseButton>
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
              <UnreadPill>
                {unreadCount} unread
              </UnreadPill>
            )}
          </ActionsBar>
        )}

        <NotificationsList>
          {loading ? (
            <LoadingState>Loading notifications...</LoadingState>
          ) : notifications.length === 0 ? (
            <EmptyState>
              <EmptyIcon aria-hidden="true" />
              <EmptyText>No notifications yet</EmptyText>
            </EmptyState>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                $read={notification.read}
                onClick={() => handleNotificationClick(notification)}
              >
                <TypeMark $type={notification.type}>{getTypeInitial(notification.type)}</TypeMark>
                <NotificationContent>
                  <NotificationHeader>
                    <NotificationTitle>
                      {notification.title}
                    </NotificationTitle>
                    <NotificationTime>
                      {formatTime(notification.createdAt)}
                    </NotificationTime>
                  </NotificationHeader>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                  <NotificationType $type={notification.type}>
                    {notification.type}
                  </NotificationType>
                </NotificationContent>
              </NotificationItem>
            ))
          )}
        </NotificationsList>
      </Panel>
    </>
  );
};
