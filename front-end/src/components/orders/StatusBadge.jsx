import styled from 'styled-components';

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.md};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  
  ${props => {
    const colorMap = {
      blue: {
        bg: props.theme.colors.info[100],
        color: props.theme.colors.info[600],
        border: props.theme.colors.info[300],
      },
      green: {
        bg: props.theme.colors.success[100],
        color: props.theme.colors.success[600],
        border: props.theme.colors.success[300],
      },
      amber: {
        bg: props.theme.colors.warning[100],
        color: props.theme.colors.warning[600],
        border: props.theme.colors.warning[300],
      },
      red: {
        bg: props.theme.colors.danger[100],
        color: props.theme.colors.danger[600],
        border: props.theme.colors.danger[300],
      },
    };
    
    const colors = colorMap[props.color] || colorMap.blue;
    
    return `
      background: ${colors.bg};
      color: ${colors.color};
      border: 1px solid ${colors.border};
    `;
  }}
  
  ${props => props.$isUrgent && `
    animation: pulse 2s ease-in-out infinite;
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `}
`;

const Icon = styled.span`
  font-size: 14px;
`;

export const StatusBadge = ({ status, color = 'blue', isUrgent = false, icon, children }) => {
  return (
    <Badge color={color} $isUrgent={isUrgent}>
      {icon && <Icon>{icon}</Icon>}
      {children || status}
    </Badge>
  );
};

