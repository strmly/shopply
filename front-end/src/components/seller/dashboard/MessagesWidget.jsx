import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../../theme/animations';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.theme.colors.border.light};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.4s ease-out;
  position: relative;
  box-shadow: ${props => props.theme.shadows.sm};

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.lg};
    transform: translateY(-2px);
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
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const UnreadBadge = styled.div`
  background: ${props => props.theme.colors.dangerBase};
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => props.theme.typography.caption}
  font-weight: 700;
  font-size: 11px;
  animation: ${props => props.$pulse ? pulse : 'none'} 2s ease-in-out infinite;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const MessageItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.md};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const CustomerName = styled.div`
  ${props => props.theme.typography.body2}
  font-weight: 600;
  font-size: 13px;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2px;
`;

const MessagePreview = styled.div`
  ${props => props.theme.typography.caption}
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const Timestamp = styled.div`
  ${props => props.theme.typography.caption}
  font-size: 11px;
  color: ${props => props.theme.colors.text.tertiary};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  ${props => props.theme.typography.body2}
  font-size: 14px;
`;

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffMinutes = Math.floor((now - messageTime) / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const MessagesWidget = ({ 
  messages = { unreadCount: 0, messages: [] },
  onViewMessages 
}) => {
  const navigate = useNavigate();
  const [pulse, setPulse] = useState(false);
  const [prevUnreadCount, setPrevUnreadCount] = useState(messages.unreadCount);

  useEffect(() => {
    if (messages.unreadCount > prevUnreadCount) {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    }
    setPrevUnreadCount(messages.unreadCount);
  }, [messages.unreadCount, prevUnreadCount]);

  const handleClick = () => {
    if (onViewMessages) {
      onViewMessages();
    } else {
      navigate('/seller/messages');
    }
  };

  const { unreadCount, messages: messageList } = messages;
  const displayMessages = messageList.slice(0, 2); // Show max 2 messages

  return (
    <Container 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Messages: ${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}. Click to view messages.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Header>
        <Title>
          💬 Messages
          {unreadCount > 0 && (
            <UnreadBadge 
              $pulse={pulse}
              aria-label={`${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}`}
            >
              {unreadCount}
            </UnreadBadge>
          )}
        </Title>
      </Header>

      {unreadCount === 0 && messageList.length === 0 ? (
        <EmptyState>
          You have no new messages.
        </EmptyState>
      ) : (
        <>
          {unreadCount > 0 && (
            <div style={{
              marginBottom: '12px',
              fontSize: '13px',
              color: '#667085',
              fontWeight: 500,
            }}>
              {unreadCount} new buyer message{unreadCount !== 1 ? 's' : ''}
            </div>
          )}

          <MessageList>
            {displayMessages.map((message) => (
              <MessageItem key={message.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <CustomerName>{message.customerName}</CustomerName>
                  <MessagePreview>"{message.preview}"</MessagePreview>
                </div>
                <Timestamp>{formatTimeAgo(message.timestamp)}</Timestamp>
              </MessageItem>
            ))}
          </MessageList>
        </>
      )}
    </Container>
  );
};
