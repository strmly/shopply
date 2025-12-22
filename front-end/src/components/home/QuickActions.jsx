import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Container = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  margin-bottom: ${props => props.theme.spacing.lg};
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ActionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
  max-width: 900px;
  
  /* Ensure even spacing on all screen sizes */
  @media (max-width: 479px) {
    gap: ${props => props.theme.spacing.sm};
  }
  
  @media (min-width: 480px) and (max-width: 767px) {
    gap: ${props => props.theme.spacing.md};
  }
  
  @media (min-width: 768px) {
    gap: ${props => props.theme.spacing.lg};
  }
`;

const ActionItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  width: ${props => props.theme.spacing.xxl * 2};
  min-width: ${props => props.theme.spacing.xxl * 2};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  flex-shrink: 0;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.sm};
  }

  &:active {
    transform: translateY(0);
  }
  
  /* Responsive sizing */
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    width: ${props => props.theme.spacing.xxl * 2.25};
    min-width: ${props => props.theme.spacing.xxl * 2.25};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    width: ${props => props.theme.spacing.xxl * 2.5};
    min-width: ${props => props.theme.spacing.xxl * 2.5};
  }
`;

const ActionIcon = styled.div`
  font-size: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ActionLabel = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  text-align: center;
`;

const QUICK_ACTIONS = [
  // Furniture room quick links
  { icon: '🛋️', label: 'Living Room', route: '/category/living' },
  { icon: '🛏️', label: 'Bedroom', route: '/category/bedroom' },
  
  // Furniture discovery shortcuts
  { icon: '🔥', label: 'Trending', route: '/hot' },
  { icon: '💰', label: 'Deals', route: '/deals' },
  { icon: '📦', label: 'Bundles', route: '/bundles' },
  { icon: '⚡', label: 'Fast Delivery', route: '/fast-delivery' },
  { icon: '🆕', label: 'New Arrivals', route: '/new' },
  { icon: '🌳', label: 'Outdoor', route: '/category/outdoor' },
];

export const QuickActions = ({ onActionClick }) => {
  return (
    <Container>
      <ActionsList>
        {QUICK_ACTIONS.map((action, index) => (
          <ActionItem
            key={index}
            onClick={() => onActionClick && onActionClick(action)}
          >
            <ActionIcon>{action.icon}</ActionIcon>
            <ActionLabel>{action.label}</ActionLabel>
          </ActionItem>
        ))}
      </ActionsList>
    </Container>
  );
};

