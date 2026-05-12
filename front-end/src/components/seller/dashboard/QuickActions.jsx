import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing.lg};
  border: 2px solid ${props => props.theme.colors.border.light};
  animation: ${fadeIn} 0.4s ease-out;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Title = styled.h3`
  ${props => props.theme.typography.heading3}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 700;
  font-size: 18px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => 
    props.$highlight 
      ? props.theme.colors.primary 
      : props.theme.colors.border.light};
  border-radius: ${props => props.theme.radii.xl};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  min-height: 110px;
  position: relative;
  box-shadow: ${props => props.theme.shadows.sm};

  ${props => props.$highlight && `
    box-shadow: 0 0 0 4px ${props.theme.colors.primarySoftBg};
  `}

  ${props => props.$glow && `
    animation: glow 2s ease-in-out infinite;
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 0 4px ${props.theme.colors.primarySoftBg};
      }
      50% {
        box-shadow: 0 0 0 8px ${props.theme.colors.primarySoftBg};
      }
    }
  `}

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const ActionIcon = styled.div`
  font-size: 40px;
  line-height: 1;
`;

const ActionLabel = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 600;
  font-size: 14px;
  text-align: center;
`;

const HighlightBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: ${props => props.theme.shadows.md};
`;

export const QuickActions = ({ 
  navigate, 
  productCount = 0,
  isStoreClosed = false 
}) => {
  const [actions, setActions] = useState([
    { 
      icon: '📦', 
      label: 'Manage Products', 
      route: '/seller/products',
      highlight: productCount === 0,
      glow: productCount === 0,
    },
    { 
      icon: '➕', 
      label: 'Add Product', 
      route: '/seller/products/new',
    },
    { 
      icon: '🎯', 
      label: 'Promotions', 
      route: '/seller/promotions',
    },
    { 
      icon: '🏪', 
      label: 'View Store', 
      route: '/seller/store',
    },
    { 
      icon: '⏰', 
      label: 'Manage Hours', 
      route: '/seller/settings/hours',
      glow: isStoreClosed,
    },
  ]);

  useEffect(() => {
    // Reorder actions based on context
    const reordered = [...actions].sort((a, b) => {
      // Highlighted actions first
      if (a.highlight && !b.highlight) return -1;
      if (!a.highlight && b.highlight) return 1;
      // Glowing actions next
      if (a.glow && !b.glow) return -1;
      if (!a.glow && b.glow) return 1;
      return 0;
    });
    setActions(reordered);
  }, [productCount, isStoreClosed]);

  const handleActionClick = (route) => {
    if (navigate) {
      navigate(route);
    }
  };

  return (
    <Container>
      <Title>Quick Actions</Title>
      <ActionsGrid>
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            $highlight={action.highlight}
            $glow={action.glow}
            onClick={() => handleActionClick(action.route)}
            aria-label={action.label}
            type="button"
          >
            {action.highlight && <HighlightBadge>!</HighlightBadge>}
            <ActionIcon>{action.icon}</ActionIcon>
            <ActionLabel>{action.label}</ActionLabel>
            {action.glow && action.label === 'Manage Hours' && (
              <div style={{
                fontSize: '11px',
                color: '#F59E0B',
                fontWeight: 600,
                marginTop: '-4px',
              }}>
                Store closed
              </div>
            )}
          </ActionButton>
        ))}
      </ActionsGrid>
    </Container>
  );
};
