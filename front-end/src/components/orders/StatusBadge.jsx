import styled from 'styled-components';

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  box-shadow: 0 10px 20px rgba(16, 24, 40, 0.05);
  
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
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 10px;
  font-weight: 900;
`;

export const StatusBadge = ({ status, color = 'blue', isUrgent = false, icon, children }) => {
  const marker = String(children || status || 'O').trim().slice(0, 1).toUpperCase();

  return (
    <Badge color={color} $isUrgent={isUrgent}>
      <Icon>{marker}</Icon>
      {children || status}
    </Badge>
  );
};

