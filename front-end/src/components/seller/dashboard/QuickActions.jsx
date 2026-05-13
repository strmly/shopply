import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fadeIn } from '../../../theme/animations';

const Container = styled.div`
  background: #ffffff;
  border-radius: 24px;
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid rgba(228, 231, 236, 0.92);
  animation: ${fadeIn} 0.4s ease-out;
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.08);
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 800;
  font-size: 18px;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button`
  min-height: 112px;
  padding: 16px;
  background: ${props => props.$highlight ? props.theme.colors.primarySoftBg : props.theme.colors.gradient.soft};
  border: 1px solid ${props => props.$highlight ? props.theme.colors.primary : 'rgba(61, 129, 239, 0.12)'};
  border-radius: 20px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  text-align: left;
  display: grid;
  align-content: space-between;
  gap: 12px;
  position: relative;
  box-shadow: 0 12px 26px rgba(16, 24, 40, 0.06);

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 18px 34px rgba(16, 24, 40, 0.1);
  }
`;

const ActionIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: ${props => props.theme.colors.gradient.primary};
  color: #ffffff;
  font-size: 13px;
  font-weight: 950;
  box-shadow: 0 12px 24px rgba(61, 129, 239, 0.2);
`;

const ActionLabel = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-weight: 850;
  font-size: 14px;
  line-height: 1.2;
`;

const Helper = styled.div`
  color: ${props => props.$warning ? props.theme.colors.warningBase : props.theme.colors.text.secondary};
  font-size: 11px;
  font-weight: 800;
  line-height: 1.3;
`;

const HighlightBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${props => props.theme.colors.gradient.primary};
  color: white;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 950;
`;

export const QuickActions = ({
  navigate,
  productCount = 0,
  isStoreClosed = false,
}) => {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    const baseActions = [
      {
        icon: 'PR',
        label: 'Manage Products',
        helper: productCount === 0 ? 'Add your first listing' : `${productCount} products live`,
        route: '/seller/products',
        highlight: productCount === 0,
      },
      {
        icon: 'AD',
        label: 'Add Product',
        helper: 'Create a new listing',
        route: '/seller/products/new',
      },
      {
        icon: 'PM',
        label: 'Promotions',
        helper: 'Deals, bundles, campaigns',
        route: '/seller/promotions',
      },
      {
        icon: 'ST',
        label: 'View Store',
        helper: 'Preview buyer storefront',
        route: '/seller/store',
      },
      {
        icon: 'HR',
        label: 'Manage Hours',
        helper: isStoreClosed ? 'Store currently closed' : 'Keep availability fresh',
        route: '/seller/settings/hours',
        highlight: isStoreClosed,
        warning: isStoreClosed,
      },
      {
        icon: 'MS',
        label: 'Messages',
        helper: 'Reply to buyers',
        route: '/seller/messages',
      },
    ];

    setActions(baseActions.sort((a, b) => {
      if (a.highlight && !b.highlight) return -1;
      if (!a.highlight && b.highlight) return 1;
      return 0;
    }));
  }, [productCount, isStoreClosed]);

  return (
    <Container>
      <Title>Quick Actions</Title>
      <ActionsGrid>
        {actions.map((action) => (
          <ActionButton
            key={action.route}
            $highlight={action.highlight}
            onClick={() => navigate?.(action.route)}
            aria-label={action.label}
            type="button"
          >
            {action.highlight && <HighlightBadge>Now</HighlightBadge>}
            <ActionIcon>{action.icon}</ActionIcon>
            <div>
              <ActionLabel>{action.label}</ActionLabel>
              <Helper $warning={action.warning}>{action.helper}</Helper>
            </div>
          </ActionButton>
        ))}
      </ActionsGrid>
    </Container>
  );
};
