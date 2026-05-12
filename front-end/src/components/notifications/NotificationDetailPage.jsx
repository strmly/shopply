import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import API_BASE_URL from '@config/api';

const Container = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(180deg, #ffffff 0%, #ffffff 52%, #F8FAFC 100%);
  animation: ${fadeIn} 0.3s ease-in;
  padding-bottom: 100px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 12px min(5vw, 48px);
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(228, 231, 236, 0.72);
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.07);
  backdrop-filter: blur(18px);
`;

const HeaderInner = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(228, 231, 236, 0.9);
  background: #ffffff;
  color: ${props => props.theme.colors.text.primary};
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 22px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const HeaderCopy = styled.div`
  min-width: 0;
  display: grid;
  gap: 3px;
`;

const HeaderEyebrow = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.primarySoftText};
  font-weight: 900;
  text-transform: uppercase;
`;

const HeaderTitle = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 21px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0;
`;

const Content = styled.main`
  max-width: 920px;
  margin: 0 auto;
  padding: 28px min(5vw, 48px);
`;

const StateCard = styled.div`
  min-height: 420px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 42px 24px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.2), rgba(228, 231, 236, 0.86), rgba(245, 158, 11, 0.14)) border-box;
  border: 1px solid transparent;
  border-radius: 30px;
  box-shadow: 0 24px 58px rgba(16, 24, 40, 0.09);
`;

const StateStack = styled.div`
  display: grid;
  justify-items: center;
  gap: 12px;
`;

const StateIcon = styled.div`
  width: 78px;
  height: 78px;
  display: grid;
  place-items: center;
  border-radius: 26px;
  background: ${props => props.$tone === 'warning' ? props.theme.colors.status.warningLight : props.theme.colors.gradient.soft};
  color: ${props => props.$tone === 'warning' ? props.theme.colors.warningBase : props.theme.colors.primary};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 24px;
  font-weight: 900;
  box-shadow: 0 18px 34px rgba(61, 129, 239, 0.14);
`;

const StateTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: 26px;
  font-weight: 900;
`;

const StateMessage = styled.p`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.secondary};
  max-width: 460px;
  margin: 0;
`;

const RetryButton = styled.button`
  margin-top: 8px;
  min-height: 48px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  color: ${props => props.theme.colors.text.inverse};
  cursor: pointer;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 16px 30px rgba(16, 24, 40, 0.16);

  &:hover {
    background: ${props => props.theme.colors.gradient.primary};
    transform: translateY(-1px);
  }
`;

const NotificationCard = styled.article`
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96)) padding-box,
    linear-gradient(140deg, rgba(61, 129, 239, 0.24), rgba(228, 231, 236, 0.86), rgba(245, 158, 11, 0.16)) border-box;
  border: 1px solid transparent;
  border-radius: 32px;
  box-shadow:
    0 28px 70px rgba(16, 24, 40, 0.11),
    inset 0 1px 0 rgba(255,255,255,0.9);
`;

const NotificationHero = styled.div`
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  padding: 28px;
  background:
    linear-gradient(135deg, rgba(61, 129, 239, 0.08), rgba(255,255,255,0) 48%, rgba(245, 158, 11, 0.09)),
    #ffffff;
  border-bottom: 1px solid rgba(228, 231, 236, 0.72);

  &::after {
    content: '';
    position: absolute;
    right: -52px;
    top: -62px;
    width: 168px;
    height: 168px;
    border-radius: 999px;
    background: rgba(61, 129, 239, 0.07);
    pointer-events: none;
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
    padding: 22px;
  }
`;

const TypeMark = styled.div`
  position: relative;
  z-index: 1;
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border-radius: 24px;
  background: ${props => {
    if (props.$type === 'order') return props.theme.colors.status.successLight;
    if (props.$type === 'promotion') return props.theme.colors.status.warningLight;
    if (props.$type === 'system') return props.theme.colors.status.infoLight;
    return props.theme.colors.gradient.soft;
  }};
  color: ${props => {
    if (props.$type === 'order') return props.theme.colors.status.success;
    if (props.$type === 'promotion') return props.theme.colors.warningBase;
    if (props.$type === 'system') return props.theme.colors.info[500];
    return props.theme.colors.primary;
  }};
  border: 1px solid rgba(255,255,255,0.8);
  font-size: 19px;
  font-weight: 900;
  box-shadow: 0 18px 34px rgba(16, 24, 40, 0.08);
`;

const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
`;

const TopLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 7px 10px;
  border-radius: 999px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.22);
  font-size: 12px;
  font-weight: 900;
`;

const ReadStatus = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 7px 10px;
  border-radius: 999px;
  background: ${props => props.$read ? props.theme.colors.status.successLight : props.theme.colors.status.warningLight};
  color: ${props => props.$read ? props.theme.colors.status.success : props.theme.colors.warningBase};
  border: 1px solid rgba(228, 231, 236, 0.78);
  font-size: 12px;
  font-weight: 900;
`;

const NotificationTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: clamp(30px, 6vw, 52px);
  line-height: 0.98;
  font-weight: 900;
  letter-spacing: 0;
`;

const NotificationMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const MetaPill = styled.span`
  ${props => props.theme.typography.caption}
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.86);
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 900;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
`;

const NotificationBody = styled.div`
  padding: 28px;

  @media (max-width: 620px) {
    padding: 22px;
  }
`;

const MessagePanel = styled.div`
  padding: 22px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.76);
  box-shadow: 0 14px 30px rgba(16, 24, 40, 0.04);
`;

const NotificationMessage = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.65;
  white-space: pre-wrap;
  font-weight: 600;
`;

const ActionButton = styled.button`
  width: 100%;
  min-height: 54px;
  margin-top: 22px;
  padding: 0 20px;
  background:
    linear-gradient(${props => props.theme.colors.text.primary}, ${props => props.theme.colors.text.primary}) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.48), rgba(245, 158, 11, 0.24), rgba(255,255,255,0.84)) border-box;
  color: ${props => props.theme.colors.text.inverse};
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 900;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 18px 34px rgba(16, 24, 40, 0.16);

  &:hover {
    background:
      linear-gradient(${props => props.theme.colors.primary}, ${props => props.theme.colors.primary}) padding-box,
      linear-gradient(135deg, rgba(61, 129, 239, 0.5), rgba(245, 158, 11, 0.3), rgba(255,255,255,0.86)) border-box;
    transform: translateY(-2px);
    box-shadow: 0 24px 48px rgba(16, 24, 40, 0.18);
  }
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
      setNotification(prev => prev ? { ...prev, read: true } : null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleActionClick = () => {
    if (notification?.type === 'order' && notification?.metadata?.orderId) {
      navigate(`/tracking/${notification.metadata.orderId}`);
      return;
    }

    if (notification?.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <HeaderInner>
            <BackButton onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
            <HeaderCopy>
              <HeaderEyebrow>Tsenga</HeaderEyebrow>
              <HeaderTitle>Notification</HeaderTitle>
            </HeaderCopy>
          </HeaderInner>
        </Header>
        <Content>
          <StateCard>
            <StateStack>
              <StateIcon>N</StateIcon>
              <StateTitle>Loading notification</StateTitle>
              <StateMessage>Fetching the latest details for this update.</StateMessage>
            </StateStack>
          </StateCard>
        </Content>
        <BottomNavigation currentPath="/notifications" />
      </Container>
    );
  }

  if (error || !notification) {
    return (
      <Container>
        <Header>
          <HeaderInner>
            <BackButton onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
            <HeaderCopy>
              <HeaderEyebrow>Tsenga</HeaderEyebrow>
              <HeaderTitle>Notification</HeaderTitle>
            </HeaderCopy>
          </HeaderInner>
        </Header>
        <Content>
          <StateCard>
            <StateStack>
              <StateIcon $tone="warning">!</StateIcon>
              <StateTitle>Notification Not Found</StateTitle>
              <StateMessage>
                {error || 'The notification you are looking for does not exist or has been deleted.'}
              </StateMessage>
              <RetryButton onClick={loadNotification}>Try Again</RetryButton>
            </StateStack>
          </StateCard>
        </Content>
        <BottomNavigation currentPath="/notifications" />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderInner>
          <BackButton onClick={() => navigate(-1)} aria-label="Go back">&lt;</BackButton>
          <HeaderCopy>
            <HeaderEyebrow>Tsenga</HeaderEyebrow>
            <HeaderTitle>Notification Details</HeaderTitle>
          </HeaderCopy>
        </HeaderInner>
      </Header>

      <Content>
        <NotificationCard>
          <NotificationHero>
            <TypeMark $type={notification.type}>{getTypeInitial(notification.type)}</TypeMark>
            <HeroCopy>
              <TopLine>
                <TypeBadge>{getTypeLabel(notification.type)}</TypeBadge>
                <ReadStatus $read={notification.read}>
                  {notification.read ? 'Read' : 'Unread'}
                </ReadStatus>
              </TopLine>
              <NotificationTitle>{notification.title}</NotificationTitle>
              <NotificationMeta>
                <MetaPill>{formatRelativeTime(notification.createdAt)}</MetaPill>
                <MetaPill>{formatDate(notification.createdAt)}</MetaPill>
              </NotificationMeta>
            </HeroCopy>
          </NotificationHero>

          <NotificationBody>
            <MessagePanel>
              <NotificationMessage>{notification.message}</NotificationMessage>
            </MessagePanel>

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
