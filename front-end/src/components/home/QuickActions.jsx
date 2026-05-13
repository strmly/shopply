import styled from 'styled-components';

const Container = styled.div`
  padding: 0 clamp(14px, 5vw, 48px);
  margin: -18px auto ${props => props.theme.spacing.xl};
  position: relative;
  z-index: 2;

  @media (max-width: 760px) {
    margin-top: -10px;
  }

  @media (max-width: 420px) {
    margin-top: -4px;
  }
`;

const ActionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 420px) {
    gap: 10px;
  }
`;

const ActionItem = styled.button`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.88)) padding-box,
    linear-gradient(140deg, ${props => props.$accent}44, rgba(196,184,252,0.18), rgba(255,255,255,0.8)) border-box;
  border: 1px solid transparent;
  border-radius: 22px;
  padding: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  box-shadow: 0 18px 38px rgba(16, 24, 40, 0.09);
  min-width: 0;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 14px;
    min-height: 132px;
  }

  &:hover {
    border-color: ${props => props.$accent || props.theme.colors.primary};
    transform: translateY(-5px);
    box-shadow: 0 26px 54px rgba(16, 24, 40, 0.14);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ActionIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 15px;
  background: ${props => props.$color};
  border: 1px solid rgba(255,255,255,0.72);
  color: ${props => props.$accent || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  letter-spacing: 0;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);

  @media (max-width: 420px) {
    width: 38px;
    height: 38px;
    border-radius: 14px;
  }
`;

const ActionText = styled.div`
  min-width: 0;
  text-align: left;
`;

const ActionLabel = styled.span`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.primary};
  font-weight: 900;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionHint = styled.span`
  ${props => props.theme.typography.caption}
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 800;
  display: block;
  overflow-wrap: anywhere;
`;

const QUICK_ACTIONS = [
  { icon: 'L', label: 'Living Room', hint: 'Sofas and tables', route: '/category/living', color: '#E8F1FF', accent: '#3D81EF' },
  { icon: 'B', label: 'Bedroom', hint: 'Beds and storage', route: '/category/bedroom', color: '#F3F0FE', accent: '#7C3AED' },
  { icon: '%', label: 'Deals', hint: 'Limited offers', route: '/deals', color: '#FEF7E3', accent: '#B35A05' },
  { icon: 'N', label: 'New Arrivals', hint: 'Fresh drops', route: '/new', color: '#DBF8EE', accent: '#118264' },
];

export const QuickActions = ({ onActionClick }) => {
  return (
    <Container>
      <ActionsList>
        {QUICK_ACTIONS.map((action) => (
          <ActionItem
            key={action.label}
            $accent={action.accent}
            onClick={() => onActionClick && onActionClick(action)}
          >
            <ActionIcon $color={action.color} $accent={action.accent}>
              {action.icon}
            </ActionIcon>
            <ActionText>
              <ActionLabel>{action.label}</ActionLabel>
              <ActionHint>{action.hint}</ActionHint>
            </ActionText>
          </ActionItem>
        ))}
      </ActionsList>
    </Container>
  );
};
