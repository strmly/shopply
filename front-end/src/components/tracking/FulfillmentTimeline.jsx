import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  position: relative;
  padding-left: ${props => props.theme.spacing.md};
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 19px;
    top: 32px;
    width: 2px;
    height: calc(100% + ${props => props.theme.spacing.md});
    background: ${props => {
      if (props.status === 'completed') return props.theme.colors.successBase;
      if (props.status === 'active') return props.theme.colors.primary;
      return props.theme.colors.border.light;
    }};
  }
`;

const Icon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  background: ${props => {
    if (props.status === 'completed') return props.theme.colors.successBase;
    if (props.status === 'active') return props.theme.colors.primary;
    return props.theme.colors.surface;
  }};
  color: ${props => {
    if (props.status === 'completed' || props.status === 'active') return props.theme.colors.text.inverse;
    return props.theme.colors.text.tertiary;
  }};
  border: 2px solid ${props => {
    if (props.status === 'completed') return props.theme.colors.successBase;
    if (props.status === 'active') return props.theme.colors.primary;
    return props.theme.colors.border.light;
  }};
`;

const Content = styled.div`
  flex: 1;
  padding-top: 4px;
`;

const EventTitle = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => {
    if (props.status === 'completed' || props.status === 'active') return props.theme.colors.text.primary;
    return props.theme.colors.text.secondary;
  }};
  font-weight: ${props => props.status === 'active' ? 700 : 600};
  font-size: 14px;
  margin-bottom: 2px;
`;

const EventDescription = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  margin-bottom: 4px;
`;

const EventTime = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 11px;
`;

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const FulfillmentTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  return (
    <Card>
      <Title>📋 Fulfillment Timeline</Title>
      
      <Timeline>
        {timeline.map((event, index) => (
          <TimelineItem key={event.id || index} status={event.status}>
            <Icon status={event.status}>{event.icon || '•'}</Icon>
            <Content>
              <EventTitle status={event.status}>{event.title}</EventTitle>
              {event.description && (
                <EventDescription>{event.description}</EventDescription>
              )}
              <EventTime>{formatTime(event.timestamp)}</EventTime>
            </Content>
          </TimelineItem>
        ))}
      </Timeline>
    </Card>
  );
};











