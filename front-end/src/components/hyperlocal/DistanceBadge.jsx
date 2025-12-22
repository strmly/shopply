import React from 'react';
import styled from 'styled-components';

/**
 * DistanceBadge Component
 * Displays distance from user with locality information
 */
const DistanceBadge = ({ distanceKm, distanceDisplay, compact = false }) => {
  if (!distanceKm && !distanceDisplay) return null;

  const displayText = distanceDisplay || `${distanceKm.toFixed(1)}km`;
  const isNearby = distanceKm < 1;

  return (
    <Badge compact={compact} nearby={isNearby}>
      <Icon>📍</Icon>
      {displayText}
    </Badge>
  );
};

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: ${props => props.compact ? '3px 8px' : '4px 10px'};
  background: ${props => props.nearby 
    ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
    : 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
  };
  color: white;
  border-radius: 12px;
  font-size: ${props => props.compact ? '11px' : '12px'};
  font-weight: 600;
  white-space: nowrap;
`;

const Icon = styled.span`
  font-size: ${props => props.compact ? '10px' : '11px'};
`;

export default DistanceBadge;

