import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fadeIn } from '../../theme/animations';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  animation: ${fadeIn} 0.3s ease-in;
  position: relative;
  
  ${props => props.$hasIssue && `
    border-color: ${props.theme.colors.warning[300]};
    background: ${props.theme.colors.warning[100]};
  `}
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CardContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => props.theme.colors.primarySoftBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Title = styled.div`
  ${props => props.theme.typography.body1}
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
`;

const Subtext = styled.div`
  ${props => props.theme.typography.body2}
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const Badge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  background: ${props => {
    if (props.$hasIssue) return props.theme.colors.danger[500];
    if (props.$color === 'green') return props.theme.colors.success[500];
    return props.theme.colors.primary;
  }};
  color: ${props => props.theme.colors.text.inverse};
  border-radius: ${props => props.theme.radii.circle};
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  padding: 0 ${props => props.theme.spacing.xs};
  
  ${props => props.$hasIssue && !props.$count && `
    width: 8px;
    height: 8px;
    min-width: 8px;
    padding: 0;
  `}
`;

const Chevron = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 18px;
  flex-shrink: 0;
`;

import API_BASE_URL from '@config/api';

export const OrdersQuickActionCard = ({ userId = 'default' }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [userId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/my-orders/user/${userId}/summary`);
      
      if (!response.ok) {
        // Silently handle 404s - endpoint may not be available
        if (response.status === 404) {
          setSummary({
            totalOrders: 0,
            activeCount: 0,
            needsAttentionCount: 0,
            subtext: 'No orders yet',
            badgeCount: null,
            hasIssue: false,
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      // Only log non-404 errors
      if (!error.message.includes('404')) {
        console.error('Error loading order summary:', error);
      }
      // Set default summary on error
      setSummary({
        totalOrders: 0,
        activeCount: 0,
        needsAttentionCount: 0,
        subtext: 'No orders yet',
        badgeCount: null,
        hasIssue: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <Card onClick={handleClick}>
        <CardContent>
          <IconWrapper>🧾</IconWrapper>
          <TextContent>
            <Title>My Orders</Title>
            <Subtext>Loading...</Subtext>
          </TextContent>
          <Chevron>›</Chevron>
        </CardContent>
      </Card>
    );
  }

  const displaySummary = summary || {
    totalOrders: 0,
    activeCount: 0,
    needsAttentionCount: 0,
    subtext: 'No orders yet',
    badgeCount: null,
    hasIssue: false,
  };

  const badgeColor = displaySummary.hasIssue 
    ? 'red' 
    : displaySummary.activeCount > 0 
      ? 'blue' 
      : 'green';

  return (
    <Card 
      onClick={handleClick}
      $hasIssue={displaySummary.hasIssue}
    >
      <CardContent>
        <IconWrapper>
          {displaySummary.hasIssue ? '⚠️' : '🧾'}
        </IconWrapper>
        <TextContent>
          <Title>My Orders</Title>
          <Subtext>{displaySummary.subtext}</Subtext>
        </TextContent>
        {(displaySummary.badgeCount !== null || displaySummary.hasIssue) && (
          <Badge 
            $count={displaySummary.badgeCount}
            $hasIssue={displaySummary.hasIssue}
            $color={badgeColor}
          >
            {displaySummary.hasIssue && !displaySummary.badgeCount ? '' : displaySummary.badgeCount}
          </Badge>
        )}
        <Chevron>›</Chevron>
      </CardContent>
    </Card>
  );
};

