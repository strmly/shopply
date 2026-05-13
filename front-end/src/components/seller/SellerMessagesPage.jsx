import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';
import { BottomNavigation } from '../home/BottomNavigation';
import API_BASE_URL from '@config/api';

const Page = styled.div`
  min-height: 100vh;
  padding-bottom: 120px;
  background:
    linear-gradient(180deg, rgba(241, 247, 255, 0.96) 0%, #ffffff 42%, rgba(243, 240, 254, 0.58) 100%);
  animation: ${fadeIn} 0.3s ease-in;
`;

const Shell = styled.main`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: clamp(18px, 4vw, 42px) 0 0;
  display: grid;
  gap: 18px;

  @media (max-width: 520px) {
    width: min(100% - 22px, 1180px);
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: clamp(20px, 4vw, 30px);
  border-radius: 30px;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(135deg, rgba(61, 129, 239, 0.34), rgba(196, 184, 252, 0.3), rgba(255,255,255,0.7)) border-box;
  border: 1px solid transparent;
  box-shadow: 0 24px 58px rgba(16, 24, 40, 0.1);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }
`;

const Eyebrow = styled.div`
  width: fit-content;
  padding: 8px 12px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: ${props => props.theme.colors.primarySoftBg};
  color: ${props => props.theme.colors.primarySoftText};
  border: 1px solid rgba(61, 129, 239, 0.18);
  font-size: 12px;
  font-weight: 950;
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 950;
  font-size: clamp(32px, 6vw, 56px);
  line-height: 1;
  letter-spacing: 0;
`;

const Subtitle = styled.p`
  margin: 12px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.55;
  font-weight: 700;
  max-width: 620px;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;

  @media (max-width: 760px) {
    justify-content: flex-start;
  }
`;

const Button = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(61, 129, 239, 0.2)'};
  background: ${props => props.$primary ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$primary ? '#ffffff' : props.theme.colors.primary};
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: ${props => props.$primary ? '0 16px 30px rgba(61, 129, 239, 0.22)' : '0 10px 22px rgba(16, 24, 40, 0.06)'};
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
  }
`;

const Layout = styled.section`
  display: grid;
  grid-template-columns: minmax(280px, 0.42fr) minmax(0, 0.58fr);
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  min-width: 0;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(228, 231, 236, 0.92);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
  overflow: hidden;
`;

const SearchBar = styled.input`
  width: 100%;
  min-height: 50px;
  border: 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  padding: 0 16px;
  outline: none;
  font-size: 14px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.gradient.soft};
`;

const ConversationButton = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : '#ffffff'};
  text-align: left;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: ${props => props.$unread ? props.theme.colors.gradient.primary : props.theme.colors.gradient.soft};
  color: ${props => props.$unread ? '#ffffff' : props.theme.colors.primary};
  font-weight: 950;
  box-shadow: 0 10px 24px rgba(61, 129, 239, 0.14);
`;

const ConversationMeta = styled.div`
  min-width: 0;
`;

const Name = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 950;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Preview = styled.div`
  margin-top: 3px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: ${props => props.$unread ? props.theme.colors.dangerBase : props.theme.colors.neutral[50]};
  color: ${props => props.$unread ? '#ffffff' : props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 950;
`;

const ThreadHeader = styled.div`
  padding: 18px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ProductText = styled.div`
  margin-top: 4px;
  color: ${props => props.theme.colors.primary};
  font-size: 12px;
  font-weight: 900;
`;

const ThreadBody = styled.div`
  min-height: 360px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background:
    linear-gradient(180deg, rgba(241, 247, 255, 0.52), rgba(255,255,255,0.96));
`;

const Bubble = styled.div`
  max-width: min(460px, 88%);
  align-self: ${props => props.$seller ? 'flex-end' : 'flex-start'};
  padding: 12px 14px;
  border-radius: ${props => props.$seller ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${props => props.$seller ? props.theme.colors.gradient.primary : '#ffffff'};
  color: ${props => props.$seller ? '#ffffff' : props.theme.colors.text.primary};
  box-shadow: 0 12px 26px rgba(16, 24, 40, 0.08);
  font-size: 14px;
  line-height: 1.45;
  font-weight: 750;
`;

const Composer = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  padding: 14px;
  border-top: 1px solid ${props => props.theme.colors.border.light};
  background: #ffffff;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 52px;
  resize: vertical;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: 18px;
  padding: 14px;
  outline: none;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 750;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 4px ${props => props.theme.colors.primarySoftBg};
  }
`;

const EmptyState = styled.div`
  padding: 32px;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
`;

const formatTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const getInitials = (name = '') => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0])
  .join('')
  .toUpperCase() || 'C';

export const SellerMessagesPage = () => {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem('sellerId') || '1';
  const [messages, setMessages] = useState({ unreadCount: 0, messages: [] });
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/${sellerId}/messages`);
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Could not load messages');
    }
    setMessages(json.data);
    setActiveId(current => current || json.data.messages?.[0]?.id || null);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadMessages()
      .catch(() => {
        if (mounted) setMessages({ unreadCount: 0, messages: [] });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [sellerId]);

  const filteredMessages = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return messages.messages || [];
    return (messages.messages || []).filter(message => (
      message.customerName?.toLowerCase().includes(term) ||
      message.preview?.toLowerCase().includes(term) ||
      message.productName?.toLowerCase().includes(term)
    ));
  }, [messages.messages, query]);

  const activeMessage = useMemo(() => (
    (messages.messages || []).find(message => message.id === activeId) || filteredMessages[0] || null
  ), [activeId, filteredMessages, messages.messages]);

  const markRead = async (messageId) => {
    setActiveId(messageId);
    await fetch(`${API_BASE_URL}/dashboard/${sellerId}/messages/${messageId}/read`, {
      method: 'POST',
    });
    await loadMessages();
  };

  const markAllRead = async () => {
    await fetch(`${API_BASE_URL}/dashboard/${sellerId}/messages/read-all`, {
      method: 'POST',
    });
    await loadMessages();
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!activeMessage || !reply.trim()) return;

    setSending(true);
    const response = await fetch(`${API_BASE_URL}/dashboard/${sellerId}/messages/${activeMessage.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: reply }),
    });
    const json = await response.json();
    if (response.ok && json.success) {
      setMessages(json.data);
      setReply('');
    }
    setSending(false);
  };

  return (
    <Page>
      <Shell>
        <Hero>
          <div>
            <Eyebrow>{messages.unreadCount} unread buyer messages</Eyebrow>
            <Title>Seller Messages</Title>
            <Subtitle>Reply to buyer questions, keep order conversations warm, and protect every sale from one calm Tsenga inbox.</Subtitle>
          </div>
          <HeroActions>
            <Button type="button" onClick={() => navigate('/seller/dashboard')}>Dashboard</Button>
            <Button type="button" onClick={markAllRead} disabled={messages.unreadCount === 0}>Mark all read</Button>
            <Button $primary type="button" onClick={() => navigate('/seller/orders')}>View orders</Button>
          </HeroActions>
        </Hero>

        <Layout>
          <Panel>
            <SearchBar
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search buyer, product, or message"
              aria-label="Search seller messages"
            />
            {loading ? (
              <EmptyState>Loading messages...</EmptyState>
            ) : filteredMessages.length === 0 ? (
              <EmptyState>No conversations match this search.</EmptyState>
            ) : filteredMessages.map(message => (
              <ConversationButton
                key={message.id}
                type="button"
                $active={activeMessage?.id === message.id}
                onClick={() => markRead(message.id)}
              >
                <Avatar $unread={!message.isRead}>{getInitials(message.customerName)}</Avatar>
                <ConversationMeta>
                  <Name>{message.customerName}</Name>
                  <Preview>{message.preview}</Preview>
                </ConversationMeta>
                <Chip $unread={!message.isRead}>{message.isRead ? formatTime(message.timestamp) : 'New'}</Chip>
              </ConversationButton>
            ))}
          </Panel>

          <Panel>
            {activeMessage ? (
              <>
                <ThreadHeader>
                  <div>
                    <Name>{activeMessage.customerName}</Name>
                    <ProductText>{activeMessage.productName || 'General buyer conversation'}</ProductText>
                  </div>
                  <Chip $unread={!activeMessage.isRead}>{activeMessage.type || 'message'}</Chip>
                </ThreadHeader>
                <ThreadBody>
                  {(activeMessage.thread || []).map(item => (
                    <Bubble key={item.id} $seller={item.from === 'seller'}>
                      {item.body}
                    </Bubble>
                  ))}
                </ThreadBody>
                <Composer onSubmit={sendReply}>
                  <Textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Write a helpful reply"
                    aria-label="Reply to buyer"
                  />
                  <Button $primary type="submit" disabled={sending || !reply.trim()}>
                    {sending ? 'Sending' : 'Send reply'}
                  </Button>
                </Composer>
              </>
            ) : (
              <EmptyState>Select a conversation to reply.</EmptyState>
            )}
          </Panel>
        </Layout>
      </Shell>
      <BottomNavigation currentPath="/seller/messages" />
    </Page>
  );
};
