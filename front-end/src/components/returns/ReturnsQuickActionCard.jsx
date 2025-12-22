import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.light};
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  animation: ${slideInRight} 0.4s ease-out;
  position: relative;
  overflow: hidden;
  
  ${props => props.$hasIssue && `
    border-color: ${props.theme.colors.danger[300]};
    background: linear-gradient(135deg, ${props.theme.colors.danger[100]} 0%, ${props.theme.colors.warning[100]} 100%);
    box-shadow: 0 4px 12px rgba(198, 40, 80, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: ${props.theme.colors.danger[500]};
    }
  `}
  
  ${props => props.$activeCount > 0 && !props.$hasIssue && `
    border-color: ${props.theme.colors.info[300]};
  `}
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
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
  font-size: 28px;
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
    if (props.$color === 'yellow') return props.theme.colors.warning[500];
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: ${props => props.theme.transitions.swift};
  
  ${props => props.$hasIssue && !props.$count && `
    width: 8px;
    height: 8px;
    min-width: 8px;
    padding: 0;
    animation: ${pulse} 2s infinite;
  `}
  
  ${props => props.$count && props.$count > 0 && `
    animation: ${pulse} 2s infinite;
  `}
`;

const Chevron = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 18px;
  flex-shrink: 0;
`;

import API_BASE_URL from '@config/api';

export const ReturnsQuickActionCard = ({ userId = 'default' }) => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
    
    // Refresh summary every 30 seconds
    const interval = setInterval(() => {
      loadSummary();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/returns/user/${userId}/summary`);
      
      if (!response.ok) {
        // Silently handle 404s - endpoint may not be available
        if (response.status === 404) {
          setSummary({
            totalReturns: 0,
            activeCount: 0,
            actionRequiredCount: 0,
            completedCount: 0,
            subtext: 'No returns yet',
            badgeStatus: null,
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
        console.error('Error loading return summary:', error);
      }
      // Set default summary on error
      setSummary({
        totalReturns: 0,
        activeCount: 0,
        actionRequiredCount: 0,
        completedCount: 0,
        subtext: 'No returns yet',
        badgeStatus: null,
        hasIssue: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate('/returns');
  };

  if (loading) {
    return (
      <Card onClick={handleClick}>
        <CardContent>
          <IconWrapper>🔄</IconWrapper>
          <TextContent>
            <Title>Returns & Refunds</Title>
            <Subtext>Loading...</Subtext>
          </TextContent>
          <Chevron>›</Chevron>
        </CardContent>
      </Card>
    );
  }

  const displaySummary = summary || {
    totalReturns: 0,
    activeCount: 0,
    actionRequiredCount: 0,
    completedCount: 0,
    subtext: 'No returns yet',
    badgeStatus: null,
    hasIssue: false,
  };

  const badgeColor = displaySummary.hasIssue 
    ? 'red' 
    : displaySummary.badgeStatus?.color === 'green'
      ? 'green'
      : displaySummary.badgeStatus?.color === 'yellow'
        ? 'yellow'
        : null;

  return (
    <Card 
      onClick={handleClick}
      $hasIssue={displaySummary.hasIssue}
      $activeCount={displaySummary.activeCount}
    >
      <CardContent>
        <IconWrapper>
          {displaySummary.hasIssue ? '⚠️' : '🔄'}
        </IconWrapper>
        <TextContent>
          <Title>Returns & Refunds</Title>
          <Subtext>{displaySummary.subtext}</Subtext>
        </TextContent>
        {(displaySummary.activeCount > 0 || displaySummary.hasIssue) && (
          <Badge 
            $count={displaySummary.activeCount}
            $hasIssue={displaySummary.hasIssue}
            $color={badgeColor}
          >
            {displaySummary.hasIssue && !displaySummary.activeCount ? '' : displaySummary.activeCount}
          </Badge>
        )}
        <Chevron>›</Chevron>
      </CardContent>
    </Card>
  );
};

