import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  position: relative;
  padding-left: ${props => props.theme.spacing.lg};
  
  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${props => props.theme.colors.border.default};
  }
`;

const TimelineItem = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  
  &::before {
    content: '';
    position: absolute;
    left: -24px;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: ${props => props.theme.radii.circle};
    background: ${props => {
      if (props.$isActive) return props.theme.colors.primary;
      if (props.$isCompleted) return props.theme.colors.success[500];
      return props.theme.colors.border.default;
    }};
    border: 2px solid ${props => props.theme.colors.background};
    z-index: 1;
  }
`;

const TimelineLabel = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
`;

const TimelineDescription = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const TimelineTime = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 11px;
  margin-top: 2px;
`;

export const OrderTimeline = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Find the latest completed event
  const latestIndex = timeline.length - 1;

  return (
    <Container>
      <Title>Order Timeline</Title>
      <TimelineList>
        {timeline.map((event, index) => {
          const isCompleted = index <= latestIndex;
          const isActive = index === latestIndex;
          
          return (
            <TimelineItem 
              key={event.event || index}
              $isCompleted={isCompleted}
              $isActive={isActive}
            >
              <TimelineLabel>{event.label || 'Status Update'}</TimelineLabel>
              <TimelineDescription>
                {event.description || 'Order status updated'}
              </TimelineDescription>
              <TimelineTime>{formatTime(event.timestamp)}</TimelineTime>
            </TimelineItem>
          );
        })}
      </TimelineList>
    </Container>
  );
};

