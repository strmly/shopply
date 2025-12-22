import React from 'react';
import styled from 'styled-components';

/**
 * WhyThisBadges Component
 * Displays "why this product" reason badges
 */
const WhyThisBadges = ({ reasons = [], maxShow = 3 }) => {
  if (!reasons || reasons.length === 0) return null;

  const displayReasons = reasons.slice(0, maxShow);

  return (
    <Container>
      {displayReasons.map((reason, index) => (
        <Badge key={index}>
          {getIconForReason(reason)}
          {reason}
        </Badge>
      ))}
    </Container>
  );
};

// Get appropriate icon for each reason type
const getIconForReason = (reason) => {
  const lowerReason = reason.toLowerCase();
  
  if (lowerReason.includes('close') || lowerReason.includes('nearby')) {
    return '📍 ';
  }
  if (lowerReason.includes('top-rated') || lowerReason.includes('highly rated')) {
    return '⭐ ';
  }
  if (lowerReason.includes('stock') || lowerReason.includes('left')) {
    return '📦 ';
  }
  if (lowerReason.includes('new')) {
    return '✨ ';
  }
  if (lowerReason.includes('service')) {
    return '🏆 ';
  }
  
  return '✓ ';
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: ${props => props.theme?.colors?.backgroundSecondary || '#f5f5f5'};
  color: ${props => props.theme?.colors?.text || '#333'};
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
`;

export default WhyThisBadges;

