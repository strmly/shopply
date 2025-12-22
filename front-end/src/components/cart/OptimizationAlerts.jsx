import styled, { keyframes } from 'styled-components';
import { fadeIn } from '../../theme/animations';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const Container = styled.section`
  padding: ${props => props.theme.spacing.xl};
  animation: ${fadeIn} 0.3s ease-in;
`;

const AlertCard = styled.div`
  background: ${props => {
    if (props.priority === 'high') return props.theme.colors.warningSoftBg;
    return props.theme.colors.info[50] || props.theme.colors.primarySoftBg;
  }};
  border: 2px solid ${props => {
    if (props.priority === 'high') return props.theme.colors.warningBase;
    return props.theme.colors.info[500] || props.theme.colors.primary;
  }};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  animation: ${pulse} 2s ease-in-out infinite;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const AlertIcon = styled.span`
  font-size: 24px;
  flex-shrink: 0;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  ${props => props.theme.typography.body1}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
`;

const AlertMessage = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  line-height: 1.4;
`;

const AlertButton = styled.button`
  width: 100%;
  margin-top: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => {
    if (props.priority === 'high') return props.theme.colors.warningBase;
    return props.theme.colors.info[500] || props.theme.colors.primary;
  }};
  color: ${props => props.theme.colors.text.inverse};
  border: none;
  border-radius: ${props => props.theme.radii.md};
  ${props => props.theme.typography.button}
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  font-size: 14px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

export const OptimizationAlerts = ({ suggestions, onAction }) => {
  if (!suggestions || suggestions.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'delivery_optimization': return '🚚';
      case 'low_stock': return '⚠️';
      case 'price_savings': return '💰';
      case 'quantity_prompt': return '📦';
      case 'missing_essentials': return '💡';
      default: return '💡';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'optimize_delivery': return 'Optimize Cart';
      case 'replace_item': return 'Replace Item';
      case 'switch_store': return 'Switch Store';
      case 'view_offer': return 'View Offer';
      case 'add_essentials': return 'Add Essentials';
      default: return 'Take Action';
    }
  };

  return (
    <Container>
      {suggestions.map((suggestion, index) => (
        <AlertCard key={index} priority={suggestion.priority}>
          <AlertHeader>
            <AlertIcon>{getIcon(suggestion.type)}</AlertIcon>
            <AlertContent>
              <AlertTitle>{suggestion.title}</AlertTitle>
              <AlertMessage>{suggestion.message}</AlertMessage>
            </AlertContent>
          </AlertHeader>
          <AlertButton
            priority={suggestion.priority}
            onClick={() => onAction && onAction(suggestion.action, suggestion)}
          >
            {getActionText(suggestion.action)}
          </AlertButton>
        </AlertCard>
      ))}
    </Container>
  );
};











