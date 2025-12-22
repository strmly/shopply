import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.3s ease-in;
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  font-weight: 700;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  position: relative;
  padding-left: ${props => props.theme.spacing.md};
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 15px;
  top: 24px;
  bottom: 24px;
  width: 2px;
  background: ${props => props.theme.colors.border.default};
  z-index: 0;
`;

const Step = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  position: relative;
  z-index: 1;
  animation: ${slideIn} 0.3s ease-out;
  animation-delay: ${props => props.$delay || 0}s;
  animation-fill-mode: both;
`;

const StepIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.radii.circle};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
  background: ${props => {
    if (props.$status === 'completed') return props.theme.colors.success[500];
    if (props.$status === 'current') return props.theme.colors.primary;
    if (props.$status === 'error') return props.theme.colors.danger[500];
    return props.theme.colors.neutral[200];
  }};
  color: ${props => {
    if (props.$status === 'completed' || props.$status === 'current' || props.$status === 'error') {
      return props.theme.colors.text.inverse;
    }
    return props.theme.colors.text.secondary;
  }};
  border: 2px solid ${props => {
    if (props.$status === 'pending') return props.theme.colors.neutral[300];
    return 'transparent';
  }};
  
  ${props => props.$status === 'current' && `
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.05);
      }
    }
  `}
`;

const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  padding-top: 4px;
`;

const StepLabel = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
`;

const StepDescription = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const StepTimestamp = styled.div`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 12px;
  margin-top: ${props => props.theme.spacing.xs};
`;

const Explanation = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.info[100]};
  border-radius: ${props => props.theme.radii.md};
  border-left: 3px solid ${props => props.theme.colors.info[500]};
`;

const ExplanationText = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
`;

const HelpLink = styled.button`
  margin-top: ${props => props.theme.spacing.sm};
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  ${props => props.theme.typography.body2}
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  
  &:hover {
    color: ${props => props.theme.colors.primaryHover};
  }
`;

const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const getStepIcon = (status) => {
  if (status === 'completed') return '✓';
  if (status === 'current') return '⟳';
  if (status === 'error') return '✕';
  return '○';
};

const getExplanation = (returnItem) => {
  const status = returnItem.status;
  
  if (status === 'refund_processing' || status === 'item_received') {
    return {
      text: `Your item has been received by the seller. Refunds usually take 3-5 business days to reflect on your ${returnItem.refundMethod === 'wallet' ? 'wallet' : 'card'}.`,
      nextStep: 'Refund processing',
      responsible: 'Payment processor',
    };
  }
  
  if (status === 'approved') {
    return {
      text: 'Your return has been approved. A courier will pick up the item soon.',
      nextStep: 'Item pickup',
      responsible: 'Courier',
    };
  }
  
  if (status === 'pending') {
    return {
      text: 'Your return request is being reviewed by the seller. This usually takes 1-2 business days.',
      nextStep: 'Seller approval',
      responsible: 'Seller',
    };
  }
  
  return {
    text: 'Your return is being processed. We\'ll keep you updated on the progress.',
    nextStep: 'Processing',
    responsible: 'System',
  };
};

export const TimelineStepper = ({ returnItem, onReturnClick }) => {
  if (!returnItem || !returnItem.timeline) {
    return null;
  }

  const timeline = returnItem.timeline || [];
  const explanation = getExplanation(returnItem);

  return (
    <Container>
      <Title>What's happening?</Title>
      <Timeline>
        <TimelineLine />
        {timeline.map((step, index) => {
          const isLast = index === timeline.length - 1;
          const status = step.status || 'pending';
          
          return (
            <Step key={step.id || index} $delay={index * 0.1}>
              <StepIcon $status={status}>
                {getStepIcon(status)}
              </StepIcon>
              <StepContent>
                <StepLabel>{step.label}</StepLabel>
                {step.description && (
                  <StepDescription>{step.description}</StepDescription>
                )}
                {step.timestamp && (
                  <StepTimestamp>{formatTimestamp(step.timestamp)}</StepTimestamp>
                )}
              </StepContent>
            </Step>
          );
        })}
      </Timeline>
      
      <Explanation>
        <ExplanationText>
          {explanation.text}
        </ExplanationText>
        <HelpLink onClick={() => {
          // In a real app, this would open a help bottom sheet
          alert('Refunds take time because:\n• Banks need time to process reversals\n• Processing time depends on your payment method\n\nTypical timelines:\n• Card refunds: 3-5 business days\n• Wallet refunds: within 24 hours');
        }}>
          Where is my refund?
        </HelpLink>
      </Explanation>
    </Container>
  );
};

